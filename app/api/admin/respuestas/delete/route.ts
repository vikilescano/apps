import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const isAuthenticated = cookies().get("admin_authenticated")?.value === "true"
    if (!isAuthenticated) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("respuestas_cronotipo").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar respuesta:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la API de eliminación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
