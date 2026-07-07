# Checklist de lancement — 1Expert

Coche au fur et à mesure. Chaque étape prend entre 5 et 20 minutes.

## 🌐 Domaine
- [ ] Acheter `1expert.fr` (OVH, Gandi ou Namecheap) — ne rien configurer d'autre pour l'instant

## 🗄️ Base de données (Supabase)
- [ ] Créer un compte sur https://supabase.com
- [ ] Créer un nouveau projet (choisir une région proche de la France, ex. Frankfurt)
- [ ] Aller dans **SQL Editor** → coller et exécuter `supabase/migrations/0001_init.sql`
- [ ] Toujours dans **SQL Editor** → coller et exécuter `supabase/migrations/0002_auto_profile_trigger.sql`
- [ ] *(Optionnel, pour tester avec du contenu)* exécuter `supabase/seed_demo_data.sql`
- [ ] Aller dans **Storage** → bouton "New bucket" → nom `documents` → cocher **Private**
- [ ] Aller dans **Project Settings → API** → copier ces 3 valeurs dans un fichier texte de côté :
  - Project URL
  - anon public key
  - service_role key (⚠️ à garder secrète, ne jamais la mettre dans du code visible publiquement)

## 💳 Paiement (Stripe)
- [ ] Créer un compte sur https://dashboard.stripe.com
- [ ] Renseigner les informations de ton activité (l'onboarding Stripe te guide)
- [ ] Aller dans **Developers → API keys** → copier la clé secrète et la clé publique
- [ ] Laisser l'étape webhook de côté pour l'instant (dernière étape de cette checklist)

## 📧 Email (Resend)
- [ ] Créer un compte sur https://resend.com
- [ ] Aller dans **Domains** → ajouter `1expert.fr`
- [ ] Resend affiche des enregistrements DNS (TXT, MX...) → les ajouter chez ton registrar de domaine (OVH/Gandi/Namecheap, section DNS)
- [ ] Attendre la validation (peut prendre jusqu'à quelques heures) — Resend affiche "Verified" une fois bon
- [ ] Aller dans **API Keys** → créer une clé → la copier

## 🚀 Mise en ligne (GitHub + Vercel)
- [ ] Créer un compte GitHub si pas déjà fait
- [ ] Créer un nouveau dépôt (ex. `consulto`)
- [ ] Pousser le contenu de ce dossier dedans (`git init`, `git add .`, `git commit`, `git push`)
- [ ] Créer un compte sur https://vercel.com et connecter ton GitHub
- [ ] "Add New Project" → importer le dépôt `consulto`
- [ ] Dans **Environment Variables**, ajouter chacune des variables de `.env.example` avec les vraies valeurs récupérées plus haut :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET` (laisser vide pour l'instant, voir dernière étape)
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL` → mets `contact@1expert.fr`
  - `NEXT_PUBLIC_SITE_URL` → mets `https://1expert.fr`
- [ ] Cliquer "Deploy" et attendre la fin du build (2-3 minutes)
- [ ] Une fois déployé, aller dans **Project → Settings → Domains** → ajouter `1expert.fr`
- [ ] Vercel affiche des enregistrements DNS → les ajouter chez ton registrar de domaine
- [ ] Attendre la propagation DNS (quelques minutes à quelques heures)

## 🔗 Dernière étape : connecter le webhook Stripe
- [ ] Retourner sur https://dashboard.stripe.com → **Developers → Webhooks → Add endpoint**
- [ ] URL : `https://1expert.fr/api/webhooks/stripe`
- [ ] Événements à cocher : `payment_intent.amount_capturable_updated` et `payment_intent.canceled`
- [ ] Copier le "Signing secret" affiché → retourner dans Vercel → Environment Variables → coller dans `STRIPE_WEBHOOK_SECRET`
- [ ] Redéployer le projet sur Vercel (Deployments → ... → Redeploy) pour que la variable soit prise en compte

## ✅ Le site est en ligne
À ce stade, `1expert.fr` est un vrai site fonctionnel : inscription, réservation, paiement en séquestre, documents, emails.

## Ce qui reste pour la suite (pas bloquant pour lancer)
- Stripe Connect pour reverser réellement l'argent aux comptes bancaires des experts (voir README.md)
- Vérification manuelle des candidatures expert (actuellement `verification_status = 'pending'` par défaut — il faut les passer à `'verified'` toi-même dans Supabase, table `experts`, en attendant une interface d'administration dédiée)
