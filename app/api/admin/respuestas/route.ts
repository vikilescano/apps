import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("API de respuestas: Iniciando solicitud")
    const supabase = createServerSupabaseClient()

    // Verificar si la tabla existe antes de consultar
    const { data: tableExists, error: tableError } = await supabase.from("respuestas_cronotipo").select("id").limit(1)

    if (tableError) {
      console.error("Error al verificar la tabla:", tableError)
      // Si hay un error específico de que la tabla no existe
      if (tableError.message.includes("does not exist")) {
        return NextResponse.json({ error: "La tabla respuestas_cronotipo no existe" }, { status: 404 })
      }
      return NextResponse.json({ error: tableError.message }, { status: 500 })
    }

    console.log("API de respuestas: Tabla verificada, obteniendo datos")

    // Obtener todas las respuestas
    const { data, error } = await supabase
      .from("respuestas_cronotipo")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener respuestas:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`API de respuestas: ${data?.length || 0} respuestas obtenidas`)

    // Si no hay datos, devolver un array vacío en lugar de null
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error en la API de respuestas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
