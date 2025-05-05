import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { RespuestaCronotipo } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatearHora(hora: string): string {
  if (!hora) return "No disponible"

  // Si ya tiene formato HH:MM, devolverlo tal cual
  if (hora.includes(":")) return hora

  // Convertir minutos desde medianoche a formato HH:MM
  const minutos = Number.parseInt(hora)
  if (isNaN(minutos)) return "No disponible"

  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  return `${horas.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

export function calcularEdadGrupo(edad: number): string {
  if (edad < 18) return "Menor de 18"
  if (edad < 25) return "18-24"
  if (edad < 35) return "25-34"
  if (edad < 45) return "35-44"
  if (edad < 55) return "45-54"
  if (edad < 65) return "55-64"
  return "65+"
}

export function describirCronotipo(cronotipo: string): string {
  const descripciones: Record<string, string> = {
    matutino_extremo: "Extremadamente madrugador",
    matutino_moderado: "Moderadamente madrugador",
    intermedio: "Intermedio",
    vespertino_moderado: "Moderadamente nocturno",
    vespertino_extremo: "Extremadamente nocturno",
  }

  return descripciones[cronotipo] || cronotipo
}

export function calcularEstadisticas(respuestas: RespuestaCronotipo[]): any {
  // Inicializar contadores
  const porGenero: Record<string, number> = {}
  const porEdad: Record<string, number> = {}
  const porPais: Record<string, number> = {}
  const distribucionCronotipos: Record<string, number> = {}

  let sumaMSF = 0
  let sumaSJL = 0
  let contadorMSF = 0
  let contadorSJL = 0

  // Procesar cada respuesta
  respuestas.forEach((r) => {
    // Contar por género
    porGenero[r.genero] = (porGenero[r.genero] || 0) + 1

    // Contar por grupo de edad
    const grupoEdad = calcularEdadGrupo(r.edad)
    porEdad[grupoEdad] = (porEdad[grupoEdad] || 0) + 1

    // Contar por país
    porPais[r.pais] = (porPais[r.pais] || 0) + 1

    // Contar por cronotipo
    distribucionCronotipos[r.cronotipo] = (distribucionCronotipos[r.cronotipo] || 0) + 1

    // Sumar MSF y SJL para promedios
    if (r.msf !== undefined && !isNaN(r.msf)) {
      sumaMSF += r.msf
      contadorMSF++
    }

    if (r.sjl !== undefined && !isNaN(r.sjl)) {
      sumaSJL += r.sjl
      contadorSJL++
    }
  })

  // Calcular promedios
  const promedioMSF = contadorMSF > 0 ? sumaMSF / contadorMSF : 0
  const promedioSJL = contadorSJL > 0 ? sumaSJL / contadorSJL : 0

  return {
    total: respuestas.length,
    porGenero,
    porEdad,
    porPais,
    distribucionCronotipos,
    promedioMSF,
    promedioSJL,
  }
}
