"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientSupabaseClient } from "@/lib/supabase"

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

      // Verificar conexión a Supabase
      try {
        const supabase = createClientSupabaseClient()
        const { data, error } = await supabase.from("respuestas_cronotipo").select("count").limit(1)

        if (error) {
          setStatus((prev) => ({ ...prev, supabase: `Error: ${error.message}` }))
        } else {
          setStatus((prev) => ({ ...prev, supabase: "Conexión exitosa" }))
        }
      } catch (e) {
        setStatus((prev) => ({ ...prev, supabase: `Error: ${e.message}` }))
      }

      setLoading(false)
    }

    checkEnvironment()
  }, [])

  // Función para probar el envío de datos a Supabase
  const testSupabaseInsert = async () => {
    try {
      setStatus((prev) => ({ ...prev, testInsert: "Probando..." }))

      const testData = {
        id: `test-${Date.now()}`,
        tipo_cuestionario: "test",
        created_at: new Date().toISOString(),
        cronotipo: "Test",
        msf_sc: 4.5,
        sjl: 1.2,
      }

      const response = await fetch("/api/diagnostico/test-insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      const result = await response.json()

      if (result.success) {
        setStatus((prev) => ({ ...prev, testInsert: "Éxito: Datos de prueba insertados correctamente" }))
      } else {
        setStatus((prev) => ({ ...prev, testInsert: `Error: ${result.error}` }))
      }
    } catch (e) {
      setStatus((prev) => ({ ...prev, testInsert: `Error: ${e.message}` }))
    }
  }

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
                <p className={`mt-1 ${status.localStorage === "Funcionando" ? "text-green-600" : "text-red-600"}`}>
                  {status.localStorage}
                </p>
              </div>

              <div>
                <h3 className="font-medium">Conexión a Supabase:</h3>
                <p className={`mt-1 ${status.supabase?.includes("Error") ? "text-red-600" : "text-green-600"}`}>
                  {status.supabase}
                </p>
                <Button onClick={testSupabaseInsert} variant="outline" size="sm" className="mt-2">
                  Probar inserción de datos
                </Button>
                {status.testInsert && (
                  <p
                    className={`mt-2 text-sm ${status.testInsert?.includes("Error") ? "text-red-600" : "text-green-600"}`}
                  >
                    {status.testInsert}
                  </p>
                )}
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
