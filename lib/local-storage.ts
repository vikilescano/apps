/**
 * Utilidades para manejar el almacenamiento local de respuestas
 */

// Guardar una respuesta en localStorage
export function guardarRespuesta(respuesta: any) {
  try {
    // Guardar la respuesta individual
    localStorage.setItem(`cronotipo_resultados_${respuesta.id}`, JSON.stringify(respuesta))

    // Actualizar la lista de todas las respuestas
    const todasRespuestas = obtenerTodasRespuestas()

    // Verificar si la respuesta ya existe
    const index = todasRespuestas.findIndex((r) => r.id === respuesta.id)

    if (index >= 0) {
      // Actualizar respuesta existente
      todasRespuestas[index] = respuesta
    } else {
      // Añadir nueva respuesta
      todasRespuestas.push(respuesta)
    }

    // Guardar la lista actualizada
    localStorage.setItem("cronotipo_todas_respuestas", JSON.stringify(todasRespuestas))

    return true
  } catch (error) {
    console.error("Error al guardar respuesta en localStorage:", error)
    return false
  }
}

// Obtener una respuesta específica por ID
export function obtenerRespuesta(id: string) {
  try {
    const respuesta = localStorage.getItem(`cronotipo_resultados_${id}`)
    return respuesta ? JSON.parse(respuesta) : null
  } catch (error) {
    console.error("Error al obtener respuesta de localStorage:", error)
    return null
  }
}

// Obtener todas las respuestas
export function obtenerTodasRespuestas() {
  try {
    const respuestas = localStorage.getItem("cronotipo_todas_respuestas")
    return respuestas ? JSON.parse(respuestas) : []
  } catch (error) {
    console.error("Error al obtener todas las respuestas de localStorage:", error)
    return []
  }
}

// Eliminar una respuesta
export function eliminarRespuesta(id: string) {
  try {
    // Eliminar la respuesta individual
    localStorage.removeItem(`cronotipo_resultados_${id}`)

    // Actualizar la lista de todas las respuestas
    const todasRespuestas = obtenerTodasRespuestas()
    const respuestasActualizadas = todasRespuestas.filter((r) => r.id !== id)
    localStorage.setItem("cronotipo_todas_respuestas", JSON.stringify(respuestasActualizadas))

    return true
  } catch (error) {
    console.error("Error al eliminar respuesta de localStorage:", error)
    return false
  }
}

// Exportar todas las respuestas como JSON
export function exportarRespuestasJSON() {
  const respuestas = obtenerTodasRespuestas()
  return JSON.stringify(respuestas, null, 2)
}

// Importar respuestas desde JSON
export function importarRespuestasJSON(jsonData: string) {
  try {
    const respuestas = JSON.parse(jsonData)

    if (!Array.isArray(respuestas)) {
      return false
    }

    // Guardar cada respuesta individualmente
    respuestas.forEach((respuesta) => {
      if (respuesta && respuesta.id) {
        guardarRespuesta(respuesta)
      }
    })

    return true
  } catch (error) {
    console.error("Error al importar respuestas:", error)
    return false
  }
}

// Obtener una respuesta específica por ID
export function obtenerRespuestaPorId(id: string) {
  try {
    const respuesta = localStorage.getItem(`cronotipo_resultados_${id}`)
    return respuesta ? JSON.parse(respuesta) : null
  } catch (error) {
    console.error("Error al obtener respuesta de localStorage:", error)
    return null
  }
}
