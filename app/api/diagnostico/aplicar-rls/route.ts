import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Habilitar RLS
    const { error: rlsError } = await supabase.rpc("enable_rls_on_respuestas_cronotipo")

    if (rlsError) {
      console.error("Error al habilitar RLS:", rlsError)

      // Intentar con SQL directo si la función RPC falla
      const { error: sqlError } = await supabase.rpc("run_sql", {
        sql: `
          ALTER TABLE respuestas_cronotipo ENABLE ROW LEVEL SECURITY;
          
          -- Crear una política que permita a los usuarios autenticados insertar datos
          CREATE POLICY "Permitir inserciones a usuarios autenticados" 
          ON respuestas_cronotipo 
          FOR INSERT 
          TO authenticated 
          WITH CHECK (true);
          
          -- Crear una política que permita a los usuarios anónimos insertar datos
          CREATE POLICY "Permitir inserciones anónimas" 
          ON respuestas_cronotipo 
          FOR INSERT 
          TO anon 
          WITH CHECK (true);
          
          -- Crear una política que permita a los usuarios autenticados leer todos los datos
          CREATE POLICY "Permitir lectura a usuarios autenticados" 
          ON respuestas_cronotipo 
          FOR SELECT 
          TO authenticated 
          USING (true);
          
          -- Crear una política que permita al servicio leer y modificar todos los datos
          CREATE POLICY "Permitir todas las operaciones al servicio" 
          ON respuestas_cronotipo 
          FOR ALL 
          TO service_role 
          USING (true) 
          WITH CHECK (true);
        `,
      })

      if (sqlError) {
        return NextResponse.json({
          success: false,
          error: "Error al habilitar RLS con SQL directo",
          details: sqlError,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "RLS habilitado correctamente en la tabla respuestas_cronotipo",
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
