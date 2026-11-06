-- =====================================================================
--  Pièce Fenua — mise à jour « Mes pièces » + « Commandes »
--  À exécuter une fois dans Supabase : SQL Editor → New query → Run
--  (déjà inclus dans schema.sql pour une nouvelle installation)
-- =====================================================================

-- ---------- Le vendeur peut modifier SES annonces (prix, stock, description) ----------
create or replace function public.annonce_avant_update()
returns trigger language plpgsql set search_path = public as $$
begin
  new.serie_norm := upper(regexp_replace(coalesce(new.serie,''), '[^A-Za-z0-9]', '', 'g'));
  new.maj := now();
  if auth.uid() is not null and not public.is_moderateur() then
    -- champs que le vendeur ne peut pas changer lui-même
    new.owner := old.owner; new.statut := old.statut; new.offre := old.offre; new.motif := old.motif;
    new.vendeur := old.vendeur; new.tel := old.tel; new.commune := old.commune; new.ile := old.ile;
    new.type := old.type; new.ntahiti := old.ntahiti; new.etat := old.etat;
    new.serie := old.serie; new.serie_norm := old.serie_norm;
    new.justif_type := old.justif_type; new.justif_path := old.justif_path;
    -- une pièce d'occasion qui passe à 50 000 F ou plus doit être revérifiée
    if new.etat = 'occasion' and new.prix >= 50000 and old.prix < 50000 then
      if coalesce(new.serie_norm,'') = '' or new.justif_path is null then
        raise exception 'À partir de 50 000 F : n° de série et justificatif obligatoires. Crée une nouvelle annonce.';
      end if;
      if new.statut = 'publie' then new.statut := 'attente'; end if;
    end if;
  end if;
  return new;
end $$;

drop policy if exists "annonces: modifier les siennes" on public.annonces;
create policy "annonces: modifier les siennes" on public.annonces for update
  using (owner = auth.uid()) with check (owner = auth.uid());

-- ---------- RÉSERVATIONS / COMMANDES ----------
create table if not exists public.reservations (
  id          uuid primary key default gen_random_uuid(),
  annonce_id  uuid references public.annonces(id) on delete cascade,
  acheteur    uuid references auth.users(id) on delete cascade default auth.uid(),
  vendeur     uuid references auth.users(id) on delete cascade,
  qte         integer not null default 1 check (qte > 0),
  message     text,
  nom         text,
  tel         text,
  piece_nom   text,
  prix        integer,
  statut      text not null default 'en_attente'
              check (statut in ('en_attente','acceptee','refusee','terminee','annulee')),
  created_at  timestamptz not null default now(),
  maj         timestamptz not null default now()
);
create index if not exists reservations_vendeur_idx on public.reservations(vendeur);
create index if not exists reservations_acheteur_idx on public.reservations(acheteur);

create or replace function public.reservation_avant_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare a public.annonces; p public.profiles;
begin
  select * into a from public.annonces where id = new.annonce_id;
  if a.id is null or a.statut <> 'publie' then raise exception 'Cette pièce n''est plus disponible.'; end if;
  if a.owner is null then raise exception 'Ce vendeur ne prend pas de réservation : contacte-le directement.'; end if;
  if a.owner = auth.uid() then raise exception 'Tu ne peux pas réserver ta propre pièce.'; end if;
  if public.est_suspendu() then raise exception 'Compte suspendu.'; end if;
  if new.qte > a.qte then raise exception 'Stock insuffisant : % disponible(s).', a.qte; end if;
  select * into p from public.profiles where id = auth.uid();
  new.acheteur := auth.uid(); new.vendeur := a.owner; new.statut := 'en_attente';
  new.piece_nom := a.nom; new.prix := a.prix;
  new.nom := coalesce(nullif(p.nom,''), 'Client');
  new.tel := coalesce(nullif(new.tel,''), p.tel);
  new.created_at := now(); new.maj := now();
  return new;
end $$;
drop trigger if exists reservations_insert on public.reservations;
create trigger reservations_insert before insert on public.reservations
  for each row execute function public.reservation_avant_insert();

create or replace function public.reservation_avant_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- seul le statut change ; le reste reste tel quel
  new.annonce_id := old.annonce_id; new.acheteur := old.acheteur; new.vendeur := old.vendeur;
  new.qte := old.qte; new.piece_nom := old.piece_nom; new.prix := old.prix;
  new.nom := old.nom; new.tel := old.tel; new.message := old.message; new.created_at := old.created_at;
  new.maj := now();
  if new.statut = old.statut then return new; end if;
  if not public.is_moderateur() then
    if auth.uid() = old.vendeur then
      if not ((old.statut = 'en_attente' and new.statut in ('acceptee','refusee'))
           or (old.statut = 'acceptee' and new.statut in ('terminee','annulee'))) then
        raise exception 'Changement de statut impossible.';
      end if;
    elsif auth.uid() = old.acheteur then
      if not (old.statut in ('en_attente','acceptee') and new.statut = 'annulee') then
        raise exception 'Tu peux seulement annuler ta réservation.';
      end if;
    else
      raise exception 'Accès refusé.';
    end if;
  end if;
  -- pièce remise au client : le stock baisse automatiquement
  if new.statut = 'terminee' then
    update public.annonces set qte = greatest(qte - old.qte, 0) where id = old.annonce_id;
  end if;
  return new;
end $$;
drop trigger if exists reservations_update on public.reservations;
create trigger reservations_update before update on public.reservations
  for each row execute function public.reservation_avant_update();

alter table public.reservations enable row level security;
drop policy if exists "reservations: créer" on public.reservations;
create policy "reservations: créer" on public.reservations for insert to authenticated
  with check (acheteur = auth.uid());
drop policy if exists "reservations: lecture" on public.reservations;
create policy "reservations: lecture" on public.reservations for select
  using (acheteur = auth.uid() or vendeur = auth.uid() or public.is_moderateur());
drop policy if exists "reservations: changer le statut" on public.reservations;
create policy "reservations: changer le statut" on public.reservations for update
  using (acheteur = auth.uid() or vendeur = auth.uid() or public.is_moderateur());
