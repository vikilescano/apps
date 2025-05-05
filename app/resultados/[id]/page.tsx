"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { decimalAHora } from "@/lib/calculos"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Clock, Sun, Moon, Calendar, ArrowRight } from "lucide-react"

export default function ResultadosPage() {
  const { id } = useParams()
  const router = useRouter()
  const [resultados, setResultados] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResultados() {
      try {
        console.log("Buscando resultados para ID:", id)

        // Primero verificar si hay resultados guardados localmente
        const localResultados = localStorage.getItem("cronotipo_resultados")
        if (localResultados) {
          const parsedLocalResultados = JSON.parse(localResultados)

          // Si el ID coincide con el de los resultados locales, usar esos datos
          if (parsedLocalResultados.id === id) {
            console.log("Usando resultados guardados localmente")
            setResultados(parsedLocalResultados)
            setLoading(false)
            return
          }
        }

        // Verificar si hay resultados en el almacenamiento de sesión
        const sessionResultados = sessionStorage.getItem(`cronotipo_resultados_${id}`)
        if (sessionResultados) {
          console.log("Usando resultados de la sesión")
          setResultados(JSON.parse(sessionResultados))
          setLoading(false)
          return
        }

        // Si no hay resultados locales o el ID no coincide, mostrar error
        setError("No se encontraron resultados para este ID. Por favor, completa el cuestionario nuevamente.")
        setLoading(false)
      } catch (error) {
        console.error("Error:", error)
        setError("Hubo un problema al cargar los resultados. Por favor, intentalo de nuevo.")
        setLoading(false)
      }
    }

    fetchResultados()
  }, [id])

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cargando resultados...</h2>
          <Progress value={75} className="w-[300px]" />
        </div>
      </div>
    )
  }

  if (error || !resultados) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>No se pudieron cargar los resultados</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error || "Ocurrió un error desconocido"}</p>
          </CardContent>
          <CardFooter>
            <Link href="/" className="w-full">
              <Button className="w-full">Volver al inicio</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Convertir valores decimales a formato de hora
  const MSF_hora = decimalAHora(resultados.MSF || resultados.msf || 0)
  const MSFsc_hora = decimalAHora(resultados.MSFsc || resultados.msf_sc || 0)
  const SDw_hora = `${Math.floor(resultados.SDw || resultados.sd_w || 0)}h ${Math.round(((resultados.SDw || resultados.sd_w || 0) % 1) * 60)}min`
  const SDf_hora = `${Math.floor(resultados.SDf || resultados.sd_f || 0)}h ${Math.round(((resultados.SDf || resultados.sd_f || 0) % 1) * 60)}min`
  const SDweek_hora = `${Math.floor(resultados.SDweek || resultados.sd_week || 0)}h ${Math.round(((resultados.SDweek || resultados.sd_week || 0) % 1) * 60)}min`
  const SJL_hora = `${Math.floor(resultados.SJL || resultados.sjl || 0)}h ${Math.round(((resultados.SJL || resultados.sjl || 0) % 1) * 60)}min`

  // Determinar el color y el icono según el cronotipo
  const getCronotipoColor = () => {
    const cronotipo = resultados.cronotipo || ""
    if (cronotipo.includes("temprano")) return "text-amber-500"
    if (cronotipo.includes("tardío")) return "text-indigo-600"
    return "text-emerald-500" // Para cronotipo intermedio
  }

  const getCronotipoIcon = () => {
    const cronotipo = resultados.cronotipo || ""
    if (cronotipo.includes("temprano")) return <Sun className="h-12 w-12 text-amber-500" />
    if (cronotipo.includes("tardío")) return <Moon className="h-12 w-12 text-indigo-600" />
    return <Clock className="h-12 w-12 text-emerald-500" /> // Para cronotipo intermedio
  }

  // Calcular la posición en la barra de cronotipo (de 0 a 100)
  const getCronotipoPosition = () => {
    // MSFsc va de aproximadamente 2 a 7 horas
    // Convertimos a una escala de 0 a 100
    const min = 2
    const max = 7
    const msf_sc = resultados.MSFsc || resultados.msf_sc || 4.5
    const position = ((msf_sc - min) / (max - min)) * 100
    return Math.max(0, Math.min(100, position)) // Aseguramos que esté entre 0 y 100
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Resultados de tu Cronotipo</h1>
          <p className="text-muted-foreground mt-2">Basado en el Cuestionario de Cronotipo de Munich (MCTQ)</p>
        </div>

        <Tabs defaultValue="resumen" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="detalles">Detalles</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen">
            <Card className="mb-6 overflow-hidden">
              <div
                className={`p-6 flex justify-center items-center ${
                  (resultados.cronotipo || "").includes("temprano")
                    ? "bg-amber-100"
                    : (resultados.cronotipo || "").includes("tardío")
                      ? "bg-indigo-100"
                      : "bg-emerald-100"
                }`}
              >
                <div className="text-center">
                  {getCronotipoIcon()}
                  <h2 className={`text-4xl font-bold mt-2 ${getCronotipoColor()}`}>{resultados.cronotipo}</h2>
                </div>
              </div>
              <CardHeader>
                <CardTitle>Tu Cronotipo</CardTitle>
                <CardDescription>
                  El cronotipo es tu preferencia natural para dormir y estar activo en determinados momentos del día.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-2">
                  <p className="text-muted-foreground">
                    Punto medio del sueño corregido (MSFsc): <span className="font-semibold">{MSFsc_hora}</span>
                  </p>
                </div>

                {/* Barra de cronotipo */}
                <div className="mt-6 mb-8">
                  <h3 className="text-lg font-medium mb-3">Tu posición en el espectro de cronotipos:</h3>
                  <div className="relative pt-10 pb-4">
                    {/* Etiquetas */}
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-amber-600 font-medium">Alondra (Madrugador)</span>
                      <span className="text-indigo-600 font-medium">Búho (Noctámbulo)</span>
                    </div>

                    {/* Barra de gradiente */}
                    <div className="h-4 w-full bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-600 rounded-full"></div>

                    {/* Marcador de posición */}
                    <div
                      className="absolute bottom-0 transform -translate-x-1/2"
                      style={{ left: `${getCronotipoPosition()}%`, bottom: "-20px" }}
                    >
                      <div className="w-4 h-8 bg-white border-2 border-gray-800 rounded-full"></div>
                      <div className="mt-2 text-center font-medium">Vos</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Duración del sueño
                    </h3>
                    <ul className="mt-2 space-y-1">
                      <li>
                        Días laborables: <span className="font-semibold">{SDw_hora}</span>
                      </li>
                      <li>
                        Días libres: <span className="font-semibold">{SDf_hora}</span>
                      </li>
                      <li>
                        Promedio semanal: <span className="font-semibold">{SDweek_hora}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-medium flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" /> Jetlag Social
                    </h3>
                    <p className="mt-2 font-semibold">{SJL_hora}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      El jetlag social es la discrepancia entre tu reloj biológico y tu horario social.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>¿Qué significa esto?</CardTitle>
                <CardDescription>Interpretación de tus resultados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className={`font-medium ${getCronotipoColor()}`}>Sobre tu cronotipo: {resultados.cronotipo}</h3>
                  <p className="mt-2">
                    {(resultados.cronotipo || "").includes("temprano")
                      ? "Tendés a sentirte más alerta y productivo/a durante las primeras horas del día. Te resulta más fácil despertarte temprano y es probable que te sientas cansado/a más temprano por la noche."
                      : (resultados.cronotipo || "").includes("tardío")
                        ? "Tendés a sentirte más alerta y productivo/a durante la tarde y noche. Te puede resultar difícil despertarte temprano y es probable que te sientas más energético/a por la noche."
                        : "Tu ritmo biológico se encuentra en un punto intermedio. No sos extremadamente madrugador/a ni noctámbulo/a, lo que te da cierta flexibilidad en tus horarios."}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Sobre tu jetlag social: {SJL_hora}</h3>
                  <p className="mt-2">
                    {(resultados.SJL || resultados.sjl || 0) < 1
                      ? "Tu jetlag social es mínimo, lo que indica que tus horarios sociales están bien alineados con tu reloj biológico interno."
                      : (resultados.SJL || resultados.sjl || 0) < 2
                        ? "Tenés un jetlag social moderado. Esto puede causar cierta fatiga, especialmente al inicio de la semana laboral."
                        : "Tu jetlag social es significativo. Esto puede estar afectando tu bienestar, causando fatiga crónica y otros problemas de salud."}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg mt-4">
                  <h3 className="font-medium">Recomendaciones</h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span> Intentá mantener horarios de sueño regulares, incluso en
                      días libres.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span> Exponete a la luz natural por la mañana para ayudar a
                      regular tu reloj biológico.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span> Evitá la luz brillante (especialmente la luz azul de
                      pantallas) antes de acostarte.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>{" "}
                      {(resultados.cronotipo || "").includes("temprano")
                        ? "Programá tus actividades más importantes y que requieran mayor concentración durante la mañana, cuando tu nivel de alerta es mayor."
                        : (resultados.cronotipo || "").includes("tardío")
                          ? "Programá tus actividades más importantes y que requieran mayor concentración durante la tarde o noche, cuando tu nivel de alerta es mayor."
                          : "Distribuí tus actividades importantes a lo largo del día, aprovechando tu flexibilidad de horarios."}
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detalles">
            <Card>
              <CardHeader>
                <CardTitle>Detalles Técnicos</CardTitle>
                <CardDescription>Valores calculados a partir de tus respuestas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <h3 className="font-medium">MSF (Punto medio del sueño en días libres)</h3>
                      <p className="text-xl mt-1 font-semibold">{MSF_hora}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        El punto medio entre el inicio y el fin del sueño en días libres.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg">
                      <h3 className="font-medium">MSFsc (MSF corregido por deuda de sueño)</h3>
                      <p className="text-xl mt-1 font-semibold">{MSFsc_hora}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        MSF corregido para compensar la deuda de sueño acumulada durante la semana.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg">
                      <h3 className="font-medium">SJL (Jetlag Social)</h3>
                      <p className="text-xl mt-1 font-semibold">{SJL_hora}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        La diferencia absoluta entre el punto medio del sueño en días libres y días laborables.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <h3 className="font-medium">SDw (Duración del sueño en días laborables)</h3>
                      <p className="text-xl mt-1 font-semibold">{SDw_hora}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg">
                      <h3 className="font-medium">SDf (Duración del sueño en días libres)</h3>
                      <p className="text-xl mt-1 font-semibold">{SDf_hora}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg">
                      <h3 className="font-medium">SDweek (Duración media semanal del sueño)</h3>
                      <p className="text-xl mt-1 font-semibold">{SDweek_hora}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg">
                      <h3 className="font-medium">SOf (Inicio del sueño en días libres)</h3>
                      <p className="text-xl mt-1 font-semibold">
                        {decimalAHora(resultados.SOf || resultados.so_f || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Comparación de horarios</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium">Días laborables</h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>
                          Hora de acostarse:{" "}
                          <span className="font-semibold">
                            {resultados.horaAcostarseLaboral || resultados.hora_acostar_lab}
                          </span>
                        </li>
                        <li>
                          Tiempo para dormirse:{" "}
                          <span className="font-semibold">
                            {resultados.minutosParaDormirseLaboral || resultados.min_dormirse_lab} min
                          </span>
                        </li>
                        <li>
                          Hora de despertar:{" "}
                          <span className="font-semibold">
                            {resultados.horaDespertarLaboral || resultados.hora_despertar_lab}
                          </span>
                        </li>
                        <li>
                          Duración del sueño: <span className="font-semibold">{SDw_hora}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium">Días libres</h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>
                          Hora de acostarse:{" "}
                          <span className="font-semibold">
                            {resultados.horaAcostarseLibre || resultados.hora_acostar_lib}
                          </span>
                        </li>
                        <li>
                          Tiempo para dormirse:{" "}
                          <span className="font-semibold">
                            {resultados.minutosParaDormirseLibre || resultados.min_dormirse_lib} min
                          </span>
                        </li>
                        <li>
                          Hora de despertar:{" "}
                          <span className="font-semibold">
                            {resultados.horaDespertarLibre || resultados.hora_despertar_lib}
                          </span>
                        </li>
                        <li>
                          Duración del sueño: <span className="font-semibold">{SDf_hora}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
