import { createClient } from "@supabase/supabase-js"

// Singleton para el cliente de Supabase en el lado del cliente
let clientSingleton: ReturnType<typeof createClient> | null = null

// Crear cliente de Supabase para el lado del servidor
export function createServerSupabaseClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Variables de entorno de Supabase no configuradas correctamente")
    }

    // Añadir opciones adicionales para mejorar la estabilidad
    const options = {
      auth: {
        persistSession: false,
      },
      global: {
        fetch: (...args) => {
          // Configurar un timeout para las solicitudes fetch
          const [input, init = {}] = args
          return fetch(input, {
            ...init,
            signal: AbortSignal.timeout(10000), // 10 segundos de timeout
          })
        },
      },
    }

    console.log("Creando cliente Supabase con URL:", supabaseUrl)
    return createClient(supabaseUrl, supabaseKey, options)
  } catch (error) {
    console.error("Error detallado al crear el cliente de Supabase:", error)
    throw error
  }
}

// Crear cliente de Supabase para el lado del cliente
export function createClientSupabaseClient() {
  if (clientSingleton) return clientSingleton

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Variables de entorno de Supabase no configuradas correctamente")
    }

    // Añadir opciones adicionales para mejorar la estabilidad
    const options = {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    }

    clientSingleton = createClient(supabaseUrl, supabaseKey, options)
    return clientSingleton
  } catch (error) {
    console.error("Error al crear el cliente de Supabase:", error)
    throw error
  }
}
