"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SupabaseDiagnosticoPage() {
  const [status, setStatus] = useState<{
    loading: boolean
    success?: boolean
    message?: string
    error?: string
    envVars?: any
    details?: any
  }>({
    loading: true,
  })

  useEffect(() => {
    async function checkSupabase() {
      try {
        setStatus({ loading: true })

        const response = await fetch("/api/diagnostico/test-supabase")
        const data = await response.json()

        if (data.success) {
          setStatus({
            loading: false,
            success: true,
            message: data.message,
            envVars: data.envVars,
            details: data,
          })
        } else {
          setStatus({
            loading: false,
            success: false,
            error: data.error,
            envVars: data.envVars,
            details: data,
          })
        }
      } catch (error) {
        setStatus({
          loading: false,
          success: false,
          error: `Error al realizar la prueba: ${error.message}`,
        })
      }
    }

    checkSupabase()
  }, [])

  return (
    <div className="container py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Diagnóstico de Conexión a Supabase</CardTitle>
          <CardDescription>Verifica el estado de la conexión a la base de datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status.loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="ml-4">Verificando conexión a Supabase...</p>
            </div>
          ) : status.success ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800">Conexión exitosa</AlertTitle>
              <AlertDescription className="text-green-700">{status.message}</AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800">Error de conexión</AlertTitle>
              <AlertDescription className="text-red-700">{status.error}</AlertDescription>
            </Alert>
          )}

          {status.envVars && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Variables de entorno:</h3>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(status.envVars, null, 2)}</pre>
              </div>
            </div>
          )}

          {status.details && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Detalles adicionales:</h3>
              <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(status.details, null, 2)}</pre>
              </div>
            </div>
          )}

          <Alert className="mt-6">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Recomendaciones</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Verifica que las variables de entorno de Supabase estén correctamente configuradas.</li>
                <li>Asegúrate de que la tabla respuestas_cronotipo exista en tu base de datos.</li>
                <li>Comprueba que el rol de servicio tenga permisos para insertar y leer datos.</li>
                <li>Revisa los logs del servidor para obtener más detalles sobre posibles errores.</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/diagnostico">
            <Button variant="outline">Volver a Diagnóstico</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>Volver a verificar</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
