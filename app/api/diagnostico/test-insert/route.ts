import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Intentar guardar en Supabase
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("respuestas_cronotipo").insert(data)

    if (error) {
      console.error("Error al insertar datos de prueba:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
