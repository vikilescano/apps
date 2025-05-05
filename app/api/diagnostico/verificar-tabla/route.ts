import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Verificar si la tabla existe
    const { data: tablesData, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "respuestas_cronotipo")

    if (tablesError) {
      return NextResponse.json({
        success: false,
        error: `Error al verificar la tabla: ${tablesError.message}`,
      })
    }

    if (!tablesData || tablesData.length === 0) {
      return NextResponse.json({
        success: false,
        error: "La tabla respuestas_cronotipo no existe",
      })
    }

    // Obtener la estructura de la tabla usando la nueva función
    const { data: estructura, error: estructuraError } = await supabase.rpc("get_table_schema", {
      p_table_name: "respuestas_cronotipo",
    })

    if (estructuraError) {
      return NextResponse.json({
        success: false,
        error: `Error al obtener la estructura: ${estructuraError.message}`,
        tableInfo: null,
      })
    }

    // Intentar insertar datos de prueba
    const testData = {
      id: "00000000-0000-0000-0000-000000000000",
      created_at: new Date().toISOString(),
      edad: 30,
      genero: "test",
      provincia: "test",
      pais: "test",
      hora_despertar_lab: "08:00",
      min_despertar_lab: 10,
      hora_acostar_lab: "23:00",
      min_dormirse_lab: 15,
      hora_despertar_lib: "09:00",
      min_despertar_lib: 10,
      hora_acostar_lib: "00:00",
      min_dormirse_lib: 15,
      msf: 4.5,
      msf_sc: 4.2,
      sd_w: 7.5,
      sd_f: 8.0,
      sd_week: 7.7,
      so_f: 0.5,
      sjl: 1.0,
      cronotipo: "Intermedio",
    }

    // Intentar insertar datos de prueba
    const { error: insertError } = await supabase.from("respuestas_cronotipo").upsert(testData, { onConflict: "id" })

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: `Error al insertar datos de prueba: ${insertError.message}`,
        tableInfo: estructura,
      })
    }

    // Eliminar los datos de prueba
    await supabase.from("respuestas_cronotipo").delete().eq("id", "00000000-0000-0000-0000-000000000000")

    return NextResponse.json({
      success: true,
      tabla_existe: true,
      insercion_ok: true,
      tableInfo: estructura,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Error general: ${String(error)}`,
    })
  }
}
