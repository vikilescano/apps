"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface JetlagSocialGraficoProps {
  datos: any[]
}

export function JetlagSocialGrafico({ datos }: JetlagSocialGraficoProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!datos.length || !svgRef.current) return

    // Limpiar el SVG
    d3.select(svgRef.current).selectAll("*").remove()

    // Preparar los datos
    const jetlagValues = datos.map((d) => d.sjl).filter(Boolean)

    // Configurar dimensiones
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 30, right: 30, bottom: 50, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Crear histograma
    const histogram = d3
      .histogram()
      .domain([0, d3.max(jetlagValues) || 5])
      .thresholds(20)(jetlagValues)

    // Crear escalas
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(jetlagValues) || 5])
      .range([0, innerWidth])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(histogram, (d) => d.length) || 0])
      .nice()
      .range([innerHeight, 0])

    // Crear el SVG
    const svg = d3.select(svgRef.current).append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Añadir el eje X
    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(10))
      .selectAll("text")
      .style("font-size", "12px")

    // Añadir etiqueta al eje X
    svg
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Jetlag Social (horas)")

    // Añadir el eje Y
    svg.append("g").call(d3.axisLeft(y)).selectAll("text").style("font-size", "12px")

    // Añadir etiqueta al eje Y
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -innerHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Frecuencia")

    // Añadir las barras
    svg
      .selectAll("rect")
      .data(histogram)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.x0 || 0))
      .attr("y", (d) => y(d.length))
      .attr("width", (d) => Math.max(0, x(d.x1 || 0) - x(d.x0 || 0) - 1))
      .attr("height", (d) => innerHeight - y(d.length))
      .attr("fill", "#6366f1") // indigo-500

    // Añadir línea de media
    const mean = d3.mean(jetlagValues) || 0
    svg
      .append("line")
      .attr("x1", x(mean))
      .attr("x2", x(mean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")

    // Añadir etiqueta de media
    svg
      .append("text")
      .attr("x", x(mean))
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "red")
      .text(`Media: ${mean.toFixed(2)}h`)

    // Añadir título
    svg
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Distribución de Jetlag Social")
  }, [datos])

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  )
}
