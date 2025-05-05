import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Iniciando verificación de tabla respuestas_cronotipo...")
    const supabase = createServerSupabaseClient()

    // Verificar si la tabla existe intentando obtener su estructura
    const { data: tableInfo, error: tableError } = await supabase
      .rpc("get_table_definition", {
        table_name: "respuestas_cronotipo",
      })
      .catch(() => ({ data: null, error: { message: "Error al verificar la tabla" } }))

    if (tableError) {
      console.error("Error al verificar la tabla:", tableError)

      // Intentar una consulta simple para ver si la tabla existe
      const { data: testData, error: testError } = await supabase.from("respuestas_cronotipo").select("id").limit(1)

      if (testError) {
        return NextResponse.json({
          success: false,
          exists: false,
          error: `Error al verificar la tabla: ${testError.message}`,
          suggestion: "La tabla 'respuestas_cronotipo' podría no existir o no tener los permisos correctos.",
        })
      }

      return NextResponse.json({
        success: true,
        exists: true,
        message: "La tabla existe pero no se pudo obtener su estructura",
        data: testData,
      })
    }

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

    const { error: insertError } = await supabase.from("respuestas_cronotipo").insert(testData)

    if (insertError) {
      console.error("Error al insertar datos de prueba:", insertError)
      return NextResponse.json({
        success: false,
        exists: true,
        canInsert: false,
        error: `Error al insertar: ${insertError.message}`,
        suggestion: "La tabla existe pero no se pueden insertar datos. Verifica los permisos.",
      })
    }

    // Eliminar el registro de prueba
    await supabase.from("respuestas_cronotipo").delete().eq("id", testId)

    return NextResponse.json({
      success: true,
      exists: true,
      canInsert: true,
      message: "La tabla existe y se pueden insertar datos correctamente",
      tableInfo: tableInfo,
    })
  } catch (error) {
    console.error("Error general:", error)
    return NextResponse.json({
      success: false,
      error: `Error general: ${error.message}`,
      suggestion: "Verifica la conexión a Supabase y las variables de entorno.",
    })
  }
}
