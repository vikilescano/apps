import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    console.log("API: Recibiendo solicitud en /api/diagnostico/test-insert")

    // Obtener datos de la solicitud
    const data = await request.json()
    console.log("API: Datos recibidos para inserción de prueba:", data.id)

    // Crear cliente de Supabase
    const supabase = createServerSupabaseClient()

    // Intentar insertar datos en la tabla
    const { data: insertedData, error } = await supabase.from("respuestas_cronotipo").insert(data).select()

    if (error) {
      console.error("API: Error al insertar datos en Supabase:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      })
    }

    // Verificar si los datos se insertaron correctamente
    const { data: verifyData, error: verifyError } = await supabase
      .from("respuestas_cronotipo")
      .select("*")
      .eq("id", data.id)
      .single()

    if (verifyError) {
      console.error("API: Error al verificar la inserción:", verifyError)
      return NextResponse.json({
        success: false,
        error: "Los datos se insertaron pero no se pudieron verificar",
        details: verifyError,
      })
    }

    console.log("API: Datos insertados y verificados correctamente")
    return NextResponse.json({
      success: true,
      message: "Datos insertados correctamente en Supabase",
      data: verifyData,
    })
  } catch (error) {
    console.error("API: Error al procesar la solicitud:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error al procesar la solicitud: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
