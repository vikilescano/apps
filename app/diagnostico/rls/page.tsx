"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function DiagnosticoRLS() {
  const [status, setStatus] = useState("Verificando...")
  const [isRLSEnabled, setIsRLSEnabled] = useState(false)
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkRLSStatus()
  }, [])

  async function checkRLSStatus() {
    try {
      setLoading(true)
      const supabase = createClientSupabaseClient()

      // Verificar si RLS está habilitado
      const { data: rlsData, error: rlsError } = await supabase.rpc("check_rls_status", {
        table_name: "respuestas_cronotipo",
      })

      if (rlsError) {
        console.error("Error al verificar RLS:", rlsError)
        setStatus("Error al verificar el estado de RLS")
        setError(rlsError.message)
        return
      }

      setIsRLSEnabled(rlsData?.is_rls_enabled || false)

      // Verificar políticas existentes
      const { data: policiesData, error: policiesError } = await supabase.rpc("get_table_policies", {
        table_name: "respuestas_cronotipo",
      })

      if (policiesError) {
        console.error("Error al obtener políticas:", policiesError)
        setError(policiesError.message)
      } else {
        setPolicies(policiesData || [])
      }

      setStatus(rlsData?.is_rls_enabled ? "RLS está habilitado" : "RLS no está habilitado")
    } catch (error) {
      console.error("Error al verificar RLS:", error)
      setStatus("Error al verificar RLS")
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function applyRLS() {
    try {
      setApplying(true)
      const supabase = createClientSupabaseClient()

      // Habilitar RLS
      const { error: enableError } = await supabase.rpc("enable_rls", {
        table_name: "respuestas_cronotipo",
      })

      if (enableError) {
        console.error("Error al habilitar RLS:", enableError)
        setError(enableError.message)
        return
      }

      // Crear políticas necesarias
      const policies = [
        {
          name: "Permitir inserciones a usuarios autenticados",
          operation: "INSERT",
          role: "authenticated",
          using: "true",
          check: "true",
        },
        {
          name: "Permitir inserciones anónimas",
          operation: "INSERT",
          role: "anon",
          using: "true",
          check: "true",
        },
        {
          name: "Permitir lectura a usuarios autenticados",
          operation: "SELECT",
          role: "authenticated",
          using: "true",
          check: null,
        },
        {
          name: "Permitir todas las operaciones al servicio",
          operation: "ALL",
          role: "service_role",
          using: "true",
          check: "true",
        },
      ]

      for (const policy of policies) {
        const { error } = await supabase.rpc("create_policy", {
          table_name: "respuestas_cronotipo",
          policy_name: policy.name,
          operation: policy.operation,
          role: policy.role,
          using_expr: policy.using,
          check_expr: policy.check,
        })

        if (error) {
          console.error(`Error al crear política ${policy.name}:`, error)
          // Continuar con las demás políticas incluso si hay error
        }
      }

      // Verificar el estado actualizado
      await checkRLSStatus()
      setStatus("RLS aplicado correctamente")
    } catch (error) {
      console.error("Error al aplicar RLS:", error)
      setStatus("Error al aplicar RLS")
      setError(error.message)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de Row Level Security (RLS)</h1>

      <div className="bg-white shadow rounded p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Estado de RLS</h2>
        <p className="mb-2">
          <span className="font-medium">Estado actual:</span>{" "}
          <span className={isRLSEnabled ? "text-green-600" : "text-red-600"}>
            {loading ? "Verificando..." : isRLSEnabled ? "Habilitado" : "No habilitado"}
          </span>
        </p>

        {!loading && !isRLSEnabled && (
          <button
            onClick={applyRLS}
            disabled={applying}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {applying ? "Aplicando..." : "Aplicar RLS"}
          </button>
        )}

        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
            <p className="font-medium">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {!loading && (
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Políticas existentes</h2>

          {policies.length === 0 ? (
            <p className="text-gray-600">No hay políticas configuradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Nombre</th>
                    <th className="py-2 px-4 border-b">Operación</th>
                    <th className="py-2 px-4 border-b">Rol</th>
                    <th className="py-2 px-4 border-b">Using</th>
                    <th className="py-2 px-4 border-b">Check</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="py-2 px-4 border-b">{policy.policyname}</td>
                      <td className="py-2 px-4 border-b">{policy.operation}</td>
                      <td className="py-2 px-4 border-b">{policy.role}</td>
                      <td className="py-2 px-4 border-b">{policy.using || "-"}</td>
                      <td className="py-2 px-4 border-b">{policy.check || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
