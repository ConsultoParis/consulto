export default function PolitiqueConfidentialitePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">1Expert</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Politique de confidentialité</h1>
      <p className="mt-3 text-sm text-muted">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="mt-10 space-y-8 leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-xl font-medium text-default">1. Qui sommes-nous</h2>
          <p className="mt-2">
            1Expert.fr est une plateforme de mise en relation entre particuliers et professionnels vérifiés
            (avocats, notaires, médecins, garagistes, coiffeurs, experts-comptables). Pour toute question
            relative à vos données personnelles, vous pouvez nous contacter à{" "}
            <a href="mailto:contact@1expert.fr" className="underline decoration-seal decoration-2 underline-offset-4">
              contact@1expert.fr
            </a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-default">2. Données que nous collectons</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Informations de compte : nom, email, téléphone (pour les clients et les experts)</li>
            <li>Justificatifs professionnels et documents transmis (pour la vérification des experts, ou dans le cadre d'une consultation)</li>
            <li>Données de réservation : dates, créneaux, mode de consultation choisi, message éventuel laissé à l'expert</li>
            <li>Données de paiement : traitées directement par notre prestataire Stripe — nous ne stockons jamais vos coordonnées bancaires</li>
            <li>Avis et notes laissés après une consultation</li>
            <li>Abonnement aux notifications push, si vous l'activez (identifiant technique de votre appareil)</li>
            <li>Données de navigation anonymisées, via Vercel Analytics (pages visitées, sans identification individuelle)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-default">3. Pourquoi nous les utilisons</h2>
          <p className="mt-2">
            Vos données servent exclusivement à : créer et gérer votre compte, vous mettre en relation avec un
            expert ou un client, sécuriser le paiement en séquestre, vous envoyer les confirmations et rappels
            de rendez-vous (par email et, si activé, par notification), et vérifier l'identité professionnelle
            des experts avant leur mise en ligne.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-default">4. Avec qui nous les partageons</h2>
          <p className="mt-2">
            Nous ne vendons ni ne louons vos données à des tiers. Elles sont partagées uniquement avec les
            prestataires techniques nécessaires au fonctionnement du service :
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li><strong>Supabase</strong> — hébergement de la base de données et des documents</li>
            <li><strong>Stripe</strong> — traitement sécurisé des paiements</li>
            <li><strong>Resend</strong> — envoi des emails transactionnels (confirmations, rappels)</li>
            <li><strong>Vercel</strong> — hébergement du site et mesure d'audience anonymisée</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-default">5. Durée de conservation</h2>
          <p className="mt-2">
            Vos données sont conservées le temps nécessaire à la gestion de votre compte et de vos réservations,
            et selon les durées légales applicables (notamment en matière comptable et fiscale). Vous pouvez
            demander la suppression de votre compte à tout moment.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-default">6. Vos droits</h2>
          <p className="mt-2">
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression, de
            limitation et de portabilité de vos données. Pour exercer ces droits, contactez-nous à{" "}
            <a href="mailto:contact@1expert.fr" className="underline decoration-seal decoration-2 underline-offset-4">
              contact@1expert.fr
            </a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-default">7. Cookies</h2>
          <p className="mt-2">
            Le site utilise des cookies nécessaires à son fonctionnement (connexion, réservation, paiement
            sécurisé). Aucun cookie publicitaire tiers n'est utilisé.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-default">8. Application mobile</h2>
          <p className="mt-2">
            L'application 1Expert (disponible sur le Play Store) est une extension de ce site web et applique
            exactement la même politique de confidentialité. Si vous activez les notifications, un identifiant
            technique lié à votre appareil est enregistré uniquement pour vous envoyer les rappels de rendez-vous
            que vous avez sollicités.
          </p>
        </section>
      </div>
    </main>
  );
}
