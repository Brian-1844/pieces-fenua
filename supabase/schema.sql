-- =====================================================================
--  Pièce Fenua — schéma Supabase
--  À coller dans Supabase : SQL Editor → New query → Run
-- =====================================================================

-- ---------- PROFILS (1 par compte) ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nom          text,
  tel          text,
  commune      text,
  ile          text,
  type         text not null default 'acheteur'
               check (type in ('acheteur','particulier','pro','casse')),
  ntahiti      text,
  role         text not null default 'membre' check (role in ('membre','moderateur')),
  id_statut    text not null default 'non_envoye'
               check (id_statut in ('non_envoye','attente','verifie','refuse')),
  id_type      text,
  id_path      text,          -- chemin du fichier dans le stockage privé (effacé après vérification)
  id_motif     text,
  verifie_le   timestamptz,
  verifie_par  uuid,
  offre        text not null default 'gratuit' check (offre in ('gratuit','partenaire','premium')),
  suspendu     boolean not null default false,
  suspendu_motif text,
  suspendu_le  timestamptz,
  consent_le   timestamptz,
  created_at   timestamptz not null default now()
);

-- Est-ce que l'utilisateur connecté est modérateur ?
create or replace function public.is_moderateur()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'moderateur');
$$;

-- Est-ce que l'utilisateur connecté est suspendu ?
create or replace function public.est_suspendu()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select suspendu from public.profiles where id = auth.uid()), false);
$$;

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, consent_le)
  values (new.id, nullif(new.raw_user_meta_data->>'consent_le','')::timestamptz);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un membre ne peut pas se donner lui-même le rôle modérateur ni se « vérifier »
create or replace function public.protect_profile()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is null or public.is_moderateur() then return new; end if;
  new.role        := old.role;
  new.verifie_le  := old.verifie_le;
  new.verifie_par := old.verifie_par;
  new.id_motif    := old.id_motif;
  new.offre       := old.offre;
  new.suspendu    := old.suspendu;
  new.suspendu_motif := old.suspendu_motif;
  new.suspendu_le := old.suspendu_le;
  if new.id_statut is distinct from old.id_statut then
    -- seul passage autorisé : envoyer sa pièce d'identité
    if not (new.id_statut = 'attente' and old.id_statut in ('non_envoye','refuse') and new.id_path is not null) then
      new.id_statut := old.id_statut;
      new.id_path   := old.id_path;
      new.id_type   := old.id_type;
    end if;
  elsif new.id_path is distinct from old.id_path then
    new.id_path := old.id_path;
    new.id_type := old.id_type;
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile();

alter table public.profiles enable row level security;
drop policy if exists "profil: lire le sien" on public.profiles;
create policy "profil: lire le sien" on public.profiles for select
  using (id = auth.uid() or public.is_moderateur());
-- Un membre peut créer son propre profil s'il manque, sans pouvoir se donner de droits
create or replace function public.protect_profile_insert()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is null or public.is_moderateur() then return new; end if;
  new.role := 'membre'; new.id_statut := 'non_envoye'; new.id_path := null; new.id_type := null;
  new.offre := 'gratuit'; new.suspendu := false; new.suspendu_motif := null; new.suspendu_le := null;
  new.verifie_le := null; new.verifie_par := null; new.id_motif := null;
  return new;
end $$;
drop trigger if exists profiles_protect_insert on public.profiles;
create trigger profiles_protect_insert before insert on public.profiles
  for each row execute function public.protect_profile_insert();
drop policy if exists "profil: créer le sien" on public.profiles;
create policy "profil: créer le sien" on public.profiles for insert to authenticated
  with check (id = auth.uid());
drop policy if exists "profil: modifier le sien" on public.profiles;
create policy "profil: modifier le sien" on public.profiles for update
  using (id = auth.uid() or public.is_moderateur());

