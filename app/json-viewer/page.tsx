"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function JsonViewerPage() {
  const [localStorageData, setLocalStorageData] = useState({})
  const [serverData, setServerData] = useState({})
  const [supabaseData, setSupabaseData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("localStorage")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)

      // Cargar datos de localStorage
      const localData = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        try {
          const value = localStorage.getItem(key)
          localData[key] = JSON.parse(value)
        } catch (e) {
          localData[key] = localStorage.getItem(key)
        }
      }
      setLocalStorageData(localData)

      // Cargar datos del servidor
      const serverResponse = await fetch("/api/diagnostico/server-data")
      const serverResult = await serverResponse.json()
      setServerData(serverResult)

      // Cargar datos de Supabase
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase.from("respuestas_cronotipo").select("*").limit(10)

      if (error) {
        console.error("Error al cargar datos de Supabase:", error)
        setError(error.message)
      } else {
        setSupabaseData(data || [])
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Visor de datos JSON</h1>

      <div className="mb-4">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === "localStorage" ? "border-b-2 border-blue-500 font-medium" : ""}`}
            onClick={() => setActiveTab("localStorage")}
          >
            LocalStorage
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "server" ? "border-b-2 border-blue-500 font-medium" : ""}`}
            onClick={() => setActiveTab("server")}
          >
            Servidor
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "supabase" ? "border-b-2 border-blue-500 font-medium" : ""}`}
            onClick={() => setActiveTab("supabase")}
          >
            Supabase
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-4">Cargando datos...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          <p className="font-medium">Error al cargar datos:</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded p-4">
          {activeTab === "localStorage" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Datos en LocalStorage</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto max-h-96">
                {JSON.stringify(localStorageData, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === "server" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Datos en el Servidor</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto max-h-96">
                {JSON.stringify(serverData, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === "supabase" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Datos en Supabase</h2>
              {supabaseData.length === 0 ? (
                <p className="text-gray-600">No hay datos disponibles en Supabase.</p>
              ) : (
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto max-h-96">
                  {JSON.stringify(supabaseData, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <button onClick={loadData} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Recargar datos
        </button>
      </div>
    </div>
  )
}
