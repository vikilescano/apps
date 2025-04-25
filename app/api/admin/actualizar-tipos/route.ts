import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Obtener todas las respuestas que no tienen tipo_cuestionario
    const { data: respuestas, error: fetchError } = await supabase
      .from("respuestas_cronotipo")
      .select("*")
      .is("tipo_cuestionario", null)

    if (fetchError) {
      console.error("Error al obtener respuestas:", fetchError)
      return NextResponse.json({ error: "Error al obtener respuestas" }, { status: 500 })
    }

    // Contador de actualizaciones
    let actualizacionesGenerales = 0
    let actualizacionesReducidas = 0
    let errores = 0

    // Procesar cada respuesta para determinar su tipo
    for (const respuesta of respuestas || []) {
      let tipo = "general" // Por defecto asumimos que es el cuestionario general

      // Verificar si es un cuestionario reducido
      // Los cuestionarios reducidos tienen campos específicos como hora_preparado_dormir_lab
      if (
        respuesta.hora_preparado_dormir_lab ||
        respuesta.hora_preparado_dormir_lib ||
        respuesta.razones_no_elegir_sueno !== undefined ||
        respuesta.usa_alarma_lib !== undefined
      ) {
        tipo = "reducido"
      }

      // Actualizar el registro
      const { error: updateError } = await supabase
        .from("respuestas_cronotipo")
        .update({ tipo_cuestionario: tipo })
        .eq("id", respuesta.id)

      if (updateError) {
        console.error(`Error al actualizar respuesta ${respuesta.id}:`, updateError)
        errores++
      } else {
        if (tipo === "general") {
          actualizacionesGenerales++
        } else {
          actualizacionesReducidas++
        }
      }
    }

    return NextResponse.json({
      success: true,
      actualizacionesGenerales,
      actualizacionesReducidas,
      errores,
      totalActualizaciones: actualizacionesGenerales + actualizacionesReducidas,
    })
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
