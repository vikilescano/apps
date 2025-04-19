export interface CuestionarioRespuesta {
  id: string
  created_at: string

  // Datos demográficos
  edad: number | null
  genero: string | null
  provincia: string | null // Cambiado de ciudad a provincia
  pais: string | null

  // Días laborables
  hora_despertar_lab: string
  min_despertar_lab: number
  despertar_antes_alarma_lab: boolean
  hora_despierto_lab: string
  hora_energia_baja_lab: string
  hora_acostar_lab: string
  min_dormirse_lab: number
  siesta_lab: boolean
  duracion_siesta_lab: number | null

  // Días libres
  hora_sueno_despertar_lib: string
  hora_despertar_lib: string
  intenta_dormir_mas_lib: boolean
  min_extra_sueno_lib: number | null
  min_despertar_lib: number
  hora_despierto_lib: string
  hora_energia_baja_lib: string
  hora_acostar_lib: string
  min_dormirse_lib: number
  siesta_lib: boolean
  duracion_siesta_lib: number | null

  // Hábitos antes de dormir y preferencias
  actividades_antes_dormir: string[]
  min_lectura_antes_dormir: number
  min_maximo_lectura: number
  prefiere_oscuridad_total: boolean
  despierta_mejor_con_luz: boolean

  // Tiempo al aire libre
  horas_aire_libre_lab: number
  min_aire_libre_lab: number
  horas_aire_libre_lib: number
  min_aire_libre_lib: number

  // Resultados calculados
  msf: number // Punto medio del sueño en días libres (en horas decimales)
  msf_sc: number // MSF corregido por deuda de sueño
  sd_w: number // Duración del sueño en días laborables (en horas decimales)
  sd_f: number // Duración del sueño en días libres (en horas decimales)
  sd_week: number // Duración media semanal del sueño (en horas decimales)
  so_f: number // Inicio del sueño en días libres (en horas decimales)
  sjl: number // Jetlag social (en horas decimales)
  cronotipo: string // Categoría de cronotipo

  // Correo electrónico para enviar resultados
  email: string | null
}
