import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Datos de prueba para insertar
    const datosTest = {
      edad: 30,
      genero: "femenino",
      provincia: "Test",
      pais: "Test",
      hora_despertar_lab: "07:00",
      min_despertar_lab: 15,
      despertar_antes_alarma_lab: false,
      hora_despierto_lab: "07:30",
      hora_energia_baja_lab: "15:00",
      hora_acostar_lab: "23:00",
      min_dormirse_lab: 20,
      siesta_lab: false,
      duracion_siesta_lab: 0,
      hora_despertar_lib: "08:30",
      min_despertar_lib: 0,
      intenta_dormir_mas_lib: true,
      min_extra_sueno_lib: 60,
      hora_despierto_lib: "09:00",
      hora_energia_baja_lib: "16:00",
      hora_acostar_lib: "00:00",
      min_dormirse_lib: 15,
      siesta_lib: true,
      duracion_siesta_lib: 30,
      prefiere_oscuridad_total: true,
      despierta_mejor_con_luz: true,
      horas_aire_libre_lab: 1,
      min_aire_libre_lab: 30,
      horas_aire_libre_lib: 3,
      min_aire_libre_lib: 0,
      msf: 5.5,
      msf_sc: 4.8,
      sd_w: 7.5,
      sd_f: 8.25,
      sd_week: 7.75,
      so_f: 1.5,
      sjl: 1.2,
      cronotipo: "Intermedio",
    }

    // Eliminar tipo_cuestionario si existe en los datos de prueba
    if ("tipo_cuestionario" in datosTest) {
      delete datosTest.tipo_cuestionario
    }

    // Insertar datos de prueba
    const { data, error } = await supabase.from("respuestas_cronotipo").insert([datosTest]).select()

    if (error) {
      return NextResponse.json(
        { success: false, message: "Error al insertar datos de prueba", error: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, message: "Datos de prueba insertados correctamente", data })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { success: false, message: "Error al procesar la solicitud", error: String(error) },
      { status: 500 },
    )
  }
}

import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Eliminar tipo_cuestionario si existe en los datos
    if (data && data.tipo_cuestionario) {
      delete data.tipo_cuestionario
    }

    // Intentar guardar en Supabase
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("respuestas_cronotipo").insert(data)

    if (error) {
      console.error("Error al insertar datos de prueba:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
