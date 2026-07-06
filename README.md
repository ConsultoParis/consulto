# Consulto — Guide de mise en ligne

Ce projet est le squelette technique réel de Consulto (Next.js + Supabase +
Stripe + Resend). Voici, dans l'ordre, tout ce qu'il faut faire pour passer
de ce code à un site en ligne sur **consulto.fr**.

## Ce qui est déjà fait (par Claude)
- Structure du projet Next.js
- Schéma complet de base de données (`supabase/migrations/0001_init.sql`)
- Sécurité des données (Row Level Security) : chaque client/expert ne voit
  que ce qui le concerne
- Paiement en séquestre avec Stripe (l'expert n'est payé qu'après la session)
- Envoi d'emails automatiques (reçu de paiement, documents transmis)
- Upload et stockage sécurisé des documents

## Ce qu'il te reste à faire, étape par étape

### 1. Acheter le nom de domaine
Chez OVH, Gandi ou Namecheap : **consulto.fr**. Ne le connecte pas encore à
quoi que ce soit, on s'en sert seulement à l'étape 5.

### 2. Créer un projet Supabase (base de données + authentification + stockage)
1. Va sur https://supabase.com → crée un compte → "New project"
2. Une fois créé, va dans **SQL Editor** et colle le contenu de
   `supabase/migrations/0001_init.sql`, puis exécute-le. Ça crée toutes les
   tables et les règles de sécurité.
3. Va dans **Storage** → crée un bucket nommé `documents`, marqué **privé**
   (pas public).
4. Va dans **Project Settings > API** → récupère `Project URL`,
   `anon public key` et `service_role key` → tu en auras besoin à l'étape 4.

### 3. Créer un compte Stripe (paiement)
1. https://dashboard.stripe.com → crée un compte, renseigne tes
   informations d'entreprise (auto-entrepreneur ou société)
2. Récupère tes clés API dans **Developers > API keys**
3. Une fois le site en ligne (étape 5), reviens configurer le **webhook** :
   Developers > Webhooks > Add endpoint → URL `https://consulto.fr/api/webhooks/stripe`,
   événements `payment_intent.amount_capturable_updated` et
   `payment_intent.canceled`

> **Important — à savoir avant de lancer réellement les paiements** : le
> code actuel encaisse le paiement du client sur TON compte Stripe (celui
> de Consulto), en séquestre. Il ne transfère pas encore automatiquement la
> part de l'expert sur son propre compte bancaire — c'est ce que "reverser
> les fonds à l'expert" veut dire concrètement. Pour ça, il faut activer
> **Stripe Connect** (chaque expert crée un compte Stripe connecté à
> Consulto, un peu comme sur Uber ou Airbnb) et calculer ta commission.
> C'est une étape à part entière qu'on pourra construire ensemble une fois
> que le reste tourne — dis-le-moi quand tu veux t'y attaquer.

### 4. Créer un compte Resend (envoi d'emails)
1. https://resend.com → crée un compte
2. Ajoute et vérifie ton domaine `consulto.fr` (Resend te donnera des
   enregistrements DNS à ajouter chez ton registrar de domaine)
3. Récupère ta clé API dans **API Keys**

### 5. Déployer le site (hébergement)
1. Crée un dépôt GitHub et pousse ce code dedans
2. Va sur https://vercel.com → connecte ton compte GitHub → importe le dépôt
3. Dans les réglages du projet Vercel, ajoute toutes les variables
   d'environnement listées dans `.env.example` (avec tes vraies clés
   récupérées aux étapes 2, 3 et 4)
4. Déploie
5. Dans Vercel, va dans **Domains** → ajoute `consulto.fr` → Vercel te donne
   des enregistrements DNS à ajouter chez ton registrar (OVH, Gandi...)
6. Une fois le DNS propagé (quelques minutes à quelques heures), le site est
   en ligne sur consulto.fr

### 6. Revenir configurer le webhook Stripe (étape 3, dernier point)
Maintenant que le site a une vraie URL, termine la configuration du webhook
Stripe démarrée à l'étape 3.

## En local, pour développer / tester avant de déployer
```bash
npm install
cp .env.example .env.local   # puis remplis avec tes clés
npm run dev
```
Le site est alors accessible sur http://localhost:3000

## Structure du projet
```
app/                    Pages du site (Next.js App Router)
  api/                  Routes API (paiement, documents, webhooks)
  dashboard/client/     Espace client
  dashboard/expert/     Espace expert
  experts/[id]/         Fiche détaillée d'un expert
  booking/[expertId]/   Tunnel de réservation
components/             Composants React réutilisables
lib/
  supabase/             Connexion à la base de données
  stripe.ts             Paiement en séquestre
  email.ts              Envoi d'emails transactionnels
supabase/migrations/    Schéma de la base de données (SQL)
```

## Prochaines étapes de développement
Ce squelette contient la structure et la logique métier critique (paiement,
base de données, sécurité). Il reste à construire les pages/composants
d'interface (reprises du design de la démo) qui viennent consommer cette
logique. On peut s'y attaquer page par page dans les prochaines sessions.
