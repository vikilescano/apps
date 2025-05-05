import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "Variables de entorno de Supabase no configuradas correctamente",
        variables: {
          url: supabaseUrl ? "Configurada" : "No configurada",
          key: supabaseKey ? "Configurada" : "No configurada",
        },
      })
    }

    // Crear cliente de Supabase con timeout extendido
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
      global: {
        fetch: (...args) => {
          const [input, init = {}] = args
          return fetch(input, {
            ...init,
            signal: AbortSignal.timeout(30000), // 30 segundos de timeout
          })
        },
      },
    })

    // Verificar conexión básica
    const { data: connectionTest, error: connectionError } = await supabase
      .from("respuestas_cronotipo")
      .select("count")
      .limit(1)

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: "Error de conexión a Supabase",
        details: connectionError,
      })
    }

    // Verificar estructura de la tabla
    const { data: tableSchema, error: tableError } = await supabase.rpc("get_table_schema", {
      table_name: "respuestas_cronotipo",
    })

    // Verificar permisos
    const testId = "00000000-0000-0000-0000-000000000000"
    const { error: insertError } = await supabase.from("respuestas_cronotipo").insert({
      id: testId,
      created_at: new Date().toISOString(),
      tipo_cuestionario: "test",
    })

    // Eliminar el registro de prueba
    if (!insertError) {
      await supabase.from("respuestas_cronotipo").delete().eq("id", testId)
    }

    // Obtener información de la tabla
    const { data: tableInfo, error: infoError } = await supabase
      .from("information_schema.tables")
      .select("*")
      .eq("table_name", "respuestas_cronotipo")
      .single()

    return NextResponse.json({
      success: true,
      connectionTest,
      tableSchema,
      tableSchemaError: tableError,
      tableInfo,
      tableInfoError: infoError,
      insertPermission: !insertError,
      insertError,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Error inesperado al diagnosticar Supabase",
      details: error.message,
    })
  }
}
