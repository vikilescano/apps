import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { guardarRespuestaLocal } from "@/lib/local-storage"

export async function POST(request: Request) {
  try {
    const respuesta = await request.json()

    // Intentar guardar en Supabase primero
    try {
      const supabase = createClient()

      // Eliminar tipo_cuestionario si existe en el objeto respuesta
      if (respuesta.tipo_cuestionario) {
        delete respuesta.tipo_cuestionario
      }

      const { data, error } = await supabase.from("respuestas_cronotipo").insert([respuesta]).select()

      if (error) {
        console.error("Error al guardar en Supabase:", error)
        // Si falla Supabase, guardar localmente
        const respuestaGuardada = guardarRespuestaLocal(respuesta)
        return NextResponse.json(respuestaGuardada)
      }

      return NextResponse.json(data[0])
    } catch (error) {
      console.error("Error al conectar con Supabase:", error)
      // Si hay un error de conexión, guardar localmente
      const respuestaGuardada = guardarRespuestaLocal(respuesta)
      return NextResponse.json(respuestaGuardada)
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 400 })
  }
}
