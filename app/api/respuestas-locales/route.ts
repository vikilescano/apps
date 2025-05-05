import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Ruta al archivo JSON donde se guardarán las respuestas
const dataFilePath = path.join(process.cwd(), "data", "respuestas.json")

// Asegurarse de que el directorio data existe
async function ensureDirectoryExists() {
  const dir = path.join(process.cwd(), "data")
  try {
    await fs.access(dir)
  } catch (error) {
    await fs.mkdir(dir, { recursive: true })
  }
}

// Leer las respuestas existentes
async function readResponses() {
  try {
    await ensureDirectoryExists()

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

// Guardar las respuestas
async function saveResponses(responses: any[]) {
  try {
    await ensureDirectoryExists()
    await fs.writeFile(dataFilePath, JSON.stringify(responses, null, 2), "utf8")
    return true
  } catch (error) {
    console.error("Error al guardar respuestas:", error)
    return false
  }
}

// POST - Guardar una nueva respuesta
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Asegurarse de que hay un ID
    const id = data.id || uuidv4()
    const created_at = data.created_at || new Date().toISOString()

    // Crear el objeto de respuesta
    const respuesta = {
      ...data,
      id,
      created_at,
      guardado_local: true,
    }

    // Leer respuestas existentes
    const respuestas = await readResponses()

    // Verificar si la respuesta ya existe
    const index = respuestas.findIndex((r: any) => r.id === id)

    if (index >= 0) {
      // Actualizar respuesta existente
      respuestas[index] = respuesta
    } else {
      // Añadir la nueva respuesta
      respuestas.push(respuesta)
    }

    // Guardar todas las respuestas
    const success = await saveResponses(respuestas)

    if (success) {
      return NextResponse.json({
        success: true,
        id,
        message: "Respuesta guardada correctamente en el servidor local",
      })
    } else {
      return NextResponse.json({
        success: false,
        id,
        error: "Error al guardar la respuesta en el servidor",
      })
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error al procesar la solicitud: ${error.message}`,
      },
      { status: 500 },
    )
  }
}

// GET - Obtener todas las respuestas
export async function GET() {
  try {
    const respuestas = await readResponses()
    return NextResponse.json(respuestas)
  } catch (error) {
    console.error("Error al obtener respuestas:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error al obtener respuestas: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
