import { NextResponse } from "next/server"

// Contraseña para investigadores
const INVESTIGADOR_PASSWORD = "mctq2023"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password === INVESTIGADOR_PASSWORD) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error en la autenticación:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
