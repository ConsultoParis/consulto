-- ============================================================
-- CONSULTO — Trigger automatique de création de profil
-- Optionnel mais recommandé : rend la création du profil plus fiable
-- qu'une simple insertion depuis le code (ne dépend plus du réseau
-- côté navigateur après l'inscription).
--
-- Si tu utilises ce trigger, retire l'insertion manuelle dans
-- app/inscription/page.tsx et adapte-la pour un simple update
-- (le trigger crée déjà la ligne avec role='client' par défaut).
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
