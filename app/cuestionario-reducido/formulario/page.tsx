"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/use-toast"
import { calcularResultados } from "@/lib/utils"

export default function FormularioPage() {
  const [formData, setFormData] = useState({
    edad: "",
    genero: "",
    provincia: "",
    pais: "",
    horaAcostarseLaboral: "",
    minutosParaDormirseLaboral: "",
    horaDespertarLaboral: "",
    minutosPararLevantarseLaboral: "",
    usaAlarmaLaboral: "",
    despiertaAntesAlarmaLaboral: "",
    horaAcostarseLibre: "",
    minutosParaDormirseLibre: "",
    horaDespertarLibre: "",
    minutosPararLevantarseLibre: "",
    usaAlarmaLibre: "",
    razonesNoElegirSueno: "",
    tipoRazonesNoElegirSueno: "",
    prefiereOscuridadTotal: "",
    despiertaMejorConLuz: "",
    actividadesAntesDormir: "",
    minutosLecturaAntesDormir: "",
    horasAireLibreDiasLaborales: "",
    minutosAireLibreDiasLaborales: "",
    horasAireLibreDiasLibres: "",
    minutosAireLibreDiasLibres: "",
  })
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Manejar el envío del formulario
  async function handleSubmit(event) {
    // Asegurarse de que event sea un objeto con preventDefault
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault()
    }

    // Mostrar un mensaje para confirmar que se ha hecho clic en el botón
    console.log("Botón Ver Resultados clickeado")

    // Validación final antes de enviar - solo los campos esenciales
    if (
      !formData.horaAcostarseLaboral ||
      !formData.horaDespertarLaboral ||
      !formData.horaAcostarseLibre ||
      !formData.horaDespertarLibre
    ) {
      toast({
        title: "Por favor completa todos los campos obligatorios",
        description: "Debes completar las horas de acostarse y despertar tanto para días laborables como libres",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Preparando datos para cálculos...")

      // Convertir los datos del formulario al formato esperado por calcularResultados
      const datosParaCalculos = {
        horaAcostarseLaboral: formData.horaAcostarseLaboral,
        minutosParaDormirseLaboral: Number.parseInt(formData.minutosParaDormirseLaboral || "0") || 0,
        horaDespertarLaboral: formData.horaDespertarLaboral,
        minutosPararDespertarLaboral: Number.parseInt(formData.minutosPararLevantarseLaboral || "0") || 0,
        despertarAntesAlarmaLaboral:
          formData.usaAlarmaLaboral === "true" ? formData.despiertaAntesAlarmaLaboral === "true" : null,
        horaCompletamenteDespiertaLaboral: formData.horaDespertarLaboral,
        horaEnergiaBajaLaboral: "18:00",
        siestaDiaLaboral: false,
        duracionSiestaDiaLaboral: null,

        horaAcostarseLibre: formData.horaAcostarseLibre,
        minutosParaDormirseLibre: Number.parseInt(formData.minutosParaDormirseLibre || "0") || 0,
        horaDespertarLibre: formData.horaDespertarLibre,
        minutosPararDespertarLibre: Number.parseInt(formData.minutosPararLevantarseLibre || "0") || 0,
        horaSuenoDespetarLibre: formData.horaDespertarLibre,
        intentaDormirMasLibre: false,
        minutosExtraSuenoLibre: null,
        horaCompletamenteDespiertaLibre: formData.horaDespertarLibre,
        horaEnergiaBajaLibre: "18:00",
        siestaDiaLibre: false,
        duracionSiestaDiaLibre: null,
      }

      console.log("Calculando resultados...")
      // Calcular resultados
      const resultados = calcularResultados(datosParaCalculos)
      console.log("Resultados calculados:", resultados)

      // Generar un ID único
      const id = uuidv4()

      // Preparar datos completos
      const datosCompletos = {
        id,
        created_at: new Date().toISOString(),
        edad: formData.edad ? Number.parseInt(formData.edad) : null,
        genero: formData.genero || null,
        provincia: formData.provincia || null,
        pais: formData.pais || null,

        horaAcostarseLaboral: formData.horaAcostarseLaboral,
        minutosParaDormirseLaboral: Number.parseInt(formData.minutosParaDormirseLaboral || "0") || 0,
        horaDespertarLaboral: formData.horaDespertarLaboral,
        minutosPararLevantarseLaboral: Number.parseInt(formData.minutosPararLevantarseLaboral || "0") || 0,
        usaAlarmaLaboral: formData.usaAlarmaLaboral === "true",
        despiertaAntesAlarmaLaboral: formData.despiertaAntesAlarmaLaboral === "true",

        horaAcostarseLibre: formData.horaAcostarseLibre,
        minutosParaDormirseLibre: Number.parseInt(formData.minutosParaDormirseLibre || "0") || 0,
        horaDespertarLibre: formData.horaDespertarLibre,
        minutosPararLevantarseLibre: Number.parseInt(formData.minutosPararLevantarseLibre || "0") || 0,
        usaAlarmaLibre: formData.usaAlarmaLibre === "true",
        razonesNoElegirSueno: formData.razonesNoElegirSueno === "true",
        tipoRazonesNoElegirSueno: formData.tipoRazonesNoElegirSueno,

        prefiereOscuridadTotal: formData.prefiereOscuridadTotal === "true",
        despiertaMejorConLuz: formData.despiertaMejorConLuz === "true",

        // Actividades antes de dormir
        actividadesAntesDormir: formData.actividadesAntesDormir,
        minutosLecturaAntesDormir: Number.parseInt(formData.minutosLecturaAntesDormir || "0") || 0,

        horasAireLibreDiasLaborales: Number.parseInt(formData.horasAireLibreDiasLaborales || "0") || 0,
        minutosAireLibreDiasLaborales: Number.parseInt(formData.minutosAireLibreDiasLaborales || "0") || 0,
        horasAireLibreDiasLibres: Number.parseInt(formData.horasAireLibreDiasLibres || "0") || 0,
        minutosAireLibreDiasLibres: Number.parseInt(formData.minutosAireLibreDiasLibres || "0") || 0,

        // Incluir resultados calculados
        ...resultados,

        // Añadir un campo para identificar que es la versión reducida
        tipo_cuestionario: "reducido",
      }

      // Guardar en localStorage
      localStorage.setItem("cronotipo_resultados", JSON.stringify(datosCompletos))

      // Guardar en sessionStorage con el ID específico
      sessionStorage.setItem(`cronotipo_resultados_${id}`, JSON.stringify(datosCompletos))

      // Enviar a la API y esperar la respuesta
      try {
        console.log("Enviando datos a la API...")
        const response = await fetch("/api/cuestionario-reducido", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosCompletos),
        })

        if (!response.ok) {
          throw new Error(`Error en la respuesta de la API: ${response.status}`)
        }

        const responseData = await response.json()
        console.log("Respuesta de la API:", responseData)

        if (responseData.supabaseError) {
          console.warn("Los datos se guardaron localmente pero hubo un error con Supabase:", responseData.supabaseError)
        }
      } catch (fetchError) {
        console.error("Error al enviar datos al servidor:", fetchError)
        // Continuamos con el flujo aunque haya error en el envío
      }

      // Mostrar mensaje de éxito
      toast({
        title: "Formulario enviado correctamente",
        description: "Redirigiendo a la página de resultados...",
      })

      // Redirigir a la página de resultados
      console.log("Redirigiendo a:", `/resultados/${id}`)
      router.push(`/resultados/${id}`)
    } catch (error) {
      console.error("Error detallado:", error)

      // Generar un ID de emergencia
      const emergencyId = uuidv4()

      // Intentar guardar los resultados básicos en localStorage
      try {
        const resultadosBasicos = {
          id: emergencyId,
          created_at: new Date().toISOString(),
          horaAcostarseLaboral: formData.horaAcostarseLaboral,
          horaDespertarLaboral: formData.horaDespertarLaboral,
          horaAcostarseLibre: formData.horaAcostarseLibre,
          horaDespertarLibre: formData.horaDespertarLibre,
          cronotipo: "No calculado debido a un error",
        }

        localStorage.setItem("cronotipo_resultados", JSON.stringify(resultadosBasicos))
        sessionStorage.setItem(`cronotipo_resultados_${emergencyId}`, JSON.stringify(resultadosBasicos))

        toast({
          title: "Error al calcular resultados",
          description: "Se guardó información básica localmente. Serás redirigido a la página de resultados.",
          variant: "destructive",
        })

        router.push(`/resultados/${emergencyId}`)
      } catch (localStorageError) {
        toast({
          title: "Error",
          description: `Hubo un problema al enviar el cuestionario y no se pudieron guardar los datos: ${error.message}`,
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
    }
  }

  return <div>{/* Your form content goes here */}</div>
}
