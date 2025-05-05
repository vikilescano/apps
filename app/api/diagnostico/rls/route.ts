import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Verificar si RLS está habilitado
    const { data: rlsData, error: rlsError } = await supabase
      .from("pg_tables")
      .select("rowsecurity")
      .eq("tablename", "respuestas_cronotipo")
      .single()

    if (rlsError) {
      console.error("Error al verificar RLS:", rlsError)
      return NextResponse.json({
        success: false,
        error: "Error al verificar RLS",
        details: rlsError,
      })
    }

    // Obtener políticas de RLS
    const { data: policiesData, error: policiesError } = await supabase
      .from("pg_policies")
      .select("*")
      .eq("tablename", "respuestas_cronotipo")

    if (policiesError) {
      console.error("Error al obtener políticas:", policiesError)
    }

    return NextResponse.json({
      success: true,
      rls_enabled: rlsData?.rowsecurity || false,
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
