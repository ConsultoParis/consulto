import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client Supabase utilisé côté serveur (Server Components, route handlers).
// Respecte les policies RLS car il utilise la session de l'utilisateur connecté.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : ignoré si un middleware
            // gère déjà le rafraîchissement de session.
          }
        },
      },
    }
  );
}

// Client "admin" avec la clé service_role — contourne les policies RLS.
// À utiliser UNIQUEMENT côté serveur, jamais exposé au navigateur
// (ex : vérification manuelle d'un expert, tâches automatisées).
export async function createAdminClient() {
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