-- ---------- SIGNALEMENTS DE VOL ----------
create table if not exists public.vols (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid references auth.users(id) on delete set null default auth.uid(),
  serie       text not null,
  serie_norm  text,
  descr       text not null,
  date_vol    date,
  plainte     text,
  tel         text,
  created_at  timestamptz not null default now()
);

-- ---------- ANNONCES ----------
create table if not exists public.annonces (
  id           uuid primary key default gen_random_uuid(),
  owner        uuid references auth.users(id) on delete cascade,
  nom          text not null,
  cat          text not null,
  compat       text,
  ref          text,
  etat         text not null check (etat in ('neuf','occasion')),
  prix         integer not null check (prix >= 0),
  qte          integer not null default 1 check (qte >= 0),
  commande     text,
  vendeur      text,
  type         text,
  ntahiti      text,
  commune      text,
  ile          text,
  tel          text,
  serie        text,
  serie_norm   text,
  justif_type  text,
  justif_path  text,
  photo_url    text,
  offre        text not null default 'gratuit',
  statut       text not null default 'attente'
               check (statut in ('publie','attente','refuse','bloque','masque')),
  motif        text,
  maj          timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
alter table public.annonces add column if not exists photo_url text;
alter table public.annonces add column if not exists offre text not null default 'gratuit';
alter table public.profiles add column if not exists offre text not null default 'gratuit';
create index if not exists annonces_serie_idx on public.annonces(serie_norm);
create index if not exists vols_serie_idx on public.vols(serie_norm);

-- Règles de publication appliquées par le serveur (impossible à contourner depuis l'app)
create or replace function public.annonce_avant_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare p public.profiles;
begin
  new.serie_norm := upper(regexp_replace(coalesce(new.serie,''), '[^A-Za-z0-9]', '', 'g'));
  if auth.uid() is null then return new; end if;      -- insertion depuis l'éditeur SQL (données de démo)

  select * into p from public.profiles where id = auth.uid();
  if p.nom is null or p.tel is null then raise exception 'Complète ton profil avant de vendre.'; end if;
  if p.suspendu then raise exception 'Compte suspendu : %', coalesce(p.suspendu_motif, 'contacte la modération'); end if;
  if p.type = 'acheteur' then raise exception 'Choisis un type de compte vendeur dans ton profil.'; end if;

  new.owner := auth.uid(); new.maj := now(); new.motif := null;
  new.vendeur := p.nom; new.tel := p.tel; new.commune := p.commune; new.ile := p.ile;
  new.type := p.type; new.ntahiti := p.ntahiti; new.offre := p.offre;

  -- offre gratuite : 30 pièces en ligne maximum (modifiable ici)
  if p.offre = 'gratuit' and (select count(*) from public.annonces a
       where a.owner = auth.uid() and a.statut in ('publie','attente')) >= 30 then
    raise exception 'Limite de 30 pièces de l''offre gratuite atteinte : découvre les offres pros.';
  end if;

  if new.etat = 'neuf' then
    if p.type = 'particulier' then raise exception 'Un particulier ne peut vendre que de l''occasion.'; end if;
    new.statut := 'publie';
    return new;
  end if;

  -- occasion / revente
  if p.id_statut not in ('attente','verifie') then
    raise exception 'Envoie ta pièce d''identité (onglet Compte) avant de revendre.';
  end if;
  if new.prix >= 50000 and (new.serie_norm = '' or new.justif_path is null) then
    raise exception 'À partir de 50 000 F : n° de série et justificatif obligatoires.';
  end if;
  if new.justif_path is null then new.justif_type := null; end if;

  if new.serie_norm <> '' and exists (select 1 from public.vols v where v.serie_norm = new.serie_norm) then
    new.statut := 'bloque'; new.motif := 'n° de série signalé volé';
  elsif new.prix >= 50000 or p.id_statut <> 'verifie' then
    new.statut := 'attente';
  else
    new.statut := 'publie';
  end if;
  return new;
end $$;
drop trigger if exists annonces_insert on public.annonces;
create trigger annonces_insert before insert on public.annonces
  for each row execute function public.annonce_avant_insert();

create or replace function public.annonce_avant_update()
returns trigger language plpgsql set search_path = public as $$
begin
  new.serie_norm := upper(regexp_replace(coalesce(new.serie,''), '[^A-Za-z0-9]', '', 'g'));
  new.maj := now();
  return new;
end $$;
drop trigger if exists annonces_update on public.annonces;
create trigger annonces_update before update on public.annonces
  for each row execute function public.annonce_avant_update();

alter table public.annonces enable row level security;
drop policy if exists "annonces: lecture" on public.annonces;
create policy "annonces: lecture" on public.annonces for select
  using (statut = 'publie' or owner = auth.uid() or public.is_moderateur());
drop policy if exists "annonces: créer" on public.annonces;
create policy "annonces: créer" on public.annonces for insert to authenticated
  with check (owner = auth.uid());
drop policy if exists "annonces: modérer" on public.annonces;
create policy "annonces: modérer" on public.annonces for update
  using (public.is_moderateur());
drop policy if exists "annonces: supprimer" on public.annonces;
create policy "annonces: supprimer" on public.annonces for delete
  using (owner = auth.uid() or public.is_moderateur());

-- Vols : un signalement bloque immédiatement les annonces correspondantes
create or replace function public.vol_avant_insert()
returns trigger language plpgsql set search_path = public as $$
begin
  new.serie_norm := upper(regexp_replace(coalesce(new.serie,''), '[^A-Za-z0-9]', '', 'g'));
  if auth.uid() is not null then new.owner := auth.uid(); end if;
  return new;
end $$;
drop trigger if exists vols_insert on public.vols;
create trigger vols_insert before insert on public.vols
  for each row execute function public.vol_avant_insert();

create or replace function public.vol_bloque_annonces()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.serie_norm <> '' then
    update public.annonces set statut = 'bloque', motif = 'n° de série signalé volé'
     where serie_norm = new.serie_norm;
  end if;
  return new;
end $$;
drop trigger if exists vols_bloque on public.vols;
create trigger vols_bloque after insert on public.vols
  for each row execute function public.vol_bloque_annonces();

-- Nombre d'annonces bloquées par un n° (utile pour le message de confirmation)
create or replace function public.nb_annonces_serie(s text)
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int from public.annonces
   where serie_norm = upper(regexp_replace(coalesce(s,''), '[^A-Za-z0-9]', '', 'g')) and serie_norm <> '';
$$;

alter table public.vols enable row level security;
drop policy if exists "vols: signaler" on public.vols;
create policy "vols: signaler" on public.vols for insert to authenticated with check (not public.est_suspendu());
drop policy if exists "vols: lecture" on public.vols;
create policy "vols: lecture" on public.vols for select
  using (owner = auth.uid() or public.is_moderateur());

-- ---------- DEMANDES GROUPÉES ----------
create table if not exists public.demandes (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid references auth.users(id) on delete cascade default auth.uid(),
  piece      text not null,
  cat        text not null,
  vehicule   text,
  ile        text,
  tel        text,
  created_at timestamptz not null default now()
);
alter table public.demandes enable row level security;
drop policy if exists "demandes: créer" on public.demandes;
create policy "demandes: créer" on public.demandes for insert to authenticated
  with check (owner = auth.uid() and not public.est_suspendu());
drop policy if exists "demandes: lecture" on public.demandes;
create policy "demandes: lecture" on public.demandes for select using (
  owner = auth.uid() or public.is_moderateur()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.type in ('pro','casse'))
);
drop policy if exists "demandes: supprimer" on public.demandes;
create policy "demandes: supprimer" on public.demandes for delete using (owner = auth.uid());

-- ---------- SIGNALEMENTS D'ANNONCES (abus, photo inappropriée, vol…) ----------
create table if not exists public.signalements (
  id          uuid primary key default gen_random_uuid(),
  annonce_id  uuid references public.annonces(id) on delete cascade,
  owner       uuid references auth.users(id) on delete set null default auth.uid(),
  motif       text not null check (motif in ('photo','vol','arnaque','autre')),
  details     text,
  traite      boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.signalements enable row level security;
drop policy if exists "signalements: créer" on public.signalements;
create policy "signalements: créer" on public.signalements for insert to authenticated
  with check (owner = auth.uid() and not public.est_suspendu());
drop policy if exists "signalements: modérer" on public.signalements;
create policy "signalements: modérer" on public.signalements for all
  using (public.is_moderateur()) with check (public.is_moderateur());

-- ---------- SUSPENSION DE COMPTE (modérateurs uniquement) ----------
create or replace function public.suspendre_compte(cible uuid, motif text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_moderateur() then raise exception 'Réservé aux modérateurs.'; end if;
  if cible = auth.uid() then raise exception 'Tu ne peux pas te suspendre toi-même.'; end if;
  update public.profiles set suspendu = true, suspendu_motif = motif, suspendu_le = now() where id = cible;
  -- toutes ses annonces disparaissent des résultats
  update public.annonces set statut = 'masque', motif = 'compte suspendu'
   where owner = cible and statut in ('publie','attente');
end $$;

create or replace function public.reactiver_compte(cible uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_moderateur() then raise exception 'Réservé aux modérateurs.'; end if;
  update public.profiles set suspendu = false, suspendu_motif = null, suspendu_le = null where id = cible;
  -- les annonces repassent en vérification avant de revenir en ligne
  update public.annonces set statut = 'attente', motif = null where owner = cible and statut = 'masque';
end $$;
revoke all on function public.suspendre_compte(uuid, text) from public, anon;
revoke all on function public.reactiver_compte(uuid) from public, anon;
grant execute on function public.suspendre_compte(uuid, text) to authenticated;
grant execute on function public.reactiver_compte(uuid) to authenticated;

-- ---------- OFFRES PROS (modérateurs uniquement) ----------
create or replace function public.definir_offre(cible uuid, o text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_moderateur() then raise exception 'Réservé aux modérateurs.'; end if;
  if o not in ('gratuit','partenaire','premium') then raise exception 'Offre inconnue.'; end if;
  update public.profiles set offre = o where id = cible;
  update public.annonces set offre = o where owner = cible;
end $$;
revoke all on function public.definir_offre(uuid, text) from public, anon;
grant execute on function public.definir_offre(uuid, text) to authenticated;

-- ---------- SUPPRESSION DE SON COMPTE ----------
create or replace function public.supprimer_mon_compte()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.supprimer_mon_compte() to authenticated;

-- ---------- STOCKAGE PRIVÉ DES DOCUMENTS ----------
insert into storage.buckets (id, name, public)
values ('identites','identites', false), ('justificatifs','justificatifs', false),
       ('photos','photos', true)          -- photos des pièces : publiques (affichées dans les annonces)
on conflict (id) do nothing;

drop policy if exists "photos: envoyer dans son dossier" on storage.objects;
create policy "photos: envoyer dans son dossier" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos: supprimer les siennes" on storage.objects;
create policy "photos: supprimer les siennes" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_moderateur()));

drop policy if exists "docs: envoyer dans son dossier" on storage.objects;
create policy "docs: envoyer dans son dossier" on storage.objects for insert to authenticated
  with check (bucket_id in ('identites','justificatifs')
              and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "docs: lire les siens ou modérateur" on storage.objects;
create policy "docs: lire les siens ou modérateur" on storage.objects for select to authenticated
  using (bucket_id in ('identites','justificatifs')
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_moderateur()));
drop policy if exists "docs: supprimer les siens ou modérateur" on storage.objects;
create policy "docs: supprimer les siens ou modérateur" on storage.objects for delete to authenticated
  using (bucket_id in ('identites','justificatifs')
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_moderateur()));

-- =====================================================================
--  APRÈS ta propre inscription dans l'app, deviens modérateur :
--    update public.profiles set role = 'moderateur'
--     where id = (select id from auth.users where email = 'TON_EMAIL');
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
