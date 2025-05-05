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

// Guardar respuesta en Supabase
export async function guardarRespuestaEnSupabase(respuesta: any) {
  try {
    const supabase = createServerSupabaseClient()

    // Preparar datos para Supabase (eliminar campos que no existen en la tabla)
    const { guardado_local, ...datosParaSupabase } = respuesta

    // Insertar o actualizar en Supabase
    const { error } = await supabase.from("respuestas_cronotipo").upsert(datosParaSupabase)

    if (error) {
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
