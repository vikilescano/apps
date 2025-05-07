import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Realizar una consulta ligera para mantener la conexión activa
    // Solo consultamos un registro para minimizar el uso de recursos
    const { data, error } = await supabase.from("respuestas_cronotipo").select("id").limit(1)

    if (error) {
      console.error("Error al hacer ping a Supabase:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Error al conectar con Supabase",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        status: "ok",
        message: "Conexión a Supabase activa",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error inesperado al hacer ping:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error inesperado",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
