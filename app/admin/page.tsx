"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, RefreshCw, FileDown, LogOut } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [respuestas, setRespuestas] = useState([])
  const [error, setError] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "check" }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        fetchRespuestas()
      }
    } catch (error) {
      console.error("Error al verificar autenticación:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, action: "login" }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsAuthenticated(true)
        fetchRespuestas()
      } else {
        setError(data.error || "Error al iniciar sesión")
      }
    } catch (error) {
      setError("Error al procesar la solicitud")
    }
  }

  async function fetchRespuestas() {
    setIsLoading(true)
    setError(null)
    try {
      console.log("Obteniendo respuestas...")
      const response = await fetch("/api/admin/respuestas")
      console.log("Respuesta recibida:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error ${response.status}: ${errorText}`)
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Respuestas obtenidas:", data)

      if (Array.isArray(data)) {
        setRespuestas(data)
        if (data.length === 0) {
          toast({
            title: "Sin datos",
            description: "No se encontraron respuestas en la base de datos",
          })
        } else {
          toast({
            title: "Datos cargados",
            description: `Se cargaron ${data.length} respuestas`,
          })
        }
      } else {
        console.error("Formato de datos incorrecto:", data)
        setRespuestas([])
        toast({
          title: "Error de formato",
          description: "Los datos recibidos no tienen el formato esperado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al obtener respuestas:", error)
      setError("Error al cargar las respuestas: " + error.message)
      toast({
        title: "Error",
        description: "No se pudieron cargar las respuestas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "logout" }),
      })

      setIsAuthenticated(false)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  async function handleDeleteRespuesta(id) {
    setIsDeletingMultiple(false)
    setIsDeleteDialogOpen(true)
    setSelectedRows([id])
  }

  async function handleDeleteSelected() {
    setIsDeleteDialogOpen(false)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/respuestas/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedRows }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Respuestas eliminadas",
          description: `Se eliminaron ${selectedRows.length} respuesta(s) correctamente`,
        })
        setSelectedRows([])
        fetchRespuestas()
      } else {
        console.error("Error al eliminar respuestas:", data)
        setError(data.error || "Error al eliminar las respuestas")
        toast({
          title: "Error",
          description: data.error || "No se pudieron eliminar las respuestas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar respuestas:", error)
      setError("Error al procesar la solicitud: " + error.message)
      toast({
        title: "Error",
        description: "Error al procesar la solicitud",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleExportCSV() {
    if (!respuestas || respuestas.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay datos para exportar",
        variant: "destructive",
      })
      return
    }

    try {
      // Obtener todas las claves únicas de todas las respuestas
      const allKeys = new Set()
      respuestas.forEach((respuesta) => {
        Object.keys(respuesta).forEach((key) => allKeys.add(key))
      })
      const headers = Array.from(allKeys)

      // Crear filas de datos
      const csvRows = [
        // Encabezados
        headers.join(","),
        // Datos
        ...respuestas.map((respuesta) =>
          headers
            .map((header) => {
              const value = respuesta[header]
              // Manejar valores especiales
              if (value === null || value === undefined) return ""
              if (typeof value === "object") return JSON.stringify(value).replace(/"/g, '""')
              if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`
              return value
            })
            .join(","),
        ),
      ]

      // Crear blob y descargar
      const csvContent = csvRows.join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `respuestas_cronotipo_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Exportación exitosa",
        description: "Los datos se han exportado correctamente",
      })
    } catch (error) {
      console.error("Error al exportar CSV:", error)
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      })
    }
  }

  function handleViewDetails(id) {
    router.push(`/dashboard/${id}`)
  }

  function toggleRowSelection(id) {
    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rowId) => rowId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  function toggleAllRows(checked) {
    if (checked) {
      setSelectedRows(respuestas.map((r) => r.id))
    } else {
      setSelectedRows([])
    }
  }

  function handleDeleteMultiple() {
    if (selectedRows.length === 0) {
      toast({
        title: "Ninguna fila seleccionada",
        description: "Por favor, selecciona al menos una fila para eliminar",
        variant: "destructive",
      })
      return
    }

    setIsDeletingMultiple(true)
    setIsDeleteDialogOpen(true)
  }

  if (isLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[80vh]">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">
                Iniciar sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <div className="flex gap-2">
          <Button onClick={fetchRespuestas} variant="outline" disabled={isLoading} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            {isLoading ? "Cargando..." : "Actualizar"}
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            disabled={respuestas.length === 0 || isLoading}
            className="flex items-center"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={handleLogout} variant="outline" className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Respuestas ({respuestas.length})</CardTitle>
          {selectedRows.length > 0 && (
            <Button onClick={handleDeleteMultiple} variant="destructive" size="sm" className="flex items-center">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar seleccionados ({selectedRows.length})
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Cargando respuestas...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-2 py-3 bg-gray-50">
                      <Checkbox
                        checked={respuestas.length > 0 && selectedRows.length === respuestas.length}
                        onCheckedChange={toggleAllRows}
                        aria-label="Seleccionar todas las filas"
                      />
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Género
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      País
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cronotipo
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MSF-SC
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {respuestas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay respuestas registradas
                      </td>
                    </tr>
                  ) : (
                    respuestas.map((respuesta) => (
                      <tr key={respuesta.id} className={selectedRows.includes(respuesta.id) ? "bg-gray-50" : ""}>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <Checkbox
                            checked={selectedRows.includes(respuesta.id)}
                            onCheckedChange={() => toggleRowSelection(respuesta.id)}
                            aria-label={`Seleccionar fila ${respuesta.id}`}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(respuesta.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{respuesta.edad || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{respuesta.genero || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{respuesta.pais || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {respuesta.cronotipo || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {respuesta.msf_sc !== null && respuesta.msf_sc !== undefined
                            ? Number(respuesta.msf_sc).toFixed(2)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button onClick={() => handleViewDetails(respuesta.id)} variant="outline" size="sm">
                              Ver
                            </Button>
                            <Button
                              onClick={() => handleDeleteRespuesta(respuesta.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {isDeletingMultiple
                ? `Esta acción eliminará permanentemente ${selectedRows.length} respuesta(s) seleccionada(s).`
                : "Esta acción eliminará permanentemente la respuesta seleccionada."}
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
