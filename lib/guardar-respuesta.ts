import { createServerSupabaseClient } from "@/lib/supabase"
import { promises as fs } from "fs"
import path from "path"

// Asegurarse de que el directorio data existe
async function ensureDirectoryExists() {
  const dir = path.join(process.cwd(), "data")
  try {
    await fs.access(dir)
  } catch (error) {
    await fs.mkdir(dir, { recursive: true })
  }
}

// Guardar respuesta en el servidor
export async function guardarRespuestaEnServidor(respuesta: any) {
  try {
    await ensureDirectoryExists()

    // Ruta al archivo JSON
    const dataFilePath = path.join(process.cwd(), "data", "respuestas.json")

    // Leer respuestas existentes
    let respuestas = []
    try {
      const data = await fs.readFile(dataFilePath, "utf8")
      respuestas = JSON.parse(data)
    } catch (error) {
      // Si el archivo no existe o hay un error al leerlo, usar un array vacío
      respuestas = []
    }

    // Verificar si la respuesta ya existe
    const index = respuestas.findIndex((r: any) => r.id === respuesta.id)

    if (index >= 0) {
      // Actualizar respuesta existente
      respuestas[index] = respuesta
    } else {
      // Añadir nueva respuesta
      respuestas.push(respuesta)
    }

    // Guardar todas las respuestas
    await fs.writeFile(dataFilePath, JSON.stringify(respuestas, null, 2), "utf8")

    return true
  } catch (error) {
    console.error("Error al guardar respuesta en el servidor:", error)
    return false
  }
}

// Lista de campos válidos en la tabla respuestas_cronotipo
const camposValidos = [
  "id",
  "created_at",
  "edad",
  "genero",
  "provincia",
  "pais",
  "hora_despertar_lab",
  "min_despertar_lab",
  "despertar_antes_alarma_lab",
  "hora_despierto_lab",
  "hora_energia_baja_lab",
  "hora_acostar_lab",
  "min_dormirse_lab",
  "siesta_lab",
  "duracion_siesta_lab",
  "hora_sueno_despertar_lib",
  "hora_despertar_lib",
  "intenta_dormir_mas_lib",
  "min_extra_sueno_lib",
  "min_despertar_lib",
  "hora_despierto_lib",
  "hora_energia_baja_lib",
  "hora_acostar_lib",
  "min_dormirse_lib",
  "siesta_lib",
  "duracion_siesta_lib",
  "actividades_antes_dormir",
  "min_lectura_antes_dormir",
  "min_maximo_lectura",
  "prefiere_oscuridad_total",
  "despierta_mejor_con_luz",
  "horas_aire_libre_lab",
  "min_aire_libre_lab",
  "horas_aire_libre_lib",
  "min_aire_libre_lib",
  "msf",
  "msf_sc",
  "sd_w",
  "sd_f",
  "sd_week",
  "so_f",
  "sjl",
  "cronotipo",
]

// Guardar respuesta en Supabase
export async function guardarRespuestaEnSupabase(respuesta: any) {
  try {
    // Usar el cliente con rol de servicio para evitar restricciones de RLS
    const supabase = createServerSupabaseClient()

    // Crear un nuevo objeto solo con los campos válidos
    const datosParaSupabase: Record<string, any> = {}

    // Solo incluir campos que existen en la tabla
    for (const campo of camposValidos) {
      if (respuesta[campo] !== undefined) {
        datosParaSupabase[campo] = respuesta[campo]
      }
    }

    console.log("Campos que se enviarán a Supabase:", Object.keys(datosParaSupabase))

    // Intentar primero con upsert
    const { error } = await supabase.from("respuestas_cronotipo").upsert(datosParaSupabase, { onConflict: "id" })

    // Si hay un error de RLS, intentar con el método insert
    if (error && error.message.includes("row-level security")) {
      console.log("Error de RLS con upsert, intentando con insert...")
      const { error: insertError } = await supabase.from("respuestas_cronotipo").insert(datosParaSupabase)

      if (insertError) {
        console.error("Error al insertar en Supabase:", insertError)
        return false
      }
    } else if (error) {
      console.error("Error al guardar en Supabase:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error al guardar en Supabase:", error)
    return false
  }
}

// Función principal para guardar respuesta en todas las ubicaciones
export async function guardarRespuesta(respuesta: any) {
  // Guardar en el servidor
  const servidorOk = await guardarRespuestaEnServidor(respuesta)

  // Intentar guardar en Supabase
  const supabaseOk = await guardarRespuestaEnSupabase(respuesta)

  return {
    success: servidorOk || supabaseOk,
    servidorOk,
    supabaseOk,
  }
}

// Alias para compatibilidad
export const guardarRespuestaLocal = guardarRespuesta
