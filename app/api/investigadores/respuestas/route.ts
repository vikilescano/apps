import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Obtener todas las respuestas de Supabase
    const { data, error } = await supabase
      .from("respuestas_cronotipo")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener las respuestas:", error)
      return NextResponse.json({ error: "Error al obtener las respuestas" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error al obtener las respuestas:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
