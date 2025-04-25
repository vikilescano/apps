import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const supabase = createServerSupabaseClient()

    // Generar un ID único para la respuesta
    const id = uuidv4()

    // Mapear los datos del formulario a la estructura de la base de datos
    const respuesta = {
      id,
      // Datos demográficos
      edad: data.edad,
      genero: data.genero,
      provincia: data.provincia,
      pais: data.pais,

      // Días laborables
      hora_despertar_lab: data.horaDespertarLaboral,
      min_despertar_lab: data.minutosPararLevantarseLaboral,
      despertar_antes_alarma_lab: data.usaAlarmaLaboral ? data.despiertaAntesAlarmaLaboral : null,
      hora_despierto_lab: data.horaDespertarLaboral, // Aproximación
      hora_energia_baja_lab: "18:00", // Valor por defecto
      hora_acostar_lab: data.horaAcostarseLaboral,
      min_dormirse_lab: data.minutosParaDormirseLaboral,
      siesta_lab: false,
      duracion_siesta_lab: null,

      // Días libres
      hora_sueno_despertar_lib: data.horaDespertarLibre, // Aproximación
      hora_despertar_lib: data.horaDespertarLibre,
      intenta_dormir_mas_lib: false, // Valor por defecto
      min_extra_sueno_lib: null,
      min_despertar_lib: data.minutosPararLevantarseLibre,
      hora_despierto_lib: data.horaDespertarLibre, // Aproximación
      hora_energia_baja_lib: "18:00", // Valor por defecto
      hora_acostar_lib: data.horaAcostarseLibre,
      min_dormirse_lib: data.minutosParaDormirseLibre,
      siesta_lib: false,
      duracion_siesta_lib: null,

      // Hábitos antes de dormir y preferencias
      actividades_antes_dormir: data.actividadesAntesDormir || [],
      min_lectura_antes_dormir: data.minutosLecturaAntesDormir,
      min_maximo_lectura: 0, // Ya no se usa en el formulario reducido
      prefiere_oscuridad_total: data.prefiereOscuridadTotal,
      despierta_mejor_con_luz: data.despiertaMejorConLuz,

      // Tiempo al aire libre
      horas_aire_libre_lab: data.horasAireLibreDiasLaborales,
      min_aire_libre_lab: data.minutosAireLibreDiasLaborales,
      horas_aire_libre_lib: data.horasAireLibreDiasLibres,
      min_aire_libre_lib: data.minutosAireLibreDiasLibres,

      // Datos adicionales del cuestionario reducido
      hora_preparado_dormir_lab: data.horaPreparadoDormirLaboral,
      hora_preparado_dormir_lib: data.horaPreparadoDormirLibre,
      usa_alarma_lib: data.usaAlarmaLibre,
      razones_no_elegir_sueno: data.razonesNoElegirSueno,
      razones_no_elegir_sueno_tipos: data.razonesNoElegirSuenoTipos || [],
      razones_no_elegir_sueno_otros: data.razonesNoElegirSuenoOtros || "",

      // Resultados calculados
      msf: data.MSF,
      msf_sc: data.MSFsc,
      sd_w: data.SDw,
      sd_f: data.SDf,
      sd_week: data.SDweek,
      so_f: data.SOf,
      sjl: data.SJL,
      cronotipo: data.cronotipo,
    }

    // Guardar en Supabase
    const { error } = await supabase.from("respuestas_cronotipo").insert(respuesta)

    if (error) {
      console.error("Error al guardar en Supabase:", error)
      return NextResponse.json({ error: "Error al guardar la respuesta" }, { status: 500 })
    }

    return NextResponse.json({ id, success: true })
  } catch (error) {
    console.error("Error al guardar la respuesta:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
