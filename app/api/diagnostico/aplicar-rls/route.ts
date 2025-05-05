import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Usar la nueva función para habilitar RLS y crear políticas
    const { error } = await supabase.rpc("enable_rls_on_respuestas_cronotipo")

    if (error) {
      console.error("Error al aplicar RLS:", error)
      return NextResponse.json({
        success: false,
        error: "Error al aplicar RLS",
        details: error.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: "RLS aplicado correctamente",
    })
  } catch (error) {
    console.error("Error al aplicar RLS:", error)
    return NextResponse.json({
      success: false,
      error: "Error al aplicar RLS",
      details: error.message,
    })
  }
}
