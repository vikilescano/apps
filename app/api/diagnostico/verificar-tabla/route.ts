import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    const resultados = {
      conexion: { success: false, message: "", error: null },
      estructura: { success: false, message: "", error: null },
      permisos: { success: false, message: "", error: null },
      informacion: { success: false, message: "", error: null },
    }

    // 1. Verificar conexión
    try {
      const { data: version, error: versionError } = await supabase.rpc("version")
      if (versionError) throw versionError
      resultados.conexion = {
        success: true,
        message: "Conexión a Supabase establecida correctamente",
        error: null,
      }
    } catch (error) {
      resultados.conexion = {
        success: false,
        message: "Error al conectar con Supabase",
        error: String(error),
      }
      // Si no hay conexión, devolver resultados inmediatamente
      return NextResponse.json(resultados)
    }

    // 2. Verificar estructura de la tabla
    try {
      const { data: estructura, error: estructuraError } = await supabase.rpc("get_table_schema", {
        p_table_name: "respuestas_cronotipo",
      })

      if (estructuraError) throw estructuraError

      resultados.estructura = {
        success: true,
        message: "Estructura de la tabla obtenida correctamente",
        data: estructura,
        error: null,
      }
    } catch (error) {
      resultados.estructura = {
        success: false,
        message: "Error al obtener la estructura",
        error: String(error),
      }
    }

    // 3. Verificar permisos de escritura
    try {
      // Datos de prueba para insertar
      const datosTest = {
        edad: 30,
        genero: "test",
        cronotipo: "test",
        msf_sc: 4.5,
        sjl: 1.0,
      }

      // Insertar datos de prueba
      const { data: insertData, error: insertError } = await supabase
        .from("respuestas_cronotipo")
        .insert([datosTest])
        .select()

      if (insertError) throw insertError

      // Si llegamos aquí, la inserción fue exitosa
      resultados.permisos = {
        success: true,
        message: "Permisos de escritura verificados correctamente",
        data: insertData,
        error: null,
      }

      // Eliminar el registro de prueba
      if (insertData && insertData.length > 0) {
        await supabase.from("respuestas_cronotipo").delete().eq("id", insertData[0].id)
      }
    } catch (error) {
      resultados.permisos = {
        success: false,
        message: "Error al insertar datos",
        error: String(error),
      }
    }

    // 4. Obtener información detallada de la tabla
    try {
      const { data: tablaInfo, error: tablaError } = await supabase.from("respuestas_cronotipo").select("*").limit(1)

      if (tablaError) throw tablaError

      // Contar registros
      const { count, error: countError } = await supabase
        .from("respuestas_cronotipo")
        .select("*", { count: "exact", head: true })

      if (countError) throw countError

      resultados.informacion = {
        success: true,
        message: "Información de la tabla obtenida correctamente",
        count: count,
        columnas: tablaInfo && tablaInfo.length > 0 ? Object.keys(tablaInfo[0]).length : 0,
        error: null,
      }
    } catch (error) {
      resultados.informacion = {
        success: false,
        message: "No se pudo obtener información detallada de la tabla",
        error: String(error),
      }
    }

    return NextResponse.json(resultados)
  } catch (error) {
    console.error("Error general:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error general al verificar la tabla",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
