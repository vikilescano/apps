import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Obtener todas las respuestas de Supabase
    const { data, error } = await supabase
      .from("respuestas_cronotipo")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener las respuestas:", error)
      return NextResponse.json({ error: "Error al obtener las respuestas" }, { status: 500 })
    }

    // Mapear los datos para el frontend
    const respuestas = data.map((item) => ({
      id: item.id,
      created_at: item.created_at,
      edad: item.edad,
      genero: item.genero,
      provincia: item.provincia,
      pais: item.pais,

      // Resultados calculados
      msf: item.msf,
      msf_sc: item.msf_sc,
      sd_w: item.sd_w,
      sd_f: item.sd_f,
      sd_week: item.sd_week,
      so_f: item.so_f,
      sjl: item.sjl,
      cronotipo: item.cronotipo,

      // Incluir todos los campos originales para el CSV
      ...item,
    }))

    return NextResponse.json(respuestas)
  } catch (error) {
    console.error("Error al obtener las respuestas:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
