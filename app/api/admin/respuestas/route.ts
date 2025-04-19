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
      createdAt: item.created_at,
      edad: item.edad,
      genero: item.genero,
      ciudad: item.ciudad,
      pais: item.pais,

      // Resultados calculados
      MSF: item.msf,
      MSFsc: item.msf_sc,
      SDw: item.sd_w,
      SDf: item.sd_f,
      SDweek: item.sd_week,
      SOf: item.so_f,
      SJL: item.sjl,
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
