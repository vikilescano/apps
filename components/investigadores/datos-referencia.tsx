"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface DatosReferenciaProps {
  datos: any[]
  estadisticas: any
}

export function DatosReferencia({ datos, estadisticas }: DatosReferenciaProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!datos.length || !estadisticas || !svgRef.current) return

    // Limpiar el SVG
    d3.select(svgRef.current).selectAll("*").remove()

    // Datos de referencia (valores ficticios para ejemplo)
    const datosReferencia = {
      msf_sc: {
        global: 4.5,
        europa: 4.2,
        america: 4.7,
        asia: 4.0,
      },
      sjl: {
        global: 1.2,
        europa: 1.0,
        america: 1.3,
        asia: 0.9,
      },
    }

    // Preparar los datos para la comparación
    const msfscActual = d3.mean(datos, (d) => d.msf_sc) || 0
    const sjlActual = d3.mean(datos, (d) => d.sjl) || 0

    const datosComparativos = [
      { grupo: "Muestra actual", msf_sc: msfscActual, sjl: sjlActual },
      { grupo: "Global", msf_sc: datosReferencia.msf_sc.global, sjl: datosReferencia.sjl.global },
      { grupo: "Europa", msf_sc: datosReferencia.msf_sc.europa, sjl: datosReferencia.sjl.europa },
      { grupo: "América", msf_sc: datosReferencia.msf_sc.america, sjl: datosReferencia.sjl.america },
      { grupo: "Asia", msf_sc: datosReferencia.msf_sc.asia, sjl: datosReferencia.sjl.asia },
    ]

    // Configurar dimensiones
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 30, right: 120, bottom: 50, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Crear escalas
    const x = d3
      .scaleBand()
      .domain(datosComparativos.map((d) => d.grupo))
      .range([0, innerWidth])
      .padding(0.3)

    const y = d3
      .scaleLinear()
      .domain([0, 6]) // Rango fijo para MSFsc
      .nice()
      .range([innerHeight, 0])

    const y2 = d3
      .scaleLinear()
      .domain([0, 2]) // Rango fijo para SJL
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
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")

    // Añadir el eje Y izquierdo (MSFsc)
    svg.append("g").call(d3.axisLeft(y).ticks(10)).selectAll("text").style("font-size", "12px")

    // Añadir etiqueta al eje Y izquierdo
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -innerHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#3b82f6")
      .text("MSFsc (horas)")

    // Añadir el eje Y derecho (SJL)
    svg
      .append("g")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(y2).ticks(10))
      .selectAll("text")
      .style("font-size", "12px")

    // Añadir etiqueta al eje Y derecho
    svg
      .append("text")
      .attr("transform", "rotate(90)")
      .attr("y", -innerWidth - margin.right + 20)
      .attr("x", innerHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#ef4444")
      .text("Jetlag Social (horas)")

    // Añadir las barras para MSFsc
    svg
      .selectAll(".bar-msf")
      .data(datosComparativos)
      .enter()
      .append("rect")
      .attr("class", "bar-msf")
      .attr("x", (d) => x(d.grupo) || 0)
      .attr("y", (d) => y(d.msf_sc))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d) => innerHeight - y(d.msf_sc))
      .attr("fill", (d, i) => (i === 0 ? "#3b82f6" : "#93c5fd")) // Azul más oscuro para la muestra actual

    // Añadir las barras para SJL
    svg
      .selectAll(".bar-sjl")
      .data(datosComparativos)
      .enter()
      .append("rect")
      .attr("class", "bar-sjl")
      .attr("x", (d) => (x(d.grupo) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y2(d.sjl))
      .attr("width", x.bandwidth() / 2)
      .attr("height", (d) => innerHeight - y2(d.sjl))
      .attr("fill", (d, i) => (i === 0 ? "#ef4444" : "#fca5a5")) // Rojo más oscuro para la muestra actual

    // Añadir leyenda
    const legend = svg.append("g").attr("transform", `translate(${innerWidth + 20}, 10)`)

    // Leyenda para MSFsc
    legend.append("rect").attr("x", 0).attr("y", 0).attr("width", 15).attr("height", 15).attr("fill", "#3b82f6")

    legend.append("text").attr("x", 20).attr("y", 12).style("font-size", "12px").text("MSFsc")

    // Leyenda para SJL
    legend.append("rect").attr("x", 0).attr("y", 25).attr("width", 15).attr("height", 15).attr("fill", "#ef4444")

    legend.append("text").attr("x", 20).attr("y", 37).style("font-size", "12px").text("Jetlag Social")

    // Añadir título
    svg
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Comparación con Datos de Referencia")
  }, [datos, estadisticas])

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  )
}
