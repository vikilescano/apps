"use client"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface EstadisticasGeneralesProps {
  datos: any[]
}

export function EstadisticasGenerales({ datos }: EstadisticasGeneralesProps) {
  // Función para calcular estadísticas básicas
  const calcularEstadisticas = (valores: number[]) => {
    if (!valores.length) return { media: "-", mediana: "-", desviacion: "-", min: "-", max: "-" }

    const filtrados = valores.filter((v) => v !== null && v !== undefined)
    if (!filtrados.length) return { media: "-", mediana: "-", desviacion: "-", min: "-", max: "-" }

    // Calcular media
    const media = filtrados.reduce((sum, val) => sum + val, 0) / filtrados.length

    // Calcular mediana
    const ordenados = [...filtrados].sort((a, b) => a - b)
    const mediana =
      filtrados.length % 2 === 0
        ? (ordenados[filtrados.length / 2 - 1] + ordenados[filtrados.length / 2]) / 2
        : ordenados[Math.floor(filtrados.length / 2)]

    // Calcular desviación estándar
    const varianza = filtrados.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / filtrados.length
    const desviacion = Math.sqrt(varianza)

    // Mínimo y máximo
    const min = Math.min(...filtrados)
    const max = Math.max(...filtrados)

    return {
      media: media.toFixed(2),
      mediana: mediana.toFixed(2),
      desviacion: desviacion.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
    }
  }

  // Extraer valores para cada variable
  const msf_sc_valores = datos.map((d) => d.msf_sc).filter(Boolean)
  const sjl_valores = datos.map((d) => d.sjl).filter(Boolean)
  const sd_w_valores = datos.map((d) => d.sd_w).filter(Boolean)
  const sd_f_valores = datos.map((d) => d.sd_f).filter(Boolean)
  const edad_valores = datos.map((d) => d.edad).filter(Boolean)

  // Calcular estadísticas
  const msf_sc_stats = calcularEstadisticas(msf_sc_valores)
  const sjl_stats = calcularEstadisticas(sjl_valores)
  const sd_w_stats = calcularEstadisticas(sd_w_valores)
  const sd_f_stats = calcularEstadisticas(sd_f_valores)
  const edad_stats = calcularEstadisticas(edad_valores)

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

  const distribucionCronotipos = contarCronotipos()

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

  const distribucionGeneros = contarGeneros()

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Estadísticas Descriptivas</h3>
        <Table>
          <TableCaption>Estadísticas calculadas a partir de {datos.length} respuestas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Variable</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Mediana</TableHead>
              <TableHead>Desv. Est.</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Máximo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">MSFsc (horas)</TableCell>
              <TableCell>{msf_sc_stats.media}</TableCell>
              <TableCell>{msf_sc_stats.mediana}</TableCell>
              <TableCell>{msf_sc_stats.desviacion}</TableCell>
              <TableCell>{msf_sc_stats.min}</TableCell>
              <TableCell>{msf_sc_stats.max}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Jetlag Social (horas)</TableCell>
              <TableCell>{sjl_stats.media}</TableCell>
              <TableCell>{sjl_stats.mediana}</TableCell>
              <TableCell>{sjl_stats.desviacion}</TableCell>
              <TableCell>{sjl_stats.min}</TableCell>
              <TableCell>{sjl_stats.max}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Duración sueño días laborables (horas)</TableCell>
              <TableCell>{sd_w_stats.media}</TableCell>
              <TableCell>{sd_w_stats.mediana}</TableCell>
              <TableCell>{sd_w_stats.desviacion}</TableCell>
              <TableCell>{sd_w_stats.min}</TableCell>
              <TableCell>{sd_w_stats.max}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Duración sueño días libres (horas)</TableCell>
              <TableCell>{sd_f_stats.media}</TableCell>
              <TableCell>{sd_f_stats.mediana}</TableCell>
              <TableCell>{sd_f_stats.desviacion}</TableCell>
              <TableCell>{sd_f_stats.min}</TableCell>
              <TableCell>{sd_f_stats.max}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Edad (años)</TableCell>
              <TableCell>{edad_stats.media}</TableCell>
              <TableCell>{edad_stats.mediana}</TableCell>
              <TableCell>{edad_stats.desviacion}</TableCell>
              <TableCell>{edad_stats.min}</TableCell>
              <TableCell>{edad_stats.max}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Distribución por Cronotipo</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cronotipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Porcentaje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(distribucionCronotipos).map(([cronotipo, cantidad]) => (
                <TableRow key={cronotipo}>
                  <TableCell className="font-medium">{cronotipo}</TableCell>
                  <TableCell>{cantidad}</TableCell>
                  <TableCell>{((cantidad / datos.length) * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Distribución por Género</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Género</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Porcentaje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Femenino</TableCell>
                <TableCell>{distribucionGeneros.femenino}</TableCell>
                <TableCell>{((distribucionGeneros.femenino / datos.length) * 100).toFixed(1)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Masculino</TableCell>
                <TableCell>{distribucionGeneros.masculino}</TableCell>
                <TableCell>{((distribucionGeneros.masculino / datos.length) * 100).toFixed(1)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">No especificado</TableCell>
                <TableCell>{distribucionGeneros.noEspecificado}</TableCell>
                <TableCell>{((distribucionGeneros.noEspecificado / datos.length) * 100).toFixed(1)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
