export interface RespuestaCronotipo {
  id: string
  created_at: string
  edad: number
  genero: string
  pais: string
  provincia?: string
  cronotipo: string

  // Tiempos de sueño
  hora_acostar_lab: string
  hora_despertar_lab: string
  min_dormirse_lab: number
  min_despertar_lab: number

  hora_acostar_lib: string
  hora_despertar_lib: string
  min_dormirse_lib: number
  min_despertar_lib: number

  // Métricas calculadas
  msf: number
  msf_sc?: number
  sd_w?: number
  sd_f?: number
  sd_week?: number
  so_f?: number
  sjl?: number

  // Hábitos
  siesta_lab: boolean
  siesta_lib: boolean
  duracion_siesta_lab?: number
  duracion_siesta_lib?: number

  // Exposición a luz
  horas_aire_libre_lab: number
  min_aire_libre_lab: number
  horas_aire_libre_lib: number
  min_aire_libre_lib: number

  // Preferencias
  prefiere_oscuridad_total: boolean
  despierta_mejor_con_luz: boolean

  // Otros datos
  despertar_antes_alarma_lab: boolean
  intenta_dormir_mas_lib: boolean
  min_extra_sueno_lib?: number

  // Actividades
  min_lectura_antes_dormir?: number
  min_maximo_lectura?: number
  actividades_antes_dormir?: string[]

  // Energía
  hora_despierto_lab: string
  hora_energia_baja_lab: string
  hora_energia_baja_lib: string
  hora_sueno_despertar_lib: string
}

export type CronotipoStats = {
  total: number
  porGenero: Record<string, number>
  porEdad: Record<string, number>
  porPais: Record<string, number>
  distribucionCronotipos: Record<string, number>
  promedioMSF: number
  promedioSJL: number
}
