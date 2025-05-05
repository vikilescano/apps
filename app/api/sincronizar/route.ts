import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { promises as fs } from "fs"
import path from "path"

// Ruta al archivo JSON donde se guardarán las respuestas
const dataFilePath = path.join(process.cwd(), "data", "respuestas.json")

// Leer las respuestas existentes
async function readResponses() {
  try {
    try {
      const data = await fs.readFile(dataFilePath, "utf8")
      return JSON.parse(data)
    } catch (error) {
      // Si el archivo no existe o hay un error al leerlo, devolver un array vacío
      return []
    }
  } catch (error) {
    console.error("Error al leer respuestas:", error)
    return []
  }
}

// POST - Sincronizar respuestas locales con Supabase
export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "Variables de entorno de Supabase no configuradas correctamente",
      })
    }

    // Crear cliente de Supabase
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

    // Obtener respuestas locales
    const respuestasLocales = await readResponses()

    if (respuestasLocales.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay respuestas locales para sincronizar",
      })
    }

    // Sincronizar cada respuesta
    const resultados = []
    for (const respuesta of respuestasLocales) {
      try {
        // Preparar datos para Supabase (eliminar campos que no existen en la tabla)
        const { guardado_local, ...datosParaSupabase } = respuesta

        // Insertar o actualizar en Supabase
        const { error } = await supabase.from("respuestas_cronotipo").upsert(datosParaSupabase)

        resultados.push({
          id: respuesta.id,
          success: !error,
          error: error ? error.message : null,
        })
      } catch (error) {
        resultados.push({
          id: respuesta.id,
          success: false,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${resultados.filter((r) => r.success).length} de ${resultados.length} respuestas sincronizadas`,
      resultados,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Error al sincronizar respuestas: ${error.message}`,
    })
  }
}
