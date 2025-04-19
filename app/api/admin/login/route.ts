import { NextResponse } from "next/server"

// Contraseña actualizada
const ADMIN_PASSWORD = "rcm140"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error en la autenticación:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
