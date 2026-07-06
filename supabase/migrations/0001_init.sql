-- ============================================================
-- CONSULTO — Schéma de base de données (Supabase / PostgreSQL)
-- Migration initiale
-- ============================================================

-- Extension nécessaire pour les UUID
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- PROFILES — étend auth.users (Supabase Auth) avec le rôle
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('client', 'expert', 'admin')),
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  credits_balance numeric(10,2) not null default 0,
  referral_code text unique,
  referred_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EXPERTS — profil professionnel détaillé, lié à un profile
-- ------------------------------------------------------------
create table experts (
  id uuid primary key references profiles(id) on delete cascade,
  profession text not null check (profession in ('avocat', 'comptable', 'coach', 'therapeute', 'medecin')),
  specialite text not null,
  bio text,
  price numeric(10,2) not null check (price > 0),
  experience_years int not null default 0,
  response_time_min int not null default 30,
  languages text[] not null default '{Français}',
  domains text[] not null default '{}',

  -- Justificatifs professionnels (selon la profession)
  numero_barreau text,          -- avocat
  numero_ordre_comptable text,  -- expert-comptable
  numero_adeli text,            -- thérapeute
  numero_rpps text,             -- médecin (obligatoire avec numero_ordre_medecins)
  numero_ordre_medecins text,   -- médecin
  certification text,           -- coach (facultatif)

  -- Vérification
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  verified_at timestamptz,
  verified_by uuid references profiles(id),

  available_now boolean not null default false,
  created_at timestamptz not null default now()
);

-- Contrainte : selon la profession, certains justificatifs sont obligatoires
alter table experts add constraint check_justificatifs check (
  (profession = 'avocat' and numero_barreau is not null) or
  (profession = 'comptable' and numero_ordre_comptable is not null) or
  (profession = 'therapeute' and numero_adeli is not null) or
  (profession = 'medecin' and numero_rpps is not null and numero_ordre_medecins is not null) or
  (profession = 'coach')
);

-- ------------------------------------------------------------
-- AVAILABILITY_SLOTS — créneaux proposés par les experts
-- ------------------------------------------------------------
create table availability_slots (
  id uuid primary key default uuid_generate_v4(),
  expert_id uuid not null references experts(id) on delete cascade,
  date date not null,
  start_time time not null,
  duration_min int not null check (duration_min in (20, 30)),
  is_booked boolean not null default false,
  created_at timestamptz not null default now(),
  unique (expert_id, date, start_time)
);

-- ------------------------------------------------------------
-- BOOKINGS — réservations confirmées
-- ------------------------------------------------------------
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  slot_id uuid not null references availability_slots(id),
  client_id uuid not null references profiles(id),
  expert_id uuid not null references experts(id),

  date date not null,
  start_time time not null,
  duration_min int not null,
  mode text not null check (mode in ('video', 'chat', 'physique')),

  price numeric(10,2) not null,
  credits_used numeric(10,2) not null default 0,

  -- Paiement en séquestre (Stripe)
  stripe_payment_intent_id text,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'held', 'released', 'refunded')),

  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled_by_client', 'cancelled_by_expert', 'completed')),
  refunded boolean not null default false,

  client_email text not null,
  created_at timestamptz not null default now()
);

create index idx_bookings_client on bookings(client_id);
create index idx_bookings_expert on bookings(expert_id);

-- ------------------------------------------------------------
-- DOCUMENTS — pièces jointes liées à une réservation
-- ------------------------------------------------------------
create table documents (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id) on delete cascade,
  uploaded_by text not null check (uploaded_by in ('client', 'expert')),
  file_name text not null,
  file_path text not null,  -- chemin dans Supabase Storage
  file_type text,
  file_size int,
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- REVIEWS — avis certifiés (liés obligatoirement à une réservation)
-- ------------------------------------------------------------
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null unique references bookings(id),
  expert_id uuid not null references experts(id),
  client_id uuid not null references profiles(id),
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- MESSAGES — messagerie client/expert
-- ------------------------------------------------------------
create table messages (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  content text not null,
  attachment_path text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- FAVORITES — favoris des clients
-- ------------------------------------------------------------
create table favorites (
  client_id uuid not null references profiles(id) on delete cascade,
  expert_id uuid not null references experts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, expert_id)
);

-- ------------------------------------------------------------
-- BLOG_POSTS — articles rédigés par les experts (SEO)
-- ------------------------------------------------------------
create table blog_posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references experts(id),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  read_minutes int not null default 3,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table profiles enable row level security;
alter table experts enable row level security;
alter table availability_slots enable row level security;
alter table bookings enable row level security;
alter table documents enable row level security;
alter table reviews enable row level security;
alter table messages enable row level security;
alter table favorites enable row level security;
alter table blog_posts enable row level security;

-- Profiles : chacun voit et modifie son propre profil
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Experts : profils vérifiés visibles par tout le monde
create policy "experts_select_verified" on experts for select using (verification_status = 'verified' or auth.uid() = id);
create policy "experts_update_own" on experts for update using (auth.uid() = id);

-- Créneaux : visibles par tous, modifiables par l'expert propriétaire
create policy "slots_select_all" on availability_slots for select using (true);
create policy "slots_insert_own" on availability_slots for insert with check (auth.uid() = expert_id);
create policy "slots_update_own" on availability_slots for update using (auth.uid() = expert_id);
create policy "slots_delete_own" on availability_slots for delete using (auth.uid() = expert_id);

-- Réservations : visibles uniquement par le client et l'expert concernés
create policy "bookings_select_involved" on bookings for select using (auth.uid() = client_id or auth.uid() = expert_id);
create policy "bookings_insert_client" on bookings for insert with check (auth.uid() = client_id);
create policy "bookings_update_involved" on bookings for update using (auth.uid() = client_id or auth.uid() = expert_id);

-- Documents : visibles uniquement par le client et l'expert de la réservation
create policy "documents_select_involved" on documents for select using (
  exists (select 1 from bookings b where b.id = booking_id and (b.client_id = auth.uid() or b.expert_id = auth.uid()))
);
create policy "documents_insert_involved" on documents for insert with check (
  exists (select 1 from bookings b where b.id = booking_id and (b.client_id = auth.uid() or b.expert_id = auth.uid()))
);

-- Avis : lecture publique, écriture réservée au client de la réservation
create policy "reviews_select_all" on reviews for select using (true);
create policy "reviews_insert_own_booking" on reviews for insert with check (
  auth.uid() = client_id and exists (select 1 from bookings b where b.id = booking_id and b.client_id = auth.uid() and b.status = 'completed')
);

-- Messages : visibles par les deux parties de la réservation
create policy "messages_select_involved" on messages for select using (
  exists (select 1 from bookings b where b.id = booking_id and (b.client_id = auth.uid() or b.expert_id = auth.uid()))
);
create policy "messages_insert_involved" on messages for insert with check (
  exists (select 1 from bookings b where b.id = booking_id and (b.client_id = auth.uid() or b.expert_id = auth.uid()))
);

-- Favoris : gérés uniquement par le client concerné
create policy "favorites_select_own" on favorites for select using (auth.uid() = client_id);
create policy "favorites_insert_own" on favorites for insert with check (auth.uid() = client_id);
create policy "favorites_delete_own" on favorites for delete using (auth.uid() = client_id);

-- Blog : lecture publique des articles publiés
create policy "blog_select_published" on blog_posts for select using (published = true);
create policy "blog_insert_own" on blog_posts for insert with check (auth.uid() = author_id);
create policy "blog_update_own" on blog_posts for update using (auth.uid() = author_id);
