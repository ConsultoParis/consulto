import { createBrowserClient } from "@supabase/ssr";
// Client Supabase utilisé dans les composants React côté navigateur
// (formulaires, boutons interactifs, etc.)
//
// flowType: "implicit" — plus tolérant que le flux par défaut (PKCE) pour
// les liens envoyés par email (mot de passe oublié, invitation...) : il
// n'exige pas que la personne clique sur le lien depuis le même navigateur
// que celui utilisé pour faire la demande, ce qui est essentiel puisque
// beaucoup de gens ouvrent leurs emails depuis une autre application.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "implicit",
      },
    }
  );
}
