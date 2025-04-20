"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface CronotipoDistribucionProps {
  datos: any[]
}

export function CronotipoDistribucion({ datos }: CronotipoDistribucionProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!datos.length || !svgRef.current) return

    // Limpiar el SVG
    d3.select(svgRef.current).selectAll("*").remove()

    // Preparar los datos
    const cronotipos = [
      "Extremadamente temprano",
      "Moderadamente temprano",
      "Ligeramente temprano",
      "Intermedio",
      "Ligeramente tardío",
      "Moderadamente tardío",
      "Extremadamente tardío",
    ]

    const conteo = cronotipos.map((tipo) => {
      return {
        tipo,
        count: datos.filter((d) => d.cronotipo === tipo).length,
      }
    })

    // Configurar dimensiones
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 30, right: 30, bottom: 70, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Crear escalas
    const x = d3.scaleBand().domain(cronotipos).range([0, innerWidth]).padding(0.2)

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(conteo, (d) => d.count) || 0])
      .nice()
      .range([innerHeight, 0])

    // Crear el color según el cronotipo
    const color = d3.scaleOrdinal().domain(cronotipos).range([
      "#f59e0b", // Extremadamente temprano (amber-500)
      "#fbbf24", // Moderadamente temprano (amber-400)
      "#fcd34d", // Ligeramente temprano (amber-300)
      "#10b981", // Intermedio (emerald-500)
      "#a5b4fc", // Ligeramente tardío (indigo-300)
      "#818cf8", // Moderadamente tardío (indigo-400)
      "#6366f1", // Extremadamente tardío (indigo-500)
    ])

    // Crear el SVG
    const svg = d3.select(svgRef.current).append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Añadir el eje X
    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px")

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
      .text("Número de personas")

    // Añadir las barras
    svg
      .selectAll(".bar")
      .data(conteo)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.tipo) || 0)
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.count))
      .attr("fill", (d) => color(d.tipo) as string)

    // Añadir etiquetas de valores
    svg
      .selectAll(".label")
      .data(conteo)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => (x(d.tipo) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.count) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text((d) => (d.count > 0 ? d.count : ""))

    // Añadir título
    svg
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Distribución de Cronotipos")
  }, [datos])

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  )
}
