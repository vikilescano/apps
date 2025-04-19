"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [respuestas, setRespuestas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        fetchRespuestas()
      } else {
        toast({
          title: "Error de autenticación",
          description: "La contraseña es incorrecta",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al intentar iniciar sesión",
        variant: "destructive",
      })
    }
  }

  const fetchRespuestas = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/respuestas")

      if (!response.ok) {
        throw new Error("No se pudieron cargar las respuestas")
      }

      const data = await response.json()
      setRespuestas(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al cargar las respuestas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (respuestas.length === 0) return

    // Definir todas las columnas que queremos incluir en el CSV
    const columns = [
      // Identificación y timestamp
      "id",
      "created_at",

      // Datos demográficos
      "edad",
      "genero",
      "ciudad",
      "pais",

      // Días laborables
      "hora_despertar_lab",
      "min_despertar_lab",
      "despertar_antes_alarma_lab",
      "hora_despierto_lab",
      "hora_energia_baja_lab",
      "hora_acostar_lab",
      "min_dormirse_lab",
      "siesta_lab",
      "duracion_siesta_lab",

      // Días libres
      "hora_sueno_despertar_lib",
      "hora_despertar_lib",
      "intenta_dormir_mas_lib",
      "min_extra_sueno_lib",
      "min_despertar_lib",
      "hora_despierto_lib",
      "hora_energia_baja_lib",
      "hora_acostar_lib",
      "min_dormirse_lib",
      "siesta_lib",
      "duracion_siesta_lib",

      // Hábitos antes de dormir y preferencias
      "actividades_antes_dormir",
      "min_lectura_antes_dormir",
      "min_maximo_lectura",
      "prefiere_oscuridad_total",
      "despierta_mejor_con_luz",

      // Tiempo al aire libre
      "horas_aire_libre_lab",
      "min_aire_libre_lab",
      "horas_aire_libre_lib",
      "min_aire_libre_lib",

      // Resultados calculados
      "msf",
      "msf_sc",
      "sd_w",
      "sd_f",
      "sd_week",
      "so_f",
      "sjl",
      "cronotipo",
    ]

    // Crear la fila de encabezados
    let csv = columns.join(",") + "\n"

    // Añadir cada fila de datos
    respuestas.forEach((respuesta) => {
      const row = columns.map((column) => {
        const value = respuesta[column]

        // Manejar valores especiales
        if (value === null || value === undefined) return ""
        if (typeof value === "boolean") return value ? "true" : "false"
        if (Array.isArray(value)) return `"${value.join(", ")}"`
        if (typeof value === "string" && value.includes(",")) return `"${value}"`

        return value
      })

      csv += row.join(",") + "\n"
    })

    // Crear un blob y descargar
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `cuestionario-cronotipo-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isAuthenticated) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Administración</CardTitle>
            <CardDescription>Ingresá la contraseña para acceder al panel de administración</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Iniciar sesión
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground mt-2">Gestión de respuestas del Cuestionario de Cronotipo de Munich</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Respuestas ({respuestas.length})</h2>
          <Button onClick={downloadCSV} disabled={respuestas.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Descargar CSV
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>Lista de respuestas al cuestionario</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Género</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Cronotipo</TableHead>
                    <TableHead>MSFsc</TableHead>
                    <TableHead>Jetlag Social</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Cargando respuestas...
                      </TableCell>
                    </TableRow>
                  ) : respuestas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No hay respuestas disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    respuestas.map((respuesta) => (
                      <TableRow key={respuesta.id}>
                        <TableCell className="font-medium">{respuesta.id.substring(0, 8)}...</TableCell>
                        <TableCell>{new Date(respuesta.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{respuesta.edad || "-"}</TableCell>
                        <TableCell>{respuesta.genero || "-"}</TableCell>
                        <TableCell>{respuesta.ciudad || "-"}</TableCell>
                        <TableCell>{respuesta.pais || "-"}</TableCell>
                        <TableCell>{respuesta.cronotipo}</TableCell>
                        <TableCell>
                          {Math.floor(respuesta.msf_sc)}:
                          {Math.round((respuesta.msf_sc % 1) * 60)
                            .toString()
                            .padStart(2, "0")}
                        </TableCell>
                        <TableCell>
                          {Math.floor(respuesta.sjl)}h {Math.round((respuesta.sjl % 1) * 60)}min
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
