"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function DiagnosticoSupabasePage() {
  const [diagnostico, setDiagnostico] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)

  const realizarDiagnostico = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/diagnostico/supabase")
      const data = await response.json()
      setDiagnostico(data)
    } catch (error) {
      console.error("Error al realizar diagnóstico:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al realizar el diagnóstico",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sincronizarDatos = async () => {
    setSincronizando(true)
    try {
      const response = await fetch("/api/sincronizar", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Sincronización completada",
          description: data.message,
        })
      } else {
        toast({
          title: "Error de sincronización",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al sincronizar datos:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al sincronizar los datos",
        variant: "destructive",
      })
    } finally {
      setSincronizando(false)
    }
  }

  useEffect(() => {
    realizarDiagnostico()
  }, [])

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Diagnóstico de Supabase</h1>
          <p className="text-muted-foreground mt-2">
            Esta herramienta te ayuda a diagnosticar problemas con la conexión a Supabase
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Estado de la conexión
              </CardTitle>
              <CardDescription>Verifica si la aplicación puede conectarse a Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2">Realizando diagnóstico...</span>
                </div>
              ) : diagnostico ? (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mr-4">
                      {diagnostico.success ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">Conexión a Supabase</h3>
                      <p className="text-sm text-muted-foreground">
                        {diagnostico.success
                          ? "La conexión a Supabase está funcionando correctamente"
                          : `Error de conexión: ${diagnostico.error}`}
                      </p>
                    </div>
                  </div>

                  {diagnostico.success && (
                    <>
                      <div className="flex items-start">
                        <div className="mr-4">
                          {diagnostico.tableSchemaError ? (
                            <XCircle className="h-6 w-6 text-red-500" />
                          ) : (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">Estructura de la tabla</h3>
                          <p className="text-sm text-muted-foreground">
                            {diagnostico.tableSchemaError
                              ? `Error al obtener la estructura: ${diagnostico.tableSchemaError.message}`
                              : "La estructura de la tabla es correcta"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="mr-4">
                          {diagnostico.insertPermission ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">Permisos de escritura</h3>
                          <p className="text-sm text-muted-foreground">
                            {diagnostico.insertPermission
                              ? "Tienes permisos para insertar datos en la tabla"
                              : `Error al insertar datos: ${diagnostico.insertError?.message}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="mr-4">
                          {diagnostico.tableInfo ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">Información de la tabla</h3>
                          <p className="text-sm text-muted-foreground">
                            {diagnostico.tableInfo
                              ? `Tabla encontrada: ${diagnostico.tableInfo.table_name}`
                              : "No se pudo obtener información detallada de la tabla"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No hay datos</AlertTitle>
                  <AlertDescription>
                    No se ha realizado ningún diagnóstico todavía. Haz clic en el botón "Realizar diagnóstico".
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={realizarDiagnostico} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Diagnosticando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Realizar diagnóstico
                  </>
                )}
              </Button>
              <Button onClick={sincronizarDatos} disabled={sincronizando || !diagnostico?.success}>
                {sincronizando ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Sincronizar datos locales
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {diagnostico && !diagnostico.success && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">Solución recomendada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-red-700">
                  <p>
                    Se ha detectado un problema con la conexión a Supabase. Mientras se resuelve, la aplicación
                    utilizará almacenamiento local para guardar las respuestas.
                  </p>
                  <p>Recomendaciones para solucionar el problema:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Verifica que las variables de entorno de Supabase estén configuradas correctamente</li>
                    <li>Comprueba que la tabla "respuestas_cronotipo" exista en tu base de datos</li>
                    <li>Asegúrate de que tienes los permisos necesarios para acceder a la tabla</li>
                    <li>Revisa los logs de Supabase para ver si hay algún error específico</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
