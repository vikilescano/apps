"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef } from "react"

interface ChartData {
  labels: string[]
  values: number[]
}

interface CronotipoChartProps {
  title: string
  data: ChartData
  type?: "bar" | "pie" | "line"
}

export function CronotipoChart({ title, data, type = "bar" }: CronotipoChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Simulación de renderizado de gráfico
    // En una implementación real, usarías Chart.js o similar
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    const maxValue = Math.max(...data.values)
    const barWidth = canvasRef.current.width / data.labels.length
    const heightRatio = canvasRef.current.height / maxValue

    // Dibujar barras
    data.labels.forEach((label, index) => {
      const value = data.values[index]
      const barHeight = value * heightRatio * 0.8 // 80% de la altura para dejar margen

      ctx.fillStyle = `hsl(${index * 30}, 70%, 60%)`
      ctx.fillRect(index * barWidth + 5, canvasRef.current!.height - barHeight, barWidth - 10, barHeight)

      // Etiquetas
      ctx.fillStyle = "#000"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(label.substring(0, 8), index * barWidth + barWidth / 2, canvasRef.current!.height - 5)

      // Valores
      ctx.fillText(value.toString(), index * barWidth + barWidth / 2, canvasRef.current!.height - barHeight - 5)
    })
  }, [data])

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <canvas ref={canvasRef} width={500} height={300} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  )
}
