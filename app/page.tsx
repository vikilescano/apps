import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Cuestionario de Cronotipo de Munich</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Descubrí tu cronotipo y comprendé mejor tu reloj biológico interno
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link href="/cuestionario-reducido">
          <Button className="w-full">Versión reducida</Button>
        </Link>
        <Link href="/admin">
          <Button className="w-full" variant="outline">
            Panel de administración
          </Button>
        </Link>
        <Link href="/investigadores">
          <Button className="w-full" variant="outline">
            Panel de investigadores
          </Button>
        </Link>
      </div>
    </div>
  )
}
