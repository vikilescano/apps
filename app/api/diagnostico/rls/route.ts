import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Verificar si RLS está habilitado usando la nueva función
    const { data: rlsData, error: rlsError } = await supabase.rpc("check_rls_status", {
      table_name: "respuestas_cronotipo",
    })

    if (rlsError) {
      console.error("Error al verificar RLS:", rlsError)
      return NextResponse.json({
        success: false,
        error: "Error al verificar RLS",
        details: rlsError,
      })
    }

    // Obtener políticas de RLS usando la nueva función
    const { data: policiesData, error: policiesError } = await supabase.rpc("get_table_policies", {
      table_name: "respuestas_cronotipo",
    })

    if (policiesError) {
      console.error("Error al obtener políticas:", policiesError)
    }

    return NextResponse.json({
      success: true,
      rls_enabled: rlsData?.is_rls_enabled || false,
      policies: policiesData || [],
    })
  } catch (error) {
    console.error("Error al realizar diagnóstico de RLS:", error)
    return NextResponse.json({
      success: false,
      error: "Error al realizar diagnóstico de RLS",
      details: error.message,
    })
  }
}
