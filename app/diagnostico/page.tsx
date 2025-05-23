"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { v4 as uuidv4 } from "uuid"

export default function DiagnosticoPage() {
  const [connectionStatus, setConnectionStatus] = useState("Verificando...")
  const [tableStatus, setTableStatus] = useState("Verificando...")
  const [schemaStatus, setSchemaStatus] = useState("Verificando...")
  const [insertStatus, setInsertStatus] = useState("Verificando...")
  const [tableInfo, setTableInfo] = useState(null)
  const [error, setError] = useState(null)

  // Estados para la prueba de inserción
  const [testResult, setTestResult] = useState(null)
  const [testLoading, setTestLoading] = useState(false)
  const [testError, setTestError] = useState(null)

  useEffect(() => {
    checkConnection()
    checkTable()
  }, [])

  async function checkConnection() {
    try {
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase.from("respuestas_cronotipo").select("id").limit(1)

      if (error) {
        setConnectionStatus("Error de conexión")
        setError(error.message)
      } else {
        setConnectionStatus("Conexión exitosa")
      }
    } catch (error) {
      setConnectionStatus("Error de conexión")
      setError(error.message)
    }
  }

  async function checkTable() {
    try {
      const response = await fetch("/api/diagnostico/verificar-tabla")
      const data = await response.json()

      if (data.success) {
        setTableStatus("Tabla verificada correctamente")
        setInsertStatus("Inserción de datos exitosa")
        setTableInfo(data.tableInfo)

        // Verificar estructura
        if (data.tableInfo) {
          setSchemaStatus("Estructura verificada correctamente")
        } else {
          setSchemaStatus("Error al obtener la estructura")
          setError("No se pudo obtener información del esquema")
        }
      } else {
        setTableStatus("Error al verificar la tabla")
        setInsertStatus("Error al insertar datos")
        setSchemaStatus("Error al obtener la estructura")
        setError(data.error)
      }
    } catch (error) {
      setTableStatus("Error al verificar la tabla")
      setError(error.message || "Error desconocido")
    }
  }

  // Función para probar la inserción con RLS
  async function handleTestInsert() {
    try {
      setTestLoading(true)
      setTestError(null)
      setTestResult(null)

      // Crear datos de prueba
      const testData = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        edad: 30,
        genero: "Masculino",
        pais: "España",
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
        sd_f: 8.5,
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
      setTestResult(data)

      if (!data.success) {
        setTestError(data.error || "Error desconocido al insertar datos")
      }
    } catch (error) {
      console.error("Error al realizar la prueba:", error)
      setTestError(`Error al realizar la prueba: ${error.message}`)
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de la aplicación</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Estado de la conexión</h2>
          <p className="mb-2">Verifica si la aplicación puede conectarse a Supabase</p>

          <div className="mt-2">
            <p className="font-medium">Conexión a Supabase</p>
            <p className={connectionStatus.includes("Error") ? "text-red-600" : "text-green-600"}>{connectionStatus}</p>
          </div>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Estructura de la tabla</h2>
          <p className="mb-2">Verifica la estructura de la tabla respuestas_cronotipo</p>

          <div className="mt-2">
            <p className="font-medium">Estado:</p>
            <p className={schemaStatus.includes("Error") ? "text-red-600" : "text-green-600"}>{schemaStatus}</p>
          </div>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Permisos de escritura</h2>
          <p className="mb-2">Verifica si se pueden insertar datos en la tabla</p>

          <div className="mt-2">
            <p className="font-medium">Estado:</p>
            <p className={insertStatus.includes("Error") ? "text-red-600" : "text-green-600"}>{insertStatus}</p>
          </div>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Información de la tabla</h2>
          <p className="mb-2">Detalles de la estructura de la tabla</p>

          <div className="mt-2">
            {tableInfo ? (
              <div className="max-h-40 overflow-y-auto text-xs">
                <pre>{JSON.stringify(tableInfo, null, 2)}</pre>
              </div>
            ) : (
              <p className="text-red-600">No se pudo obtener información detallada de la tabla</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Verificación de Tabla respuestas_cronotipo</h2>
        <p className="mb-2">Verifica si la tabla existe y si se pueden insertar datos</p>

        <div className="mt-2">
          <p className="font-medium">Estado:</p>
          <p className={tableStatus.includes("Error") ? "text-red-600" : "text-green-600"}>{tableStatus}</p>

          {error && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
              <p className="font-medium">Error general:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Nueva sección para probar la inserción con RLS */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Prueba de inserción con RLS</h2>
        <p className="mb-2">Prueba si se pueden insertar datos en la tabla con las políticas de RLS actuales</p>

        <div className="mt-4">
          <Button onClick={handleTestInsert} disabled={testLoading}>
            {testLoading ? "Probando..." : "Probar inserción"}
          </Button>

          {testError && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
              <p className="font-medium">Error:</p>
              <p className="text-sm">{testError}</p>
            </div>
          )}

          {testResult && (
            <div className="mt-4">
              <p className="font-medium">Resultado:</p>
              <div
                className={`mt-2 p-2 ${testResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} rounded`}
              >
                <p>{testResult.success ? "Inserción exitosa" : "Error en la inserción"}</p>
                <pre className="mt-2 text-xs overflow-auto max-h-40">{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Verificación de RLS</h2>
        <p className="mb-2">Verifica si Row Level Security está configurado correctamente</p>

        <div className="mt-2">
          <Link href="/diagnostico/rls" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Verificar RLS
          </Link>
        </div>
      </div>
    </div>
  )
}
