"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface CorrelacionEdadCronotipoProps {
  datos: any[]
}

export function CorrelacionEdadCronotipo({ datos }: CorrelacionEdadCronotipoProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!datos.length || !svgRef.current) return

    // Filtrar datos que tienen edad y msf_sc
    const datosFiltrados = datos.filter((d) => d.edad && d.msf_sc)

    if (datosFiltrados.length === 0) return

    // Limpiar el SVG
    d3.select(svgRef.current).selectAll("*").remove()

    // Preparar los datos para el gráfico de dispersión
    const puntosDispersion = datosFiltrados.map((d) => ({
      edad: d.edad,
      msf_sc: d.msf_sc,
    }))

    // Configurar dimensiones
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 30, right: 30, bottom: 50, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Crear escalas
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(puntosDispersion, (d) => d.edad) || 100])
      .nice()
      .range([0, innerWidth])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(puntosDispersion, (d) => d.msf_sc) || 10])
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
      .text("Edad (años)")

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
      .text("MSFsc (horas)")

    // Calcular la línea de regresión
    const xValues = puntosDispersion.map((d) => d.edad)
    const yValues = puntosDispersion.map((d) => d.msf_sc)

    // Calcular coeficientes de regresión lineal
    const n = xValues.length
    const sumX = d3.sum(xValues)
    const sumY = d3.sum(yValues)
    const sumXY = d3.sum(xValues.map((x, i) => x * yValues[i]))
    const sumXX = d3.sum(xValues.map((x) => x * x))

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Crear la línea de regresión
    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => x(d.x))
      .y((d) => y(d.y))

    const xRange = [0, d3.max(xValues) || 100]
    const lineData = xRange.map((x) => ({
      x: x,
      y: intercept + slope * x,
    }))

    // Añadir la línea de regresión
    svg
      .append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("d", line)

    // Calcular el coeficiente de correlación
    const meanX = sumX / n
    const meanY = sumY / n
    const ssxx = sumXX - n * meanX * meanX
    const ssyy = d3.sum(yValues.map((y) => y * y)) - n * meanY * meanY
    const ssxy = sumXY - n * meanX * meanY
    const correlation = ssxy / Math.sqrt(ssxx * ssyy)

    // Añadir puntos de dispersión
    svg
      .selectAll(".dot")
      .data(puntosDispersion)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.edad))
      .attr("cy", (d) => y(d.msf_sc))
      .attr("r", 5)
      .attr("fill", "#6366f1")
      .attr("opacity", 0.7)

    // Añadir información de correlación
    svg
      .append("text")
      .attr("x", innerWidth - 150)
      .attr("y", 30)
      .style("font-size", "12px")
      .text(`Correlación: ${correlation.toFixed(3)}`)

    svg
      .append("text")
      .attr("x", innerWidth - 150)
      .attr("y", 50)
      .style("font-size", "12px")
      .text(`Pendiente: ${slope.toFixed(3)}`)

    // Añadir título
    svg
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Correlación entre Edad y Cronotipo")
  }, [datos])

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  )
}
