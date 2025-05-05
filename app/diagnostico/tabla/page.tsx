"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Database } from "lucide-react"
import Link from "next/link"

export default function VerificarTablaPage() {
  const [status, setStatus] = useState<{
    loading: boolean
    success?: boolean
    exists?: boolean
    canInsert?: boolean
    message?: string
    error?: string
    tableInfo?: any
    suggestion?: string
  }>({
    loading: true,
  })

  useEffect(() => {
    async function checkTable() {
      try {
        setStatus({ loading: true })

        const response = await fetch("/api/diagnostico/verificar-tabla")
        const data = await response.json()

        setStatus({
          loading: false,
          success: data.success,
          exists: data.exists,
          canInsert: data.canInsert,
          message: data.message,
          error: data.error,
          tableInfo: data.tableInfo,
          suggestion: data.suggestion,
        })
      } catch (error) {
        setStatus({
          loading: false,
          success: false,
          error: `Error al realizar la verificación: ${error.message}`,
        })
      }
    }

    checkTable()
  }, [])

  // Función para probar la inserción manual
  const testManualInsert = async () => {
    try {
      setStatus((prev) => ({ ...prev, testing: true }))

      const testData = {
        id: `test-manual-${Date.now()}`,
        tipo_cuestionario: "test-manual",
        created_at: new Date().toISOString(),
        cronotipo: "Test Manual",
        msf_sc: 5.0,
        sjl: 1.5,
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
        setStatus((prev) => ({
          ...prev,
          testing: false,
          testResult: "Éxito: Datos de prueba insertados manualmente",
        }))
      } else {
        setStatus((prev) => ({
          ...prev,
          testing: false,
          testResult: `Error: ${result.error}`,
        }))
      }
    } catch (e) {
      setStatus((prev) => ({
        ...prev,
        testing: false,
        testResult: `Error: ${e.message}`,
      }))
    }
  }

  return (
    <div className="container py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Verificación de Tabla respuestas_cronotipo
          </CardTitle>
          <CardDescription>Verifica si la tabla existe y si se pueden insertar datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status.loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="ml-4">Verificando tabla respuestas_cronotipo...</p>
            </div>
          ) : status.success ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800">Tabla verificada correctamente</AlertTitle>
              <AlertDescription className="text-green-700">{status.message}</AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800">Error al verificar la tabla</AlertTitle>
              <AlertDescription className="text-red-700">{status.error}</AlertDescription>
            </Alert>
          )}

          {status.suggestion && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800">Sugerencia</AlertTitle>
              <AlertDescription className="text-amber-700">{status.suggestion}</AlertDescription>
            </Alert>
          )}

          {status.tableInfo && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Información de la tabla:</h3>
              <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(status.tableInfo, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Prueba manual de inserción:</h3>
            <p className="text-sm text-gray-600 mb-4">
              Puedes probar manualmente la inserción de datos para verificar si hay problemas específicos.
            </p>
            <Button onClick={testManualInsert} disabled={status.loading || status.testing} className="mb-2">
              {status.testing ? "Probando..." : "Insertar datos de prueba manualmente"}
            </Button>
            {status.testResult && (
              <p className={`mt-2 text-sm ${status.testResult?.includes("Error") ? "text-red-600" : "text-green-600"}`}>
                {status.testResult}
              </p>
            )}
          </div>

          <Alert className="mt-6">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Recomendaciones</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Si la tabla no existe, deberás crearla en Supabase.</li>
                <li>Verifica que el rol de servicio tenga permisos para insertar datos.</li>
                <li>Asegúrate de que la estructura de la tabla coincida con los datos que estás enviando.</li>
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
