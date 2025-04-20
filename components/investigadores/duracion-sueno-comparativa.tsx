"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface DuracionSuenoComparativaProps {
  datos: any[]
}

export function DuracionSuenoComparativa({ datos }: DuracionSuenoComparativaProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!datos.length || !svgRef.current) return

    // Limpiar el SVG
    d3.select(svgRef.current).selectAll("*").remove()

    // Preparar los datos
    const datosAgrupados = [
      {
        grupo: "Días laborables",
        valor: d3.mean(datos, (d) => d.sd_w) || 0,
      },
      {
        grupo: "Días libres",
        valor: d3.mean(datos, (d) => d.sd_f) || 0,
      },
      {
        grupo: "Promedio semanal",
        valor: d3.mean(datos, (d) => d.sd_week) || 0,
      },
    ]

    // Configurar dimensiones
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 30, right: 30, bottom: 50, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Crear escalas
    const x = d3
      .scaleBand()
      .domain(datosAgrupados.map((d) => d.grupo))
      .range([0, innerWidth])
      .padding(0.3)

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(datosAgrupados, (d) => d.valor) ? Math.ceil(d3.max(datosAgrupados, (d) => d.valor) as number) : 10,
      ])
      .nice()
      .range([innerHeight, 0])

    // Crear el SVG
    const svg = d3.select(svgRef.current).append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Añadir el eje X
    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "12px")

    // Añadir el eje Y
    svg.append("g").call(d3.axisLeft(y).ticks(10)).selectAll("text").style("font-size", "12px")

    // Añadir etiqueta al eje Y
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -innerHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Duración del sueño (horas)")

    // Colores para las barras
    const colors = ["#3b82f6", "#10b981", "#8b5cf6"]

    // Añadir las barras
    svg
      .selectAll(".bar")
      .data(datosAgrupados)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.grupo) || 0)
      .attr("y", (d) => y(d.valor))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.valor))
      .attr("fill", (d, i) => colors[i])

    // Añadir etiquetas de valores
    svg
      .selectAll(".label")
      .data(datosAgrupados)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => (x(d.grupo) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.valor) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text((d) => d.valor.toFixed(2) + "h")

    // Añadir título
    svg
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Duración Media del Sueño")
  }, [datos])

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  )
}
