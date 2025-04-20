"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileSpreadsheet, FileJson, BarChart3, PieChart, LineChart } from "lucide-react"

// Componentes para visualizaciones
import { CronotipoDistribucion } from "@/components/investigadores/cronotipo-distribucion"
import { JetlagSocialGrafico } from "@/components/investigadores/jetlag-social-grafico"
import { DuracionSuenoComparativa } from "@/components/investigadores/duracion-sueno-comparativa"
import { CorrelacionEdadCronotipo } from "@/components/investigadores/correlacion-edad-cronotipo"
import { EstadisticasGenerales } from "@/components/investigadores/estadisticas-generales"
import { DatosReferencia } from "@/components/investigadores/datos-referencia"

export default function InvestigadoresPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [respuestas, setRespuestas] = useState<any[]>([])
  const [estadisticas, setEstadisticas] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [filtroEdad, setFiltroEdad] = useState<[number, number]>([0, 100])
  const [filtroGenero, setFiltroGenero] = useState<string | null>(null)
  const [filtroCronotipo, setFiltroCronotipo] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/investigadores/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        fetchData()
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

  const fetchData = async () => {
    setLoading(true)
    try {
      // Obtener todas las respuestas
      const respuestasResponse = await fetch("/api/investigadores/respuestas")
      if (!respuestasResponse.ok) {
        throw new Error("No se pudieron cargar las respuestas")
      }
      const respuestasData = await respuestasResponse.json()
      setRespuestas(respuestasData)

      // Obtener estadísticas calculadas
      const estadisticasResponse = await fetch("/api/investigadores/estadisticas")
      if (!estadisticasResponse.ok) {
        throw new Error("No se pudieron cargar las estadísticas")
      }
      const estadisticasData = await estadisticasResponse.json()
      setEstadisticas(estadisticasData)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = (datos: any[]) => {
    return datos.filter((item) => {
      // Filtro por edad
      if (item.edad && (item.edad < filtroEdad[0] || item.edad > filtroEdad[1])) {
        return false
      }

      // Filtro por género
      if (filtroGenero && item.genero !== filtroGenero) {
        return false
      }

      // Filtro por cronotipo
      if (filtroCronotipo && item.cronotipo !== filtroCronotipo) {
        return false
      }

      return true
    })
  }

  const datosFiltrados = aplicarFiltros(respuestas)

  const downloadData = (format: "csv" | "json") => {
    if (datosFiltrados.length === 0) return

    if (format === "csv") {
      // Definir todas las columnas para el CSV
      const columns = [
        "id",
        "created_at",
        "edad",
        "genero",
        "provincia",
        "pais",
        "hora_despertar_lab",
        "min_despertar_lab",
        "despertar_antes_alarma_lab",
        "hora_despierto_lab",
        "hora_energia_baja_lab",
        "hora_acostar_lab",
        "min_dormirse_lab",
        "siesta_lab",
        "duracion_siesta_lab",
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
        "actividades_antes_dormir",
        "min_lectura_antes_dormir",
        "min_maximo_lectura",
        "prefiere_oscuridad_total",
        "despierta_mejor_con_luz",
        "horas_aire_libre_lab",
        "min_aire_libre_lab",
        "horas_aire_libre_lib",
        "min_aire_libre_lib",
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
      datosFiltrados.forEach((respuesta) => {
        const row = columns.map((column) => {
          const value = respuesta[column]
          if (value === null || value === undefined) return ""
          if (typeof value === "boolean") return value ? "true" : "false"
          if (Array.isArray(value)) return `"${value.join(", ")}"`
          if (typeof value === "string" && value.includes(",")) return `"${value}"`
          return value
        })
        csv += row.join(",") + "\n"
      })

      // Descargar CSV
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `cronotipo-investigacion-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Descargar JSON
      const jsonData = JSON.stringify(datosFiltrados, null, 2)
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `cronotipo-investigacion-${new Date().toISOString().split("T")[0]}.json`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Portal para Investigadores</CardTitle>
            <CardDescription>
              Acceso a datos avanzados del Cuestionario de Cronotipo de Munich para investigación
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Contraseña de investigador</Label>
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
                Acceder
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Portal de Investigación - Cronotipo de Munich</h1>
          <p className="text-muted-foreground mt-2">
            Análisis avanzado de datos del Cuestionario de Cronotipo de Munich (MCTQ)
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando datos...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Panel de filtros */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Filtros de datos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="edad-min">Rango de edad</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="edad-min"
                        type="number"
                        min="0"
                        max="100"
                        value={filtroEdad[0]}
                        onChange={(e) => setFiltroEdad([Number.parseInt(e.target.value), filtroEdad[1]])}
                        className="w-20"
                      />
                      <span>a</span>
                      <Input
                        id="edad-max"
                        type="number"
                        min="0"
                        max="100"
                        value={filtroEdad[1]}
                        onChange={(e) => setFiltroEdad([filtroEdad[0], Number.parseInt(e.target.value)])}
                        className="w-20"
                      />
                      <span>años</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="genero">Género</Label>
                    <select
                      id="genero"
                      value={filtroGenero || ""}
                      onChange={(e) => setFiltroGenero(e.target.value || null)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                    >
                      <option value="">Todos</option>
                      <option value="femenino">Femenino</option>
                      <option value="masculino">Masculino</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="cronotipo">Cronotipo</Label>
                    <select
                      id="cronotipo"
                      value={filtroCronotipo || ""}
                      onChange={(e) => setFiltroCronotipo(e.target.value || null)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                    >
                      <option value="">Todos</option>
                      <option value="Extremadamente temprano">Extremadamente temprano</option>
                      <option value="Moderadamente temprano">Moderadamente temprano</option>
                      <option value="Ligeramente temprano">Ligeramente temprano</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Ligeramente tardío">Ligeramente tardío</option>
                      <option value="Moderadamente tardío">Moderadamente tardío</option>
                      <option value="Extremadamente tardío">Extremadamente tardío</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Mostrando {datosFiltrados.length} de {respuestas.length} respuestas
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFiltroEdad([0, 100])
                        setFiltroGenero(null)
                        setFiltroCronotipo(null)
                      }}
                    >
                      Limpiar filtros
                    </Button>
                    <Button onClick={() => fetchData()}>Actualizar datos</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opciones de descarga */}
            <div className="flex justify-end gap-2 mb-6">
              <Button variant="outline" onClick={() => downloadData("csv")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
              <Button variant="outline" onClick={() => downloadData("json")}>
                <FileJson className="mr-2 h-4 w-4" />
                Exportar JSON
              </Button>
            </div>

            {/* Pestañas de análisis */}
            <Tabs defaultValue="distribucion" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                <TabsTrigger value="distribucion">
                  <PieChart className="h-4 w-4 mr-2" />
                  Distribución
                </TabsTrigger>
                <TabsTrigger value="comparativas">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Comparativas
                </TabsTrigger>
                <TabsTrigger value="correlaciones">
                  <LineChart className="h-4 w-4 mr-2" />
                  Correlaciones
                </TabsTrigger>
                <TabsTrigger value="estadisticas">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Estadísticas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="distribucion" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Cronotipos</CardTitle>
                    <CardDescription>Análisis de la distribución de cronotipos en la muestra</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <CronotipoDistribucion datos={datosFiltrados} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Jetlag Social</CardTitle>
                    <CardDescription>Análisis de la distribución del jetlag social en la muestra</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <JetlagSocialGrafico datos={datosFiltrados} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comparativas" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Comparativa de Duración del Sueño</CardTitle>
                    <CardDescription>Comparación entre días laborables y días libres</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <DuracionSuenoComparativa datos={datosFiltrados} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Comparativa con Datos de Referencia</CardTitle>
                    <CardDescription>
                      Comparación de la muestra actual con datos de referencia internacionales
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <DatosReferencia datos={datosFiltrados} estadisticas={estadisticas} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="correlaciones" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Correlación Edad-Cronotipo</CardTitle>
                    <CardDescription>Análisis de la relación entre edad y cronotipo (MSFsc)</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <CorrelacionEdadCronotipo datos={datosFiltrados} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="estadisticas" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas Generales</CardTitle>
                    <CardDescription>Resumen estadístico de las principales variables</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EstadisticasGenerales datos={datosFiltrados} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
