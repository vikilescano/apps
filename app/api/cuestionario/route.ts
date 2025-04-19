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
      provincia: data.provincia, // Cambiado de ciudad a provincia
      pais: data.pais,
      email: data.email,

      // Días laborables
      hora_despertar_lab: data.horaDespertarLaboral,
      min_despertar_lab: data.minutosPararDespertarLaboral,
      despertar_antes_alarma_lab: data.despertarAntesAlarmaLaboral,
      hora_despierto_lab: data.horaCompletamenteDespiertaLaboral,
      hora_energia_baja_lab: data.horaEnergiaBajaLaboral,
      hora_acostar_lab: data.horaAcostarseLaboral,
      min_dormirse_lab: data.minutosParaDormirseLaboral,
      siesta_lab: data.siestaDiaLaboral,
      duracion_siesta_lab: data.duracionSiestaDiaLaboral,

      // Días libres
      hora_sueno_despertar_lib: data.horaSuenoDespetarLibre,
      hora_despertar_lib: data.horaDespertarLibre,
      intenta_dormir_mas_lib: data.intentaDormirMasLibre,
      min_extra_sueno_lib: data.minutosExtraSuenoLibre,
      min_despertar_lib: data.minutosPararDespertarLibre,
      hora_despierto_lib: data.horaCompletamenteDespiertaLibre,
      hora_energia_baja_lib: data.horaEnergiaBajaLibre,
      hora_acostar_lib: data.horaAcostarseLibre,
      min_dormirse_lib: data.minutosParaDormirseLibre,
      siesta_lib: data.siestaDiaLibre,
      duracion_siesta_lib: data.duracionSiestaDiaLibre,

      // Hábitos antes de dormir y preferencias
      actividades_antes_dormir: data.actividadesAntesDormir || [],
      min_lectura_antes_dormir: data.minutosLecturaAntesDormir,
      min_maximo_lectura: data.minutosMaximoLectura,
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

    // Guardar en Supabase
    const { error } = await supabase.from("respuestas_cronotipo").insert(respuesta)

    if (error) {
      console.error("Error al guardar en Supabase:", error)
      return NextResponse.json({ error: "Error al guardar la respuesta" }, { status: 500 })
    }

    // Si hay un correo electrónico, enviar los resultados
    if (data.email) {
      try {
        await fetch("/api/enviar-resultados", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            id: id,
            cronotipo: data.cronotipo,
            msf_sc: data.MSFsc,
            sjl: data.SJL,
          }),
        })
      } catch (emailError) {
        console.error("Error al enviar el correo electrónico:", emailError)
        // No interrumpimos el flujo si falla el envío del correo
      }
    }

    return NextResponse.json({ id, success: true })
  } catch (error) {
    console.error("Error al guardar la respuesta:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
