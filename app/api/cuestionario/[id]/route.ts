import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createServerSupabaseClient()

    // Obtener los datos del cuestionario de Supabase
    const { data, error } = await supabase.from("respuestas_cronotipo").select("*").eq("id", id).single()

    if (error || !data) {
      console.error("Error al obtener el cuestionario:", error)
      return NextResponse.json({ error: "Cuestionario no encontrado" }, { status: 404 })
    }

    console.log("Datos obtenidos de la base de datos:", data)

    // Mapear los datos de la base de datos a la estructura esperada por el frontend
    const respuesta = {
      id: data.id,
      createdAt: data.created_at,
      tipoCuestionario: data.tipo_cuestionario || "general",

      // Datos demográficos
      edad: data.edad,
      genero: data.genero,
      provincia: data.provincia,
      pais: data.pais,

      // Resultados calculados
      MSF: data.msf,
      MSFsc: data.msf_sc,
      SDw: data.sd_w,
      SDf: data.sd_f,
      SDweek: data.sd_week,
      SOf: data.so_f,
      SJL: data.sjl,
      cronotipo: data.cronotipo,

      // Formatear horas para mostrar en la interfaz
      horaDespertarLaboral: data.hora_despertar_lab,
      horaAcostarseLaboral: data.hora_acostar_lab,
      minutosParaDormirseLaboral: data.min_dormirse_lab,
      horaDespertarLibre: data.hora_despertar_lib,
      horaAcostarseLibre: data.hora_acostar_lib,
      minutosParaDormirseLibre: data.min_dormirse_lib,
    }

    console.log("Respuesta formateada:", respuesta)
    return NextResponse.json(respuesta)
  } catch (error) {
    console.error("Error al obtener la respuesta:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
