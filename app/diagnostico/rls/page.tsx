"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Shield } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function DiagnosticoRLSPage() {
  const [diagnostico, setDiagnostico] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [aplicandoRLS, setAplicandoRLS] = useState(false)

  const realizarDiagnostico = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/diagnostico/rls")
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

  const aplicarRLS = async () => {
    setAplicandoRLS(true)
    try {
      const response = await fetch("/api/diagnostico/aplicar-rls", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "RLS aplicado correctamente",
          description: "Se ha habilitado RLS en la tabla respuestas_cronotipo",
        })
        // Actualizar diagnóstico
        realizarDiagnostico()
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo aplicar RLS",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al aplicar RLS:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al aplicar RLS",
        variant: "destructive",
      })
    } finally {
      setAplicandoRLS(false)
    }
  }

  useEffect(() => {
    realizarDiagnostico()
  }, [])

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Diagnóstico de RLS</h1>
          <p className="text-muted-foreground mt-2">
            Verifica y soluciona problemas de Row Level Security (RLS) en Supabase
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Estado de RLS
              </CardTitle>
              <CardDescription>Verifica si RLS está habilitado en tus tablas</CardDescription>
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
                      {diagnostico.rls_enabled ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">Row Level Security (RLS)</h3>
                      <p className="text-sm text-muted-foreground">
                        {diagnostico.rls_enabled
                          ? "RLS está habilitado en la tabla respuestas_cronotipo"
                          : "RLS no está habilitado en la tabla respuestas_cronotipo"}
                      </p>
                    </div>
                  </div>

                  {diagnostico.policies && (
                    <div className="flex items-start">
                      <div className="mr-4">
                        {diagnostico.policies.length > 0 ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <AlertCircle className="h-6 w-6 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Políticas de RLS</h3>
                        <p className="text-sm text-muted-foreground">
                          {diagnostico.policies.length > 0
                            ? `Se encontraron ${diagnostico.policies.length} políticas configuradas`
                            : "No se encontraron políticas configuradas"}
                        </p>
                        {diagnostico.policies.length > 0 && (
                          <div className="mt-2 bg-slate-50 p-3 rounded-md">
                            <ul className="text-sm space-y-1">
                              {diagnostico.policies.map((policy, index) => (
                                <li key={index}>
                                  <span className="font-medium">{policy.name}</span> - {policy.definition}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!diagnostico.rls_enabled && (
                    <Alert className="bg-amber-50 border-amber-200 mt-4">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800">RLS deshabilitado</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Tu tabla respuestas_cronotipo es pública pero no tiene habilitado RLS. Esto significa que
                        cualquier persona con acceso a tu API podría leer o modificar los datos. Haz clic en "Aplicar
                        RLS" para solucionar este problema.
                      </AlertDescription>
                    </Alert>
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
              {diagnostico && !diagnostico.rls_enabled && (
                <Button onClick={aplicarRLS} disabled={aplicandoRLS}>
                  {aplicandoRLS ? (
                    <>
                      <Shield className="mr-2 h-4 w-4 animate-pulse" />
                      Aplicando RLS...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Aplicar RLS
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿Qué es RLS?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Row Level Security (RLS) es una característica de seguridad que permite controlar qué filas de una tabla
                pueden ser leídas, insertadas, actualizadas o eliminadas según el usuario que realiza la operación. Es
                esencial para proteger tus datos en aplicaciones con múltiples usuarios.
              </p>
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium">Beneficios de RLS:</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Protege tus datos de accesos no autorizados</li>
                  <li>Permite definir políticas de acceso granulares</li>
                  <li>Funciona a nivel de base de datos, no solo en tu aplicación</li>
                  <li>Reduce el riesgo de exposición accidental de datos</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="https://supabase.com/docs/guides/auth/row-level-security" target="_blank">
                <Button variant="outline">Más información sobre RLS</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
