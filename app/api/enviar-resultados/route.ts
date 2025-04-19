import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { decimalAHora } from "@/lib/cronotipo-utils"

// Configurar el transporte de correo electrónico
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function POST(request: Request) {
  try {
    const { email, id, cronotipo, msf_sc, sjl } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email no proporcionado" }, { status: 400 })
    }

    // Convertir valores decimales a formato de hora
    const MSFsc_hora = decimalAHora(msf_sc)
    const SJL_hora = `${Math.floor(sjl)}h ${Math.round((sjl % 1) * 60)}min`

    // Crear el contenido del correo electrónico
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h1 style="color: #4f46e5; text-align: center;">Resultados de tu Cronotipo</h1>
        
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="color: #4f46e5; margin-top: 0;">Tu Cronotipo: ${cronotipo}</h2>
          <p>Punto medio del sueño corregido (MSFsc): ${MSFsc_hora}</p>
          <p>Jetlag Social: ${SJL_hora}</p>
        </div>
        
        <p>El cronotipo es tu preferencia natural para dormir y estar activo en determinados momentos del día.</p>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #4f46e5;">¿Qué significa esto?</h3>
          <p>
            ${
              cronotipo.includes("temprano")
                ? "Tendés a sentirte más alerta y productivo/a durante las primeras horas del día. Te resulta más fácil despertarte temprano y es probable que te sientas cansado/a más temprano por la noche."
                : cronotipo.includes("tardío")
                  ? "Tendés a sentirte más alerta y productivo/a durante la tarde y noche. Te puede resultar difícil despertarte temprano y es probable que te sientas más energético/a por la noche."
                  : "Tu ritmo biológico se encuentra en un punto intermedio. No sos extremadamente madrugador/a ni noctámbulo/a, lo que te da cierta flexibilidad en tus horarios."
            }
          </p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #4f46e5;">Recomendaciones</h3>
          <ul>
            <li>Intentá mantener horarios de sueño regulares, incluso en días libres.</li>
            <li>Exponete a la luz natural por la mañana para ayudar a regular tu reloj biológico.</li>
            <li>Evitá la luz brillante (especialmente la luz azul de pantallas) antes de acostarte.</li>
            <li>Adaptá tus actividades importantes a tu cronotipo cuando sea posible.</li>
          </ul>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/resultados/${id}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Ver resultados completos
          </a>
        </p>
        
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
          Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.
        </p>
      </div>
    `

    // Enviar el correo electrónico
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Cuestionario de Cronotipo" <noreply@cronotipo.com>',
      to: email,
      subject: "Tus resultados del Cuestionario de Cronotipo",
      html: htmlContent,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error)
    return NextResponse.json({ error: "Error al enviar el correo electrónico" }, { status: 500 })
  }
}
