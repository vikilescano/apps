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
    const { id, ids } = body

    // Determinar qué IDs eliminar
    const idsToDelete = ids || (id ? [id] : null)

    if (!idsToDelete || idsToDelete.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron IDs para eliminar" }, { status: 400 })
    }

    console.log("Intentando eliminar IDs:", idsToDelete)

    // Usar el cliente de Supabase con rol de servicio
    const supabase = createServerSupabaseClient()

    // Eliminar las respuestas
    const { error, count } = await supabase
      .from("respuestas_cronotipo")
      .delete({ count: "exact" })
      .in("id", idsToDelete)

    if (error) {
      console.error("Error al eliminar respuestas:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Eliminadas ${count} respuestas`)
    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error("Error en la API de eliminación:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
