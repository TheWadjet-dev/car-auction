import { createClient } from "@supabase/supabase-js"

// Versión compatible con ambos sistemas de enrutamiento usando la clave anónima
export const getSupabaseServer = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
