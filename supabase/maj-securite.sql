-- =====================================================================
--  Pièce Fenua — correctif sécurité (audit du 6 novembre 2026)
--  À exécuter une fois dans Supabase : SQL Editor → New query → Run
--  (déjà inclus dans schema.sql pour une nouvelle installation)
-- =====================================================================

-- 1. Demandes groupées : seuls les pros et casses dont l'identité est vérifiée
--    voient les demandes (et donc les numéros de téléphone des demandeurs).
drop policy if exists "demandes: lecture" on public.demandes;
create policy "demandes: lecture" on public.demandes for select using (
  owner = auth.uid() or public.is_moderateur()
  or exists (select 1 from public.profiles p
              where p.id = auth.uid() and p.type in ('pro','casse')
                and p.id_statut = 'verifie' and not p.suspendu)
);

-- 2. Photos des annonces : l'adresse doit pointer vers le stockage de ce projet,
--    dans le dossier du vendeur. Impossible d'afficher une image externe.
create or replace function public.photo_url_valide()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.photo_url is not null and auth.uid() is not null and not public.is_moderateur() then
    if new.photo_url !~ ('^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/photos/'
                         || auth.uid()::text || '/[A-Za-z0-9._-]+$') then
      raise exception 'Adresse de photo refusée.';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists annonces_photo_check on public.annonces;
create trigger annonces_photo_check before insert or update of photo_url on public.annonces
  for each row execute function public.photo_url_valide();

-- 3. Profil : un membre ne peut écrire que sa propre ligne (clause with check).
drop policy if exists "profil: modifier le sien" on public.profiles;
create policy "profil: modifier le sien" on public.profiles for update
  using (id = auth.uid() or public.is_moderateur())
  with check (id = auth.uid() or public.is_moderateur());

-- 4. Limites journalières par compte, contre les abus et le spam.
create or replace function public.limite_journaliere()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int; maxi int; col text;
begin
  if auth.uid() is null or public.is_moderateur() then return new; end if;
  if tg_table_name = 'annonces' then maxi := 50; col := 'owner';
  elsif tg_table_name = 'reservations' then maxi := 20; col := 'acheteur';
  elsif tg_table_name = 'signalements' then maxi := 10; col := 'owner';
  elsif tg_table_name = 'demandes' then maxi := 10; col := 'owner';
  else return new; end if;
  execute format('select count(*) from public.%I where %I = $1 and created_at > now() - interval ''1 day''',
                 tg_table_name, col) into n using auth.uid();
  if n >= maxi then
    raise exception 'Limite atteinte : % par jour. Réessaie demain.', maxi;
  end if;
  return new;
end $$;
drop trigger if exists annonces_limite on public.annonces;
create trigger annonces_limite before insert on public.annonces
  for each row execute function public.limite_journaliere();
drop trigger if exists reservations_limite on public.reservations;
create trigger reservations_limite before insert on public.reservations
  for each row execute function public.limite_journaliere();
drop trigger if exists signalements_limite on public.signalements;
create trigger signalements_limite before insert on public.signalements
  for each row execute function public.limite_journaliere();
drop trigger if exists demandes_limite on public.demandes;
create trigger demandes_limite before insert on public.demandes
  for each row execute function public.limite_journaliere();
