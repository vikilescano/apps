"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { v4 as uuidv4 } from "uuid"

export default function TestInsertRLSPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleTestInsert() {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      // Crear datos de prueba
      const testData = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        edad: 30,
        genero: "Masculino",
        pais: "España",
        provincia: "Madrid",
        hora_despertar_lab: "07:00",
        min_despertar_lab: 10,
        hora_acostar_lab: "23:00",
        min_dormirse_lab: 15,
        hora_despertar_lib: "08:30",
        min_despertar_lib: 15,
        hora_acostar_lib: "00:00",
        min_dormirse_lib: 20,
        cronotipo: "Intermedio",
        msf: 5.5,
        msf_sc: 5.2,
        sd_w: 7.5,
        sd_f: 8.5,
        sd_week: 7.8,
        sjl: 1.5,
      }

      // Enviar datos a la API de prueba
      const response = await fetch("/api/diagnostico/test-insert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      const data = await response.json()
      setResult(data)

      if (!data.success) {
        setError(data.error || "Error desconocido al insertar datos")
      }
    } catch (error) {
      console.error("Error al realizar la prueba:", error)
      setError(`Error al realizar la prueba: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prueba de inserción con RLS</h1>
      <p className="mb-4">
        Esta página prueba si se pueden insertar datos en la tabla respuestas_cronotipo con las políticas de RLS
        actuales.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prueba de inserción</CardTitle>
          <CardDescription>Haz clic en el botón para intentar insertar datos de prueba en Supabase.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestInsert} disabled={loading}>
            {loading ? "Probando..." : "Probar inserción"}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          {error && (
            <div className="text-red-600 mb-2">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
          {result && (
            <div className={result.success ? "text-green-600" : "text-red-600"}>
              <p className="font-medium">Resultado:</p>
              <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto max-w-full">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información sobre RLS</CardTitle>
          <CardDescription>
            Row Level Security (RLS) controla qué filas pueden ser leídas, insertadas, actualizadas o eliminadas
            basándose en políticas definidas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Las políticas actuales permiten:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Inserciones desde cualquier origen (anónimo, autenticado o servicio)</li>
            <li>Lecturas desde cualquier origen</li>
            <li>Actualizaciones desde cualquier origen</li>
            <li>Eliminaciones solo al rol de servicio</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
