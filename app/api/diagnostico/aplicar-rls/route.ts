import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Aplicar RLS usando la función creada
    const { error } = await supabase.rpc("enable_rls_on_respuestas_cronotipo")

    if (error) {
      console.error("Error al aplicar RLS:", error)
      return NextResponse.json({
        success: false,
        error: "Error al aplicar RLS",
        details: error,
      })
    }

    // Verificar que RLS se aplicó correctamente
    const { data: rlsData, error: rlsError } = await supabase.rpc("check_rls_status", {
      table_name: "respuestas_cronotipo",
    })

    if (rlsError) {
      console.error("Error al verificar RLS después de aplicarlo:", rlsError)
    }

    // Obtener políticas creadas
    const { data: policiesData, error: policiesError } = await supabase.rpc("get_table_policies", {
      table_name: "respuestas_cronotipo",
    })

    if (policiesError) {
      console.error("Error al obtener políticas después de aplicar RLS:", policiesError)
    }

    return NextResponse.json({
      success: true,
      rls_enabled: rlsData?.is_rls_enabled || false,
      policies: policiesData || [],
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
