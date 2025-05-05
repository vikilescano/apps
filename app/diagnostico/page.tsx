"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function DiagnosticoPage() {
  const [status, setStatus] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkEnvironment() {
      setStatus((prev) => ({ ...prev, checking: true }))

      // Verificar variables de entorno del cliente
      const clientEnvVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "No configurado",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurado" : "No configurado",
      }

      setStatus((prev) => ({ ...prev, clientEnvVars }))

      // Verificar localStorage
      try {
        localStorage.setItem("test", "test")
        const testValue = localStorage.getItem("test")
        localStorage.removeItem("test")
        setStatus((prev) => ({ ...prev, localStorage: testValue === "test" ? "Funcionando" : "Error" }))
      } catch (e) {
        setStatus((prev) => ({ ...prev, localStorage: `Error: ${e.message}` }))
      }

      setLoading(false)
    }

    checkEnvironment()
  }, [])

  return (
    <div className="container py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Diagnóstico de la Aplicación</CardTitle>
          <CardDescription>Verifica el estado de los componentes críticos</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Verificando estado...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Variables de entorno del cliente:</h3>
                <pre className="bg-slate-100 p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(status.clientEnvVars, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-medium">Estado de localStorage:</h3>
                <p className="mt-1">{status.localStorage}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => (window.location.href = "/")}>Volver al inicio</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
