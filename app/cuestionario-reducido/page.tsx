"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { z } from "zod"

// Definición del esquema de formulario (mantenido para referencia)
const formSchema = z.object({
  // Datos demográficos
  edad: z.coerce.number().min(1, "Edad inválida").max(120, "Edad inválida").optional().nullable(),
  genero: z.enum(["femenino", "masculino"]).optional().nullable(),
  provincia: z.string().optional().nullable(),
  pais: z.string().optional().nullable(),

  // Días laborables
  horaAcostarseLaboral: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  horaPreparadoDormirLaboral: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  minutosParaDormirseLaboral: z.coerce.number().min(0),
  horaDespertarLaboral: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  minutosPararLevantarseLaboral: z.coerce.number().min(0),
  usaAlarmaLaboral: z.boolean().optional().nullable(),
  despiertaAntesAlarmaLaboral: z.boolean().optional().nullable(),

  // Días libres
  horaAcostarseLibre: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  horaPreparadoDormirLibre: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  minutosParaDormirseLibre: z.coerce.number().min(0),
  horaDespertarLibre: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  minutosPararLevantarseLibre: z.coerce.number().min(0),
  usaAlarmaLibre: z.boolean().optional().nullable(),
  razonesNoElegirSueno: z.boolean().optional().nullable(),
  razonesNoElegirSuenoTipos: z.array(z.string()).optional(),
  razonesNoElegirSuenoOtros: z.string().optional(),

  // Hábitos antes de dormir y preferencias
  actividadesAntesDormir: z.array(z.string()).optional().default([]),
  minutosLecturaAntesDormir: z.coerce.number().min(0),
  prefiereOscuridadTotal: z.boolean().optional().nullable(),
  despiertaMejorConLuz: z.boolean().optional().nullable(),

  // Tiempo al aire libre
  horasAireLibreDiasLaborales: z.coerce.number().min(0),
  minutosAireLibreDiasLaborales: z.coerce.number().min(0).max(59),
  horasAireLibreDiasLibres: z.coerce.number().min(0),
  minutosAireLibreDiasLibres: z.coerce.number().min(0).max(59),
})

export default function CuestionarioReducidoPage() {
  const router = useRouter()

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Cuestionario de Cronotipo de Munich (Versión Reducida)</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Descubrí tu cronotipo y comprendé mejor tu reloj biológico interno con nuestra versión simplificada
        </p>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>¿Qué es el cronotipo?</CardTitle>
          <CardDescription>
            El cronotipo es tu preferencia natural para dormir y estar activo en determinados momentos del día.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            El Cuestionario de Cronotipo de Munich (MCTQ) es una herramienta científica desarrollada para evaluar tu
            cronotipo basándose en tus hábitos de sueño tanto en días laborables como en días libres.
          </p>
          <p className="mb-4">
            Esta versión reducida te permite completar el cuestionario de forma más rápida, manteniendo la precisión en
            la evaluación de tu cronotipo.
          </p>
          <p>
            Completar este cuestionario te ayudará a entender mejor tus patrones de sueño y tu reloj biológico interno,
            lo que puede ser útil para optimizar tu horario diario y mejorar tu bienestar.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/cuestionario-reducido/formulario" className="w-full">
            <Button className="w-full">Comenzá el cuestionario reducido</Button>
          </Link>
        </CardFooter>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">
        <Link href="/" className="w-full md:w-1/2">
          <Button variant="outline" className="w-full">
            Volver al inicio
          </Button>
        </Link>
        <Link href="/cuestionario" className="w-full md:w-1/2">
          <Button variant="outline" className="w-full">
            Ir al cuestionario completo
          </Button>
        </Link>
      </div>
    </div>
  )
}
