"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Download, RefreshCw, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function JsonViewerPage() {
  const [localData, setLocalData] = useState<any[]>([])
  const [serverData, setServerData] = useState<any[]>([])
  const [supabaseData, setSupabaseData] = useState<any[]>([])
  const [loading, setLoading] = useState({
    local: false,
    server: false,
    supabase: false,
  })

  // Cargar datos al iniciar
  useEffect(() => {
    loadLocalData()
    loadServerData()
    loadSupabaseData()
  }, [])

  // Cargar datos de localStorage
  const loadLocalData = () => {
    setLoading((prev) => ({ ...prev, local: true }))
    try {
      const data = localStorage.getItem("cronotipo_todas_respuestas")
      setLocalData(data ? JSON.parse(data) : [])
    } catch (error) {
      console.error("Error al cargar datos locales:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos locales",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, local: false }))
    }
  }

  // Cargar datos del servidor
  const loadServerData = async () => {
    setLoading((prev) => ({ ...prev, server: true }))
    try {
      const response = await fetch("/api/respuestas-locales")
      if (response.ok) {
        const data = await response.json()
        setServerData(data)
      } else {
        throw new Error("Error al cargar datos del servidor")
      }
    } catch (error) {
      console.error("Error al cargar datos del servidor:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del servidor",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, server: false }))
    }
  }

  // Cargar datos de Supabase
  const loadSupabaseData = async () => {
    setLoading((prev) => ({ ...prev, supabase: true }))
    try {
      const response = await fetch("/api/admin/respuestas")
      if (response.ok) {
        const data = await response.json()
        setSupabaseData(data)
      } else {
        throw new Error("Error al cargar datos de Supabase")
      }
    } catch (error) {
      console.error("Error al cargar datos de Supabase:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de Supabase",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, supabase: false }))
    }
  }

  // Descargar JSON
  const downloadJson = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "Error",
        description: "No hay datos para descargar",
        variant: "destructive",
      })
      return
    }

    const jsonData = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Sincronizar datos
  const syncData = async () => {
    try {
      const response = await fetch("/api/sincronizar", {
        method: "POST",
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Sincronización completada",
          description: result.message,
        })

        // Recargar datos después de sincronizar
        loadLocalData()
        loadServerData()
        loadSupabaseData()
      } else {
        throw new Error("Error al sincronizar datos")
      }
    } catch (error) {
      console.error("Error al sincronizar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron sincronizar los datos",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Visor de JSON</h1>
          <p className="text-muted-foreground mt-2">
            Accede y gestiona los datos almacenados en diferentes ubicaciones
          </p>
        </div>

        <div className="flex justify-end gap-2 mb-4">
          <Button onClick={syncData} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Sincronizar datos
          </Button>
        </div>

        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="local">LocalStorage ({localData.length})</TabsTrigger>
            <TabsTrigger value="server">Servidor ({serverData.length})</TabsTrigger>
            <TabsTrigger value="supabase">Supabase ({supabaseData.length})</TabsTrigger>
          </TabsList>

          {/* LocalStorage */}
          <TabsContent value="local">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Datos en LocalStorage</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={loadLocalData} disabled={loading.local}>
                      <RefreshCw className={`h-4 w-4 ${loading.local ? "animate-spin" : ""}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadJson(localData, "cronotipo-local.json")}
                      disabled={localData.length === 0}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>Datos almacenados en el navegador (localStorage)</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.local ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : localData.length > 0 ? (
                  <div className="bg-slate-50 p-4 rounded-md overflow-auto max-h-96">
                    <pre className="text-xs">{JSON.stringify(localData, null, 2)}</pre>
                  </div>
                ) : (
                  <Alert>
                    <AlertTitle>No hay datos</AlertTitle>
                    <AlertDescription>No se encontraron datos almacenados en localStorage</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Ruta: localStorage.getItem("cronotipo_todas_respuestas")
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Servidor */}
          <TabsContent value="server">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Datos en el Servidor</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={loadServerData} disabled={loading.server}>
                      <RefreshCw className={`h-4 w-4 ${loading.server ? "animate-spin" : ""}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadJson(serverData, "cronotipo-server.json")}
                      disabled={serverData.length === 0}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>Datos almacenados en el archivo JSON del servidor</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.server ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : serverData.length > 0 ? (
                  <div className="bg-slate-50 p-4 rounded-md overflow-auto max-h-96">
                    <pre className="text-xs">{JSON.stringify(serverData, null, 2)}</pre>
                  </div>
                ) : (
                  <Alert>
                    <AlertTitle>No hay datos</AlertTitle>
                    <AlertDescription>No se encontraron datos almacenados en el servidor</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">Ruta: /data/respuestas.json</p>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Supabase */}
          <TabsContent value="supabase">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Datos en Supabase</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={loadSupabaseData} disabled={loading.supabase}>
                      <RefreshCw className={`h-4 w-4 ${loading.supabase ? "animate-spin" : ""}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadJson(supabaseData, "cronotipo-supabase.json")}
                      disabled={supabaseData.length === 0}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>Datos almacenados en la base de datos Supabase</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.supabase ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : supabaseData.length > 0 ? (
                  <div className="bg-slate-50 p-4 rounded-md overflow-auto max-h-96">
                    <pre className="text-xs">{JSON.stringify(supabaseData, null, 2)}</pre>
                  </div>
                ) : (
                  <Alert>
                    <AlertTitle>No hay datos</AlertTitle>
                    <AlertDescription>No se encontraron datos almacenados en Supabase</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">Tabla: respuestas_cronotipo</p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
