"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { RespuestaCronotipo } from "@/lib/types"
import { describirCronotipo } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface DataTableProps {
  data: RespuestaCronotipo[]
}

export function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const router = useRouter()

  // Filtrar datos según término de búsqueda
  const filteredData = data.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pais.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cronotipo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Paginar datos
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Manejar clic en fila
  const handleRowClick = (id: string) => {
    console.log(`Clicked row with ID: ${id}`)
    router.push(`/dashboard/${id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span>
            Página {currentPage} de {totalPages || 1}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Género</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Cronotipo</TableHead>
              <TableHead>MSF</TableHead>
              <TableHead>SJL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => handleRowClick(item.id)}
                  className="cursor-pointer hover:bg-muted"
                >
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{item.edad}</TableCell>
                  <TableCell>{item.genero}</TableCell>
                  <TableCell>{item.pais}</TableCell>
                  <TableCell>{describirCronotipo(item.cronotipo)}</TableCell>
                  <TableCell>{item.msf?.toFixed(2) || "N/A"}</TableCell>
                  <TableCell>{item.sjl?.toFixed(2) || "N/A"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
