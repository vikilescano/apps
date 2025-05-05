import { Suspense } from "react"
import { createServerSupabaseClient } from "@/lib/supabase"
import { calcularEstadisticas } from "@/lib/utils"
import { StatsCard } from "@/components/dashboard/stats-card"
import { CronotipoChart } from "@/components/dashboard/cronotipo-chart"
import { DataTable } from "@/components/dashboard/data-table"
import type { RespuestaCronotipo } from "@/lib/types"
import { Users, Clock, Calendar, Globe } from "lucide-react"

async function getData() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("respuestas_cronotipo").select("*")

  if (error) {
    console.error("Error fetching data:", error)
    return []
  }

  return data as RespuestaCronotipo[]
}

export default async function DashboardPage() {
  const data = await getData()
  const stats = calcularEstadisticas(data)

  // Preparar datos para gráficos
  const cronotiposData = {
    labels: Object.keys(stats.distribucionCronotipos).map((key) => key.replace("_", " ")),
    values: Object.values(stats.distribucionCronotipos) as number[],
  }

  const generosData = {
    labels: Object.keys(stats.porGenero),
    values: Object.values(stats.porGenero) as number[],
  }

  const edadesData = {
    labels: Object.keys(stats.porEdad),
    values: Object.values(stats.porEdad) as number[],
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard de Cronotipos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Respuestas" value={stats.total} icon={<Users className="h-4 w-4" />} />
        <StatsCard
          title="Promedio MSF"
          value={stats.promedioMSF.toFixed(2)}
          description="Punto medio de sueño en días libres"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatsCard
          title="Promedio SJL"
          value={stats.promedioSJL.toFixed(2)}
          description="Jet lag social"
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatsCard title="Países" value={Object.keys(stats.porPais).length} icon={<Globe className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CronotipoChart title="Distribución de Cronotipos" data={cronotiposData} />
        <CronotipoChart title="Distribución por Género" data={generosData} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <h2 className="text-2xl font-bold">Datos Individuales</h2>
        <Suspense fallback={<div>Cargando datos...</div>}>
          <DataTable data={data} />
        </Suspense>
      </div>
    </div>
  )
}
