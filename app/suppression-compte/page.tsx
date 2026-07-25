export default function SuppressionComptePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">1Expert</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Suppression de compte et de données</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-muted">
        <p>
          Vous pouvez demander la suppression de votre compte 1Expert (client ou expert) et des données
          associées à tout moment, gratuitement.
        </p>

        <section>
          <h2 className="font-display text-lg font-medium text-default">Comment demander la suppression</h2>
          <p className="mt-2">
            Envoyez un email à{" "}
            <a href="mailto:contact@1expert.fr?subject=Demande%20de%20suppression%20de%20compte" className="underline decoration-seal decoration-2 underline-offset-4">
              contact@1expert.fr
            </a>{" "}
            depuis l'adresse associée à votre compte, avec pour objet « Demande de suppression de compte ».
            Votre demande est traitée sous 30 jours maximum, et une confirmation vous est envoyée une fois
            la suppression effectuée.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-default">Données supprimées</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Nom, email, téléphone et informations de profil</li>
            <li>Documents et justificatifs transmis (bucket de stockage)</li>
            <li>Abonnement aux notifications push, le cas échéant</li>
            <li>Favoris et préférences de compte</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-default">Données conservées, et pourquoi</h2>
          <p className="mt-2">
            Pour des raisons légales et comptables, certaines informations liées à des réservations déjà
            réalisées (montants facturés, dates de consultation) sont conservées pendant la durée requise
            par la réglementation fiscale française, même après suppression du compte. Ces données ne
            permettent plus de vous identifier directement une fois votre compte supprimé, dans la mesure
            du possible.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-default">Questions</h2>
          <p className="mt-2">
            Pour toute question sur cette procédure, contactez{" "}
            <a href="mailto:contact@1expert.fr" className="underline decoration-seal decoration-2 underline-offset-4">
              contact@1expert.fr
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
