import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Iniciando prueba de conexión a Supabase...")

    // Verificar variables de entorno
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "No configurado",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurado" : "No configurado",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configurado" : "No configurado",
    }

    console.log("Variables de entorno:", envVars)

    // Intentar crear el cliente de Supabase
    let supabaseClient
    try {
      supabaseClient = createServerSupabaseClient()
      console.log("Cliente Supabase creado correctamente")
    } catch (error) {
      console.error("Error al crear el cliente Supabase:", error)
      return NextResponse.json({
        success: false,
        error: `Error al crear el cliente Supabase: ${error.message}`,
        envVars,
      })
    }

    // Intentar hacer una consulta simple
    try {
      const { data, error, status } = await supabaseClient.from("respuestas_cronotipo").select("count").limit(1)

      if (error) {
        console.error("Error en la consulta a Supabase:", error)
        return NextResponse.json({
          success: false,
          error: `Error en la consulta: ${error.message}`,
          status,
          envVars,
        })
      }

      console.log("Consulta exitosa:", data)

      // Intentar insertar un registro de prueba
      const testId = `test-${Date.now()}`
      const testData = {
        id: testId,
        tipo_cuestionario: "test",
        created_at: new Date().toISOString(),
        cronotipo: "Test",
        msf_sc: 4.5,
        sjl: 1.2,
      }

      const { error: insertError } = await supabaseClient.from("respuestas_cronotipo").insert(testData)

      if (insertError) {
        console.error("Error al insertar datos de prueba:", insertError)
        return NextResponse.json({
          success: false,
          error: `Error al insertar: ${insertError.message}`,
          envVars,
        })
      }

      // Eliminar el registro de prueba
      const { error: deleteError } = await supabaseClient.from("respuestas_cronotipo").delete().eq("id", testId)

      if (deleteError) {
        console.warn("Error al eliminar datos de prueba:", deleteError)
      }

      return NextResponse.json({
        success: true,
        message: "Conexión a Supabase verificada correctamente",
        envVars,
      })
    } catch (queryError) {
      console.error("Error al realizar operaciones en Supabase:", queryError)
      return NextResponse.json({
        success: false,
        error: `Error en operaciones: ${queryError.message}`,
        envVars,
      })
    }
  } catch (error) {
    console.error("Error general:", error)
    return NextResponse.json({
      success: false,
      error: `Error general: ${error.message}`,
    })
  }
}
