// Función para convertir hora en formato "HH:MM" a horas decimales
export function horaADecimal(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number)
  return horas + minutos / 60
}

// Función para convertir horas decimales a formato "HH:MM"
export function decimalAHora(decimal: number): string {
  const horas = Math.floor(decimal)
  const minutos = Math.round((decimal - horas) * 60)
  return `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`
}

// Función para calcular el MSF (punto medio del sueño en días libres)
export function calcularMSF(
  horaAcostarseLibre: string,
  minutosParaDormirseLibre: number,
  horaDespertarLibre: string,
): number {
  const inicioSuenoLibre = horaADecimal(horaAcostarseLibre) + minutosParaDormirseLibre / 60
  const finSuenoLibre = horaADecimal(horaDespertarLibre)

  // Ajustar si el fin del sueño es al día siguiente
  const finSuenoAjustado = finSuenoLibre < inicioSuenoLibre ? finSuenoLibre + 24 : finSuenoLibre

  // Calcular el punto medio
  let puntoMedio = (inicioSuenoLibre + finSuenoAjustado) / 2

  // Si el punto medio es mayor a 24, restar 24 para obtener la hora del día
  if (puntoMedio >= 24) {
    puntoMedio -= 24
  }

  return puntoMedio
}

// Función para calcular la duración del sueño
export function calcularDuracionSueno(
  horaAcostarse: string,
  minutosParaDormirse: number,
  horaDespertar: string,
): number {
  const inicioSueno = horaADecimal(horaAcostarse) + minutosParaDormirse / 60
  const finSueno = horaADecimal(horaDespertar)

  // Ajustar si el fin del sueño es al día siguiente
  const finSuenoAjustado = finSueno < inicioSueno ? finSueno + 24 : finSueno

  return finSuenoAjustado - inicioSueno
}

// Función para calcular el MSFsc (MSF corregido por deuda de sueño)
export function calcularMSFsc(MSF: number, SDf: number, SDw: number, SOf: number): number {
  // Calcular la duración media semanal del sueño (5 días laborables, 2 días libres)
  const SDweek = (5 * SDw + 2 * SDf) / 7

  // Si no hay exceso de sueño en días libres, MSFsc = MSF
  if (SDf <= SDw) {
    return MSF
  }

  // Si hay exceso de sueño en días libres, corregir MSF
  return MSF - (SDf - SDweek) / 2
}

// Función para calcular el jetlag social (SJL)
export function calcularSJL(MSF: number, MSW: number): number {
  // Ajustar para manejar correctamente el cruce de medianoche
  let diff = Math.abs(MSF - MSW)

  // Si la diferencia es mayor a 12 horas, probablemente estamos calculando en la dirección incorrecta
  if (diff > 12) {
    diff = 24 - diff
  }

  return diff
}

// Función para determinar la categoría de cronotipo basada en MSFsc
export function determinarCronotipo(MSFsc: number): string {
  if (MSFsc < 2.17) return "Extremadamente temprano"
  if (MSFsc < 3.17) return "Moderadamente temprano"
  if (MSFsc < 4.17) return "Ligeramente temprano"
  if (MSFsc < 5.17) return "Intermedio"
  if (MSFsc < 6.17) return "Ligeramente tardío"
  if (MSFsc < 7.17) return "Moderadamente tardío"
  return "Extremadamente tardío"
}

// Función para calcular todos los resultados
export function calcularResultados(datos: any) {
  // Calcular inicio del sueño (SO)
  const SOw = horaADecimal(datos.horaAcostarseLaboral) + datos.minutosParaDormirseLaboral / 60
  const SOf = horaADecimal(datos.horaAcostarseLibre) + datos.minutosParaDormirseLibre / 60

  // Calcular duración del sueño (SD)
  const SDw = calcularDuracionSueno(
    datos.horaAcostarseLaboral,
    datos.minutosParaDormirseLaboral,
    datos.horaDespertarLaboral,
  )

  const SDf = calcularDuracionSueno(datos.horaAcostarseLibre, datos.minutosParaDormirseLibre, datos.horaDespertarLibre)

  // Calcular duración media semanal del sueño
  const SDweek = (5 * SDw + 2 * SDf) / 7

  // Calcular punto medio del sueño (MS)
  // Asegurarse de que MSW se calcule correctamente
  let MSW = SOw + SDw / 2
  if (MSW >= 24) MSW -= 24

  // Asegurarse de que MSF se calcule correctamente
  let MSF = SOf + SDf / 2
  if (MSF >= 24) MSF -= 24

  // Calcular MSFsc
  const MSFsc = calcularMSFsc(MSF, SDf, SDw, SOf)

  // Calcular jetlag social
  const SJL = calcularSJL(MSF, MSW)

  // Determinar categoría de cronotipo
  const cronotipo = determinarCronotipo(MSFsc)

  return {
    SOw,
    SOf,
    SDw,
    SDf,
    SDweek,
    MSW,
    MSF,
    MSFsc,
    SJL,
    cronotipo,
  }
}
