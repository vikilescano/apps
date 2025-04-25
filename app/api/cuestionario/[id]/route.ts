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

      // Días laborables
      horaDespertarLaboral: data.hora_despertar_lab,
      minutosPararDespertarLaboral: data.min_despertar_lab,
      despertarAntesAlarmaLaboral: data.despertar_antes_alarma_lab,
      horaCompletamenteDespiertaLaboral: data.hora_despierto_lab,
      horaEnergiaBajaLaboral: data.hora_energia_baja_lab,
      horaAcostarseLaboral: data.hora_acostar_lab,
      minutosParaDormirseLaboral: data.min_dormirse_lab,
      siestaDiaLaboral: data.siesta_lab,
      duracionSiestaDiaLaboral: data.duracion_siesta_lab,

      // Días libres
      horaSuenoDespetarLibre: data.hora_sueno_despertar_lib,
      horaDespertarLibre: data.hora_despertar_lib,
      intentaDormirMasLibre: data.intenta_dormir_mas_lib,
      minutosExtraSuenoLibre: data.min_extra_sueno_lib,
      minutosPararDespertarLibre: data.min_despertar_lib,
      horaCompletamenteDespiertaLibre: data.hora_despierto_lib,
      horaEnergiaBajaLibre: data.hora_energia_baja_lib,
      horaAcostarseLibre: data.hora_acostar_lib,
      minutosParaDormirseLibre: data.min_dormirse_lib,
      siestaDiaLibre: data.siesta_lib,
      duracionSiestaDiaLibre: data.duracion_siesta_lib,

      // Hábitos antes de dormir y preferencias
      actividadesAntesDormir: data.actividades_antes_dormir || [],
      minutosLecturaAntesDormir: data.min_lectura_antes_dormir,
      minutosMaximoLectura: data.min_maximo_lectura,
      prefiereOscuridadTotal: data.prefiere_oscuridad_total,
      despiertaMejorConLuz: data.despierta_mejor_con_luz,

      // Tiempo al aire libre
      horasAireLibreDiasLaborales: data.horas_aire_libre_lab,
      minutosAireLibreDiasLaborales: data.min_aire_libre_lab,
      horasAireLibreDiasLibres: data.horas_aire_libre_lib,
      minutosAireLibreDiasLibres: data.min_aire_libre_lib,

      // Resultados calculados
      MSF: data.msf,
      MSFsc: data.msf_sc,
      SDw: data.sd_w,
      SDf: data.sd_f,
      SDweek: data.sd_week,
      SOf: data.so_f,
      SJL: data.sjl,
      cronotipo: data.cronotipo,
    }

    return NextResponse.json(respuesta)
  } catch (error) {
    console.error("Error al obtener la respuesta:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
