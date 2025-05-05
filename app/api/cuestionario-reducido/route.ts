import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    console.log("API: Recibiendo solicitud en /api/cuestionario-reducido")
    const data = await request.json()
    console.log("API: Datos recibidos correctamente")

    // Generar un ID único para la respuesta
    const id = uuidv4()
    console.log("API: ID generado:", id)

    // Preparar la respuesta
    const respuesta = {
      id,
      tipo_cuestionario: "reducido",
      created_at: new Date().toISOString(),

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
      msf: data.MSF,
      msf_sc: data.MSFsc,
      sd_w: data.SDw,
      sd_f: data.SDf,
      sd_week: data.SDweek,
      so_f: data.SOf,
      sjl: data.SJL,
      cronotipo: data.cronotipo,

      // Campos específicos del cuestionario reducido
      hora_preparado_dormir_lab: data.horaPreparadoDormirLaboral,
      hora_preparado_dormir_lib: data.horaPreparadoDormirLibre,
      usa_alarma_lab: data.usaAlarmaLaboral,
      usa_alarma_lib: data.usaAlarmaLibre,
      razones_no_elegir_sueno: data.razonesNoElegirSueno,
      tipo_razones_no_elegir_sueno: data.tipoRazonesNoElegirSueno,
    }

    // Almacenar en localStorage desde el servidor no es posible, pero podemos devolver los datos
    // para que el cliente los almacene
    return NextResponse.json({
      id,
      success: true,
      localOnly: true,
      data: respuesta,
    })
  } catch (error) {
    console.error("API: Error al procesar la solicitud:", error)
    // Generar un ID de emergencia para garantizar que el flujo continúe
    const emergencyId = uuidv4()
    return NextResponse.json(
      {
        id: emergencyId,
        success: true,
        localOnly: true,
        error: `Error al procesar la solicitud: ${error.message}`,
      },
      { status: 200 }, // Devolver 200 para que el cliente pueda continuar
    )
  }
}
