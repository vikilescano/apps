import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Cuestionario de Cronotipo de Munich</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Descubrí tu cronotipo y comprendé mejor tu reloj biológico interno
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
          <p>
            Completar este cuestionario te ayudará a entender mejor tus patrones de sueño y tu reloj biológico interno,
            lo que puede ser útil para optimizar tu horario diario y mejorar tu bienestar.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row gap-4">
          <Link href="/cuestionario" className="w-full md:w-1/2">
            <Button className="w-full">Comenzá el cuestionario completo</Button>
          </Link>
          <Link href="/cuestionario-reducido" className="w-full md:w-1/2">
            <Button className="w-full" variant="outline">
              Versión reducida
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">
        <Link href="/admin" className="w-full md:w-1/2">
          <Button variant="outline" className="w-full">
            Panel de Administración
          </Button>
        </Link>
        <Link href="/investigadores" className="w-full md:w-1/2">
          <Button variant="outline" className="w-full">
            Portal para Investigadores
          </Button>
        </Link>
      </div>
    </div>
  )
}
