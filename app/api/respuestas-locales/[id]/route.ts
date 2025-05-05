import { NextResponse } from "next/server"
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

// Guardar las respuestas
async function saveResponses(responses: any[]) {
  try {
    const dir = path.join(process.cwd(), "data")
    try {
      await fs.access(dir)
    } catch (error) {
      await fs.mkdir(dir, { recursive: true })
    }

    await fs.writeFile(dataFilePath, JSON.stringify(responses, null, 2), "utf8")
    return true
  } catch (error) {
    console.error("Error al guardar respuestas:", error)
    return false
  }
}

// GET - Obtener una respuesta específica por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const respuestas = await readResponses()

    // Buscar la respuesta con el ID especificado
    const respuesta = respuestas.find((r: any) => r.id === id)

    if (respuesta) {
      return NextResponse.json(respuesta)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `No se encontró ninguna respuesta con el ID: ${id}`,
        },
        { status: 404 },
      )
    }
  } catch (error) {
    console.error("Error al obtener la respuesta:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error al obtener la respuesta: ${error.message}`,
      },
      { status: 500 },
    )
  }
}

// PATCH - Actualizar una respuesta específica
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    // Leer respuestas existentes
    const respuestas = await readResponses()

    // Buscar la respuesta con el ID especificado
    const index = respuestas.findIndex((r: any) => r.id === id)

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: `No se encontró ninguna respuesta con el ID: ${id}`,
        },
        { status: 404 },
      )
    }

    // Actualizar la respuesta
    respuestas[index] = {
      ...respuestas[index],
      ...data,
      id, // Asegurarse de que el ID no cambie
    }

    // Guardar todas las respuestas
    const success = await saveResponses(respuestas)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Respuesta actualizada correctamente",
        data: respuestas[index],
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Error al guardar la respuesta actualizada",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error al actualizar la respuesta:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error al actualizar la respuesta: ${error.message}`,
      },
      { status: 500 },
    )
  }
}

// DELETE - Eliminar una respuesta específica
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Leer respuestas existentes
    const respuestas = await readResponses()

    // Filtrar la respuesta con el ID especificado
    const respuestasFiltradas = respuestas.filter((r: any) => r.id !== id)

    // Verificar si se encontró la respuesta
    if (respuestasFiltradas.length === respuestas.length) {
      return NextResponse.json(
        {
          success: false,
          error: `No se encontró ninguna respuesta con el ID: ${id}`,
        },
        { status: 404 },
      )
    }

    // Guardar las respuestas filtradas
    const success = await saveResponses(respuestasFiltradas)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Respuesta eliminada correctamente",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Error al guardar las respuestas actualizadas",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error al eliminar la respuesta:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error al eliminar la respuesta: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
