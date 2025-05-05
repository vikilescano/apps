import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase"
import type { RespuestaCronotipo } from "@/lib/types"
import { formatearHora, describirCronotipo } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Sun, Moon, Calendar } from "lucide-react"

async function getRespuesta(id: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("respuestas_cronotipo").select("*").eq("id", id).single()

  if (error || !data) {
    console.error("Error fetching data:", error)
    return null
  }

  return data as RespuestaCronotipo
}

export default async function RespuestaDetallePage({ params }: { params: { id: string } }) {
  const respuesta = await getRespuesta(params.id)

  if (!respuesta) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detalle de Respuesta</h1>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Cronotipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{describirCronotipo(respuesta.cronotipo)}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">MSF:</span>
                <span className="font-medium">{respuesta.msf?.toFixed(2) || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SJL:</span>
                <span className="font-medium">{respuesta.sjl?.toFixed(2) || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="mr-2 h-5 w-5" />
              Datos Personales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Edad:</span>
              <span className="font-medium">{respuesta.edad} años</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Género:</span>
              <span className="font-medium">{respuesta.genero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">País:</span>
              <span className="font-medium">{respuesta.pais}</span>
            </div>
            {respuesta.provincia && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provincia:</span>
                <span className="font-medium">{respuesta.provincia}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">{new Date(respuesta.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Moon className="mr-2 h-5 w-5" />
              Preferencias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prefiere oscuridad total:</span>
              <span className="font-medium">{respuesta.prefiere_oscuridad_total ? "Sí" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Despierta mejor con luz:</span>
              <span className="font-medium">{respuesta.despierta_mejor_con_luz ? "Sí" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Siesta en días laborables:</span>
              <span className="font-medium">{respuesta.siesta_lab ? "Sí" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Siesta en días libres:</span>
              <span className="font-medium">{respuesta.siesta_lib ? "Sí" : "No"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Días Laborables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hora de acostarse:</span>
              <span className="font-medium">{formatearHora(respuesta.hora_acostar_lab)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minutos para dormirse:</span>
              <span className="font-medium">{respuesta.min_dormirse_lab} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hora de despertar:</span>
              <span className="font-medium">{formatearHora(respuesta.hora_despertar_lab)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minutos para despertar:</span>
              <span className="font-medium">{respuesta.min_despertar_lab} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Despierta antes de la alarma:</span>
              <span className="font-medium">{respuesta.despertar_antes_alarma_lab ? "Sí" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tiempo al aire libre:</span>
              <span className="font-medium">
                {respuesta.horas_aire_libre_lab}h {respuesta.min_aire_libre_lab}min
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Días Libres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hora de acostarse:</span>
              <span className="font-medium">{formatearHora(respuesta.hora_acostar_lib)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minutos para dormirse:</span>
              <span className="font-medium">{respuesta.min_dormirse_lib} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hora de despertar:</span>
              <span className="font-medium">{formatearHora(respuesta.hora_despertar_lib)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minutos para despertar:</span>
              <span className="font-medium">{respuesta.min_despertar_lib} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Intenta dormir más:</span>
              <span className="font-medium">{respuesta.intenta_dormir_mas_lib ? "Sí" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tiempo al aire libre:</span>
              <span className="font-medium">
                {respuesta.horas_aire_libre_lib}h {respuesta.min_aire_libre_lib}min
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
