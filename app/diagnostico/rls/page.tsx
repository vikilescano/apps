"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function DiagnosticoRLSPage() {
  const [rlsStatus, setRlsStatus] = useState<{ enabled: boolean; policies: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkRLSStatus()
  }, [])

  async function checkRLSStatus() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/diagnostico/rls")
      const data = await response.json()

      if (data.success) {
        setRlsStatus({
          enabled: data.rls_enabled,
          policies: data.policies || [],
        })
      } else {
        setError(data.error || "Error al verificar el estado de RLS")
      }
    } catch (error) {
      setError("Error al verificar el estado de RLS: " + String(error))
    } finally {
      setLoading(false)
    }
  }

  async function applyRLS() {
    try {
      setApplying(true)
      setError(null)
      setSuccess(null)

      const response = await fetch("/api/diagnostico/aplicar-rls", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("RLS aplicado correctamente")
        // Actualizar el estado después de aplicar RLS
        await checkRLSStatus()
      } else {
        setError(data.error || "Error al aplicar RLS")
      }
    } catch (error) {
      setError("Error al aplicar RLS: " + String(error))
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de Row Level Security (RLS)</h1>

      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Estado de RLS</h2>

        {loading ? (
          <p>Verificando estado de RLS...</p>
        ) : error ? (
          <div className="text-red-600">
            <p>Error: {error}</p>
          </div>
        ) : (
          <div>
            <p className="mb-2">
              <span className="font-medium">Estado actual: </span>
              <span className={rlsStatus?.enabled ? "text-green-600" : "text-red-600"}>
                {rlsStatus?.enabled ? "Habilitado" : "No habilitado"}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Aplicar RLS</h2>

        <Button
          onClick={applyRLS}
          disabled={applying || (rlsStatus?.enabled && rlsStatus?.policies.length > 0)}
          className="mb-2"
        >
          {applying ? "Aplicando..." : "Aplicar RLS"}
        </Button>

        {success && (
          <div className="text-green-600 mt-2">
            <p>{success}</p>
          </div>
        )}

        {error && (
          <div className="text-red-600 mt-2">
            <p>Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Políticas existentes</h2>

        {loading ? (
          <p>Cargando políticas...</p>
        ) : rlsStatus?.policies.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Nombre</th>
                  <th className="py-2 px-4 border-b">Operación</th>
                  <th className="py-2 px-4 border-b">Rol</th>
                </tr>
              </thead>
              <tbody>
                {rlsStatus.policies.map((policy, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">{policy.policyname}</td>
                    <td className="py-2 px-4 border-b">{policy.cmd}</td>
                    <td className="py-2 px-4 border-b">{policy.roles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay políticas configuradas.</p>
        )}
      </div>
    </div>
  )
}
