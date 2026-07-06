export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-seal">Informations légales</p>
      <h1 className="mt-3 font-display text-3xl font-medium">Mentions légales</h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate">
        <p className="rounded-[6px] border border-seal/40 bg-seal/5 p-4 text-ink">
          ⚠️ Modèle à compléter avec tes vraies informations avant la mise en ligne :
          raison sociale, forme juridique, capital, SIRET, adresse du siège,
          nom du directeur de la publication, coordonnées de l'hébergeur.
        </p>

        <section>
          <h2 className="font-display text-lg font-medium text-ink">Éditeur du site</h2>
          <p className="mt-2">
            Consulto — [Forme juridique à préciser]
            <br />
            Siège social : [Adresse à compléter]
            <br />
            SIRET : [Numéro à compléter]
            <br />
            Directeur de la publication : [Nom à compléter]
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-ink">Hébergement</h2>
          <p className="mt-2">
            Ce site est hébergé par [Vercel Inc. / autre hébergeur choisi],
            [adresse de l'hébergeur].
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-ink">Protection des données personnelles</h2>
          <p className="mt-2">
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de
            suppression de vos données personnelles. Pour l'exercer, contactez [email à définir].
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-ink">Propriété intellectuelle</h2>
          <p className="mt-2">
            L'ensemble du contenu de ce site (textes, logo, mise en page) est la propriété de
            Consulto, sauf mention contraire.
          </p>
        </section>
      </div>
    </main>
  );
}
