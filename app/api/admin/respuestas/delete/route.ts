import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron IDs válidos" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Eliminar las respuestas seleccionadas
    const { error } = await supabase.from("respuestas_cronotipo").delete().in("id", ids)

    if (error) {
      console.error("Error al eliminar respuestas:", error)
      return NextResponse.json({ error: "Error al eliminar las respuestas" }, { status: 500 })
    }

    return NextResponse.json({ success: true, deletedCount: ids.length })
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
