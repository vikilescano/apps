import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { guardarRespuesta } from "@/lib/guardar-respuesta"

export async function POST(request: Request) {
  try {
    console.log("API: Recibiendo solicitud en /api/cuestionario-reducido")
    const data = await request.json()
    console.log("API: Datos recibidos correctamente")

    // Generar un ID único para la respuesta si no viene uno
    const id = data.id || uuidv4()
    console.log("API: ID generado o recibido:", id)

    // Preparar la respuesta para guardar
    const respuesta = {
      id,
      tipo_cuestionario: "reducido",
      created_at: data.created_at || new Date().toISOString(),

      // Datos demográficos
      edad: data.edad,
      genero: data.genero,
      provincia: data.provincia,
      pais: data.pais,

      // Días laborables
      hora_despertar_lab: data.horaDespertarLaboral,
      min_despertar_lab: data.minutosPararLevantarseLaboral,
      despertar_antes_alarma_lab: data.usaAlarmaLaboral ? data.despiertaAntesAlarmaLaboral : null,
      hora_despierto_lab: data.horaDespertarLaboral,
      hora_energia_baja_lab: "18:00",
      hora_acostar_lab: data.horaAcostarseLaboral,
      min_dormirse_lab: data.minutosParaDormirseLaboral,
      siesta_lab: false,
      duracion_siesta_lab: null,

      // Días libres
      hora_sueno_despertar_lib: data.horaDespertarLibre,
      hora_despertar_lib: data.horaDespertarLibre,
      intenta_dormir_mas_lib: false,
      min_extra_sueno_lib: null,
      min_despertar_lib: data.minutosPararLevantarseLibre,
      hora_despierto_lib: data.horaDespertarLibre,
      hora_energia_baja_lib: "18:00",
      hora_acostar_lib: data.horaAcostarseLibre,
      min_dormirse_lib: data.minutosParaDormirseLibre,
      siesta_lib: false,
      duracion_siesta_lib: null,

      // Hábitos antes de dormir y preferencias
      actividades_antes_dormir: data.actividadesAntesDormir || [],
      min_lectura_antes_dormir: data.minutosLecturaAntesDormir,
      min_maximo_lectura: 0,
      prefiere_oscuridad_total: data.prefiereOscuridadTotal,
      despierta_mejor_con_luz: data.despiertaMejorConLuz,

      // Tiempo al aire libre
      horas_aire_libre_lab: data.horasAireLibreDiasLaborales,
      min_aire_libre_lab: data.minutosAireLibreDiasLaborales,
      horas_aire_libre_lib: data.horasAireLibreDiasLibres,
      min_aire_libre_lib: data.minutosAireLibreDiasLibres,

      // Resultados calculados
      msf: data.MSF || data.msf,
      msf_sc: data.MSFsc || data.msf_sc,
      sd_w: data.SDw || data.sd_w,
      sd_f: data.SDf || data.sd_f,
      sd_week: data.SDweek || data.sd_week,
      so_f: data.SOf || data.so_f,
      sjl: data.SJL || data.sjl,
      cronotipo: data.cronotipo,

      // Campos específicos del cuestionario reducido
      hora_preparado_dormir_lab: data.horaPreparadoDormirLaboral,
      hora_preparado_dormir_lib: data.horaPreparadoDormirLibre,
      usa_alarma_lab: data.usaAlarmaLaboral === "true",
      usa_alarma_lib: data.usaAlarmaLibre === "true",
      razones_no_elegir_sueno: data.razonesNoElegirSueno === "true",
      tipo_razones_no_elegir_sueno: data.tipoRazonesNoElegirSueno,
    }

    // Guardar la respuesta usando nuestra función mejorada
    const resultado = await guardarRespuesta(respuesta)

    if (resultado.success) {
      console.log("API: Datos guardados correctamente")
      return NextResponse.json({
        id,
        success: true,
        servidorOk: resultado.servidorOk,
        supabaseOk: resultado.supabaseOk,
        data: respuesta,
      })
    } else {
      console.error("API: Error al guardar los datos")
      return NextResponse.json({
        id,
        success: false,
        error: "No se pudieron guardar los datos en ninguna ubicación",
      })
    }
  } catch (error) {
    console.error("API: Error al procesar la solicitud:", error)
    // Generar un ID de emergencia para garantizar que el flujo continúe
    const emergencyId = uuidv4()
    return NextResponse.json(
      {
        id: emergencyId,
        success: false,
        error: `Error al procesar la solicitud: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
