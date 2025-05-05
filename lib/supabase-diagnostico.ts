import { createClient } from "@supabase/supabase-js"

// Función para diagnosticar problemas con Supabase
export async function diagnosticarSupabase() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: "Variables de entorno de Supabase no configuradas correctamente",
        variables: {
          url: supabaseUrl ? "Configurada" : "No configurada",
          key: supabaseKey ? "Configurada" : "No configurada",
        },
      }
    }

    // Crear cliente de Supabase con timeout extendido
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
      global: {
        fetch: (...args) => {
          const [input, init = {}] = args
          return fetch(input, {
            ...init,
            signal: AbortSignal.timeout(30000), // 30 segundos de timeout
          })
        },
      },
    })

    // Verificar conexión básica
    const { data: connectionTest, error: connectionError } = await supabase
      .from("respuestas_cronotipo")
      .select("count")
      .limit(1)

    if (connectionError) {
      return {
        success: false,
        error: "Error de conexión a Supabase",
        details: connectionError,
      }
    }

    // Verificar estructura de la tabla
    const { data: tableInfo, error: tableError } = await supabase.rpc("get_table_info", {
      table_name: "respuestas_cronotipo",
    })

    if (tableError) {
      return {
        success: false,
        error: "Error al obtener información de la tabla",
        details: tableError,
      }
    }

    // Verificar permisos
    const { data: insertTest, error: insertError } = await supabase
      .from("respuestas_cronotipo")
      .insert({
        id: "00000000-0000-0000-0000-000000000000",
        created_at: new Date().toISOString(),
        tipo_cuestionario: "test",
      })
      .select()

    // Eliminar el registro de prueba
    if (!insertError) {
      await supabase.from("respuestas_cronotipo").delete().eq("id", "00000000-0000-0000-0000-000000000000")
    }

    return {
      success: true,
      connectionTest,
      tableInfo,
      insertPermission: !insertError,
      insertError,
    }
  } catch (error) {
    return {
      success: false,
      error: "Error inesperado al diagnosticar Supabase",
      details: error,
    }
  }
}

// Función para crear una tabla de respuestas desde cero
export async function crearTablaRespuestas() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: "Variables de entorno de Supabase no configuradas correctamente",
      }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Crear la tabla desde cero
    const { error } = await supabase.rpc("create_respuestas_table")

    if (error) {
      return {
        success: false,
        error: "Error al crear la tabla",
        details: error,
      }
    }

    return {
      success: true,
      message: "Tabla creada correctamente",
    }
  } catch (error) {
    return {
      success: false,
      error: "Error inesperado al crear la tabla",
      details: error,
    }
  }
}

// Función para sincronizar datos locales con Supabase
export async function sincronizarDatosLocales() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: "Variables de entorno de Supabase no configuradas correctamente",
      }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Obtener datos locales
    const datosLocales = JSON.parse(localStorage.getItem("cronotipo_todas_respuestas") || "[]")

    if (datosLocales.length === 0) {
      return {
        success: true,
        message: "No hay datos locales para sincronizar",
      }
    }

    // Sincronizar cada respuesta
    const resultados = []
    for (const respuesta of datosLocales) {
      const { error } = await supabase.from("respuestas_cronotipo").upsert(respuesta)
      resultados.push({
        id: respuesta.id,
        success: !error,
        error,
      })
    }

    return {
      success: true,
      message: `Sincronización completada: ${resultados.filter((r) => r.success).length} de ${resultados.length} respuestas sincronizadas`,
      resultados,
    }
  } catch (error) {
    return {
      success: false,
      error: "Error inesperado al sincronizar datos",
      details: error,
    }
  }
}
