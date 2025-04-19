import { createClient } from "@supabase/supabase-js"

// Singleton para el cliente de Supabase en el lado del cliente
let clientSingleton: ReturnType<typeof createClient> | null = null

// Crear cliente de Supabase para el lado del servidor
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

// Crear cliente de Supabase para el lado del cliente
export function createClientSupabaseClient() {
  if (clientSingleton) return clientSingleton

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  clientSingleton = createClient(supabaseUrl, supabaseKey)
  return clientSingleton
}
