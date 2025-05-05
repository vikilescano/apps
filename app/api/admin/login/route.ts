import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Contraseña de administrador (en producción, usar variables de entorno)
const ADMIN_PASSWORD = "admin123" // Cambiar por una contraseña segura

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password, action } = body

    // Verificar si ya está autenticado
    if (action === "check") {
      const isAuthenticated = cookies().get("admin_authenticated")?.value === "true"
      if (isAuthenticated) {
        return NextResponse.json({ authenticated: true })
      }
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Cerrar sesión
    if (action === "logout") {
      cookies().set("admin_authenticated", "", { maxAge: 0 })
      return NextResponse.json({ success: true })
    }

    // Iniciar sesión
    if (action === "login") {
      if (password === ADMIN_PASSWORD) {
        // Establecer cookie de autenticación (24 horas)
        cookies().set("admin_authenticated", "true", { maxAge: 60 * 60 * 24 })
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
  } catch (error) {
    console.error("Error en la API de login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
