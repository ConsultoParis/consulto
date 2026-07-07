-- ============================================================
-- CONSULTO — Données de démonstration (OPTIONNEL)
--
-- À exécuter dans le SQL Editor de Supabase UNIQUEMENT si tu veux
-- voir le site avec du contenu avant d'avoir de vrais experts inscrits
-- (utile pour tester/montrer le site). À ne PAS exécuter en production
-- une fois de vrais utilisateurs inscrits.
--
-- Important : ce script crée des profils directement en base sans
-- passer par l'inscription (auth.users). Ces comptes de démo ne
-- pourront donc PAS se connecter — ils servent uniquement à peupler
-- l'affichage (page d'accueil, recherche, blog).
-- ============================================================

-- Un utilisateur "système" pour porter les profils de démo
-- (nécessaire à cause de la contrainte de clé étrangère vers auth.users)
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
values
  ('00000000-0000-0000-0000-000000000001', 'demo.avocat@consulto.fr', '', now(), now(), now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000002', 'demo.comptable@consulto.fr', '', now(), now(), now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000003', 'demo.coach@consulto.fr', '', now(), now(), now(), 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into profiles (id, role, full_name, email) values
  ('00000000-0000-0000-0000-000000000001', 'expert', 'Camille Dubois', 'demo.avocat@consulto.fr'),
  ('00000000-0000-0000-0000-000000000002', 'expert', 'Yanis Belkacem', 'demo.comptable@consulto.fr'),
  ('00000000-0000-0000-0000-000000000003', 'expert', 'Léa Fontaine', 'demo.coach@consulto.fr')
on conflict (id) do nothing;

insert into experts (id, profession, specialite, bio, price, experience_years, response_time_min, languages, domains, numero_barreau, numero_ordre_comptable, verification_status, available_now) values
  ('00000000-0000-0000-0000-000000000001', 'avocat', 'Droit du travail', '10 ans de barreau, spécialisée dans les litiges et ruptures de contrat de travail.', 45, 10, 8, '{Français}', '{Licenciement,"Rupture conventionnelle",Contrats}', 'Paris — 2014/45678', null, 'verified', true),
  ('00000000-0000-0000-0000-000000000002', 'comptable', 'Fiscalité indépendants', 'Accompagne freelances et TPE sur la fiscalité et les déclarations depuis 8 ans.', 40, 8, 15, '{Français}', '{TVA,"Auto-entrepreneur",Bilan}', null, 'OEC-778899', 'verified', false),
  ('00000000-0000-0000-0000-000000000003', 'coach', 'Coaching de carrière', 'Certifiée ICF, spécialisée reconversion professionnelle et négociation salariale.', 35, 6, 4, '{Français,Anglais}', '{Reconversion,"Négociation salariale"}', null, null, 'verified', true)
on conflict (id) do nothing;

-- Quelques créneaux disponibles pour pouvoir tester une réservation
insert into availability_slots (expert_id, date, start_time, duration_min) values
  ('00000000-0000-0000-0000-000000000001', current_date + interval '1 day', '09:00', 30),
  ('00000000-0000-0000-0000-000000000001', current_date + interval '2 day', '14:00', 20),
  ('00000000-0000-0000-0000-000000000003', current_date + interval '1 day', '18:00', 20)
on conflict do nothing;

-- Un article de blog de démonstration
insert into blog_posts (author_id, slug, title, excerpt, content, read_minutes, published) values
  (
    '00000000-0000-0000-0000-000000000001',
    'rupture-conventionnelle-questions-avant-signer',
    'Rupture conventionnelle : les 3 questions à poser avant de signer',
    'Un avocat en droit du travail détaille les points de vigilance avant toute signature.',
    'Avant de signer une rupture conventionnelle, trois points méritent votre attention : le montant de l''indemnité (au moins égale à l''indemnité légale de licenciement), le délai de rétractation de 15 jours calendaires, et l''homologation par la DREETS qui prend généralement 15 jours ouvrables supplémentaires.',
    4,
    true
  )
on conflict (slug) do nothing;
