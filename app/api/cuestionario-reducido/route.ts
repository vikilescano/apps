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
    // Solo incluir campos que sabemos que existen en la tabla
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

    // Primero, obtener la estructura de la tabla para ver qué columnas existen
    const { data: tableInfo, error: tableError } = await supabase.from("respuestas_cronotipo").select("*").limit(1)

    if (tableError) {
      console.error("Error al obtener información de la tabla:", tableError)
      return NextResponse.json({ error: "Error al obtener estructura de la tabla" }, { status: 500 })
    }

    // Si hay datos, usar las claves del primer registro para determinar las columnas existentes
    let columnas = []
    if (tableInfo && tableInfo.length > 0) {
      columnas = Object.keys(tableInfo[0])
      console.log("Columnas existentes en la tabla:", columnas)
    }

    // Filtrar el objeto respuesta para incluir solo las columnas que existen
    const respuestaFiltrada: any = {}
    Object.keys(respuesta).forEach((key) => {
      if (columnas.includes(key)) {
        respuestaFiltrada[key] = respuesta[key as keyof typeof respuesta]
      } else {
        console.log(`Columna no encontrada en la tabla: ${key}`)
      }
    })

    console.log("Objeto filtrado a insertar:", respuestaFiltrada)

    // Guardar en Supabase
    const { error } = await supabase.from("respuestas_cronotipo").insert(respuestaFiltrada)

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
