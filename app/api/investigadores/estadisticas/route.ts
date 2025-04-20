import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Obtener todas las respuestas de Supabase
    const { data, error } = await supabase.from("respuestas_cronotipo").select("*")

    if (error) {
      console.error("Error al obtener las respuestas:", error)
      return NextResponse.json({ error: "Error al obtener las respuestas" }, { status: 500 })
    }

    // Calcular estadísticas
    const estadisticas = calcularEstadisticas(data)

    return NextResponse.json(estadisticas)
  } catch (error) {
    console.error("Error al calcular estadísticas:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

function calcularEstadisticas(datos: any[]) {
  // Filtrar valores válidos
  const msf_sc_valores = datos.map((d) => d.msf_sc).filter(Boolean)
  const sjl_valores = datos.map((d) => d.sjl).filter(Boolean)
  const sd_w_valores = datos.map((d) => d.sd_w).filter(Boolean)
  const sd_f_valores = datos.map((d) => d.sd_f).filter(Boolean)
  const edad_valores = datos.map((d) => d.edad).filter(Boolean)

  // Calcular estadísticas básicas
  const calcularEstadisticasBasicas = (valores: number[]) => {
    if (!valores.length) return { media: 0, mediana: 0, desviacion: 0, min: 0, max: 0 }

    // Calcular media
    const media = valores.reduce((sum, val) => sum + val, 0) / valores.length

    // Calcular mediana
    const ordenados = [...valores].sort((a, b) => a - b)
    const mediana =
      valores.length % 2 === 0
        ? (ordenados[valores.length / 2 - 1] + ordenados[valores.length / 2]) / 2
        : ordenados[Math.floor(valores.length / 2)]

    // Calcular desviación estándar
    const varianza = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / valores.length
    const desviacion = Math.sqrt(varianza)

    // Mínimo y máximo
    const min = Math.min(...valores)
    const max = Math.max(...valores)

    return { media, mediana, desviacion, min, max }
  }

  // Calcular distribución de cronotipos
  const contarCronotipos = () => {
    const conteo: Record<string, number> = {}
    datos.forEach((d) => {
      if (d.cronotipo) {
        conteo[d.cronotipo] = (conteo[d.cronotipo] || 0) + 1
      }
    })
    return conteo
  }

  // Calcular distribución por género
  const contarGeneros = () => {
    let femenino = 0
    let masculino = 0
    let noEspecificado = 0

    datos.forEach((d) => {
      if (d.genero === "femenino") femenino++
      else if (d.genero === "masculino") masculino++
      else noEspecificado++
    })

    return { femenino, masculino, noEspecificado }
  }

  // Calcular datos de referencia (valores ficticios para ejemplo)
  const datosReferencia = {
    msf_sc: {
      global: 4.5,
      europa: 4.2,
      america: 4.7,
      asia: 4.0,
    },
    sjl: {
      global: 1.2,
      europa: 1.0,
      america: 1.3,
      asia: 0.9,
    },
  }

  return {
    msf_sc: calcularEstadisticasBasicas(msf_sc_valores),
    sjl: calcularEstadisticasBasicas(sjl_valores),
    sd_w: calcularEstadisticasBasicas(sd_w_valores),
    sd_f: calcularEstadisticasBasicas(sd_f_valores),
    edad: calcularEstadisticasBasicas(edad_valores),
    distribucionCronotipos: contarCronotipos(),
    distribucionGeneros: contarGeneros(),
    datosReferencia,
  }
}
