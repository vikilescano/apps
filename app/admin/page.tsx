"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Trash2, Edit, Check, X } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [respuestas, setRespuestas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<any>({})

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        fetchRespuestas()
      } else {
        toast({
          title: "Error de autenticación",
          description: "La contraseña es incorrecta",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al intentar iniciar sesión",
        variant: "destructive",
      })
    }
  }

  const fetchRespuestas = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/respuestas")

      if (!response.ok) {
        throw new Error("No se pudieron cargar las respuestas")
      }

      const data = await response.json()
      setRespuestas(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al cargar las respuestas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (respuestas.length === 0) return

    // Definir todas las columnas que queremos incluir en el CSV
    const columns = [
      // Identificación y timestamp
      "id",
      "created_at",

      // Datos demográficos
      "edad",
      "genero",
      "provincia",
      "pais",

      // Días laborables
      "hora_despertar_lab",
      "min_despertar_lab",
      "despertar_antes_alarma_lab",
      "hora_despierto_lab",
      "hora_energia_baja_lab",
      "hora_acostar_lab",
      "min_dormirse_lab",
      "siesta_lab",
      "duracion_siesta_lab",

      // Días libres
      "hora_sueno_despertar_lib",
      "hora_despertar_lib",
      "intenta_dormir_mas_lib",
      "min_extra_sueno_lib",
      "min_despertar_lib",
      "hora_despierto_lib",
      "hora_energia_baja_lib",
      "hora_acostar_lib",
      "min_dormirse_lib",
      "siesta_lib",
      "duracion_siesta_lib",

      // Hábitos antes de dormir y preferencias
      "actividades_antes_dormir",
      "min_lectura_antes_dormir",
      "min_maximo_lectura",
      "prefiere_oscuridad_total",
      "despierta_mejor_con_luz",

      // Tiempo al aire libre
      "horas_aire_libre_lab",
      "min_aire_libre_lab",
      "horas_aire_libre_lib",
      "min_aire_libre_lib",

      // Resultados calculados
      "msf",
      "msf_sc",
      "sd_w",
      "sd_f",
      "sd_week",
      "so_f",
      "sjl",
      "cronotipo",
    ]

    // Crear la fila de encabezados
    let csv = columns.join(",") + "\n"

    // Añadir cada fila de datos
    respuestas.forEach((respuesta) => {
      const row = columns.map((column) => {
        const value = respuesta[column]

        // Manejar valores especiales
        if (value === null || value === undefined) return ""
        if (typeof value === "boolean") return value ? "true" : "false"
        if (Array.isArray(value)) return `"${value.join(", ")}"`
        if (typeof value === "string" && value.includes(",")) return `"${value}"`

        return value
      })

      csv += row.join(",") + "\n"
    })

    // Crear un blob y descargar
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `cuestionario-cronotipo-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  const selectAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedRows(respuestas.map((r) => r.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleDeleteSelected = async () => {
    try {
      const response = await fetch("/api/admin/respuestas/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedRows }),
      })

      if (!response.ok) {
        throw new Error("Error al eliminar las respuestas")
      }

      toast({
        title: "Éxito",
        description: `Se eliminaron ${selectedRows.length} respuesta(s) correctamente`,
      })

      // Actualizar la lista de respuestas
      fetchRespuestas()
      setSelectedRows([])
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al eliminar las respuestas",
        variant: "destructive",
      })
    }
  }

  const startEditing = (respuesta: any) => {
    setEditingRow(respuesta.id)
    setEditFormData({
      edad: respuesta.edad,
      genero: respuesta.genero,
      provincia: respuesta.provincia,
      pais: respuesta.pais,
      cronotipo: respuesta.cronotipo,
      msf_sc: respuesta.msf_sc,
      sjl: respuesta.sjl,
      horas_aire_libre_lab: respuesta.horas_aire_libre_lab,
      min_aire_libre_lab: respuesta.min_aire_libre_lab,
      horas_aire_libre_lib: respuesta.horas_aire_libre_lib,
      min_aire_libre_lib: respuesta.min_aire_libre_lib,
    })
  }

  const cancelEditing = () => {
    setEditingRow(null)
    setEditFormData({})
  }

  const handleEditChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const saveEditing = async () => {
    try {
      const response = await fetch(`/api/admin/respuestas/${editingRow}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la respuesta")
      }

      toast({
        title: "Éxito",
        description: "La respuesta se actualizó correctamente",
      })

      // Actualizar la lista de respuestas
      fetchRespuestas()
      setEditingRow(null)
      setEditFormData({})
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar la respuesta",
        variant: "destructive",
      })
    }
  }

  const actualizarTiposCuestionario = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/actualizar-tipos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al actualizar los tipos de cuestionario")
      }

      const data = await response.json()

      toast({
        title: "Actualización completada",
        description: `Se actualizaron ${data.totalActualizaciones} registros (${data.actualizacionesGenerales} generales, ${data.actualizacionesReducidas} reducidos)`,
      })

      // Actualizar la lista de respuestas
      fetchRespuestas()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar los tipos de cuestionario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Administración</CardTitle>
            <CardDescription>Ingresá la contraseña para acceder al panel de administración</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Iniciar sesión
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground mt-2">Gestión de respuestas del Cuestionario de Cronotipo de Munich</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Respuestas ({respuestas.length})</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
              disabled={selectedRows.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Borrar seleccionados ({selectedRows.length})
            </Button>
            <Button onClick={downloadCSV} disabled={respuestas.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Descargar CSV
            </Button>
            <Button onClick={actualizarTiposCuestionario} variant="outline">
              Actualizar tipos de cuestionario
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>Lista de respuestas al cuestionario</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedRows.length === respuestas.length && respuestas.length > 0}
                        onCheckedChange={(checked) => selectAllRows(!!checked)}
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Género</TableHead>
                    <TableHead>Provincia</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead>Cronotipo</TableHead>
                    <TableHead>MSFsc</TableHead>
                    <TableHead>Jetlag Social</TableHead>
                    <TableHead>Aire Libre Lab (h:m)</TableHead>
                    <TableHead>Aire Libre Lib (h:m)</TableHead>
                    <TableHead className="w-20">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8">
                        Cargando respuestas...
                      </TableCell>
                    </TableRow>
                  ) : respuestas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8">
                        No hay respuestas disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    respuestas.map((respuesta) => (
                      <TableRow key={respuesta.id} className={selectedRows.includes(respuesta.id) ? "bg-muted/50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(respuesta.id)}
                            onCheckedChange={() => toggleRowSelection(respuesta.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{respuesta.id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <span
                            className={respuesta.tipo_cuestionario === "reducido" ? "text-blue-600" : "text-green-600"}
                          >
                            {respuesta.tipo_cuestionario === "reducido"
                              ? "Reducido"
                              : respuesta.tipo_cuestionario === "general"
                                ? "General"
                                : "Desconocido"}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(respuesta.created_at).toLocaleDateString()}</TableCell>

                        {editingRow === respuesta.id ? (
                          // Modo edición
                          <>
                            <TableCell>
                              <Input
                                type="number"
                                value={editFormData.edad || ""}
                                onChange={(e) =>
                                  handleEditChange("edad", e.target.value ? Number(e.target.value) : null)
                                }
                                className="w-16"
                              />
                            </TableCell>
                            <TableCell>
                              <select
                                value={editFormData.genero || ""}
                                onChange={(e) => handleEditChange("genero", e.target.value)}
                                className="w-full p-2 border rounded"
                              >
                                <option value="">-</option>
                                <option value="femenino">Femenino</option>
                                <option value="masculino">Masculino</option>
                                <option value="otro">Otro</option>
                              </select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editFormData.provincia || ""}
                                onChange={(e) => handleEditChange("provincia", e.target.value)}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editFormData.pais || ""}
                                onChange={(e) => handleEditChange("pais", e.target.value)}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <select
                                value={editFormData.cronotipo || ""}
                                onChange={(e) => handleEditChange("cronotipo", e.target.value)}
                                className="w-full p-2 border rounded"
                              >
                                <option value="Extremadamente temprano">Extremadamente temprano</option>
                                <option value="Moderadamente temprano">Moderadamente temprano</option>
                                <option value="Ligeramente temprano">Ligeramente temprano</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Ligeramente tardío">Ligeramente tardío</option>
                                <option value="Moderadamente tardío">Moderadamente tardío</option>
                                <option value="Extremadamente tardío">Extremadamente tardío</option>
                              </select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={editFormData.msf_sc || ""}
                                onChange={(e) =>
                                  handleEditChange("msf_sc", e.target.value ? Number(e.target.value) : null)
                                }
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={editFormData.sjl || ""}
                                onChange={(e) =>
                                  handleEditChange("sjl", e.target.value ? Number(e.target.value) : null)
                                }
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={editFormData.horas_aire_libre_lab || 0}
                                  onChange={(e) => handleEditChange("horas_aire_libre_lab", Number(e.target.value))}
                                  className="w-12"
                                />
                                :
                                <Input
                                  type="number"
                                  value={editFormData.min_aire_libre_lab || 0}
                                  onChange={(e) => handleEditChange("min_aire_libre_lab", Number(e.target.value))}
                                  className="w-12"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={editFormData.horas_aire_libre_lib || 0}
                                  onChange={(e) => handleEditChange("horas_aire_libre_lib", Number(e.target.value))}
                                  className="w-12"
                                />
                                :
                                <Input
                                  type="number"
                                  value={editFormData.min_aire_libre_lib || 0}
                                  onChange={(e) => handleEditChange("min_aire_libre_lib", Number(e.target.value))}
                                  className="w-12"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={saveEditing}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={cancelEditing}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          // Modo visualización
                          <>
                            <TableCell>{respuesta.edad || "-"}</TableCell>
                            <TableCell>{respuesta.genero || "-"}</TableCell>
                            <TableCell>{respuesta.provincia || "-"}</TableCell>
                            <TableCell>{respuesta.pais || "-"}</TableCell>
                            <TableCell>{respuesta.cronotipo}</TableCell>
                            <TableCell>
                              {respuesta.msf_sc
                                ? `${Math.floor(respuesta.msf_sc)}:${Math.round((respuesta.msf_sc % 1) * 60)
                                    .toString()
                                    .padStart(2, "0")}`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {respuesta.sjl
                                ? `${Math.floor(respuesta.sjl)}h ${Math.round((respuesta.sjl % 1) * 60)}min`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {respuesta.horas_aire_libre_lab || respuesta.min_aire_libre_lab
                                ? `${respuesta.horas_aire_libre_lab || 0}h ${respuesta.min_aire_libre_lab || 0}m`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {respuesta.horas_aire_libre_lib || respuesta.min_aire_libre_lib
                                ? `${respuesta.horas_aire_libre_lib || 0}h ${respuesta.min_aire_libre_lib || 0}m`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => startEditing(respuesta)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedRows([respuesta.id])
                                    setIsDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente {selectedRows.length} respuesta(s) seleccionada(s) y no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
