import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Campos permitidos para actualizar
    const allowedFields = [
      "edad",
      "genero",
      "provincia",
      "pais",
      "cronotipo",
      "msf_sc",
      "sjl",
      "horas_aire_libre_lab",
      "min_aire_libre_lab",
      "horas_aire_libre_lib",
      "min_aire_libre_lib",
    ]

    // Filtrar solo los campos permitidos
    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    // Actualizar la respuesta
    const { error } = await supabase.from("respuestas_cronotipo").update(updateData).eq("id", id)

    if (error) {
      console.error("Error al actualizar la respuesta:", error)
      return NextResponse.json({ error: "Error al actualizar la respuesta" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
