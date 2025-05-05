"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { v4 as uuidv4 } from "uuid"
import { calcularResultados } from "@/lib/cronotipo-utils"
import { guardarRespuesta } from "@/lib/local-storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Combobox } from "@/components/ui/combobox"
import { provinciasArgentina, paises } from "@/lib/location-data"
import { Checkbox } from "@/components/ui/checkbox"

export default function FormularioReducidoPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 4
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Datos demográficos (opcionales)
    edad: "",
    genero: "",
    provincia: "",
    pais: "",

    // Días laborables
    horaAcostarseLaboral: "",
    minutosParaDormirseLaboral: "0",
    horaDespertarLaboral: "",
    minutosPararLevantarseLaboral: "0",
    usaAlarmaLaboral: "",
    despiertaAntesAlarmaLaboral: "",

    // Días libres
    horaAcostarseLibre: "",
    minutosParaDormirseLibre: "0",
    horaDespertarLibre: "",
    minutosPararLevantarseLibre: "0",
    usaAlarmaLibre: "",
    razonesNoElegirSueno: "",
    tipoRazonesNoElegirSueno: "",

    // Preferencias
    prefiereOscuridadTotal: "",
    despiertaMejorConLuz: "",

    // Actividades antes de dormir
    actividadesAntesDormir: [] as string[],
    minutosLecturaAntesDormir: "0",

    // Tiempo al aire libre
    horasAireLibreDiasLaborales: "0",
    minutosAireLibreDiasLaborales: "0",
    horasAireLibreDiasLibres: "0",
    minutosAireLibreDiasLibres: "0",
  })

  // Convertir las provincias y países a formato de opciones para el combobox
  const provinciaOptions = provinciasArgentina.map((provincia) => ({
    value: provincia,
    label: provincia,
  }))

  const paisOptions = paises.map((pais) => ({
    value: pais,
    label: pais,
  }))

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar cambios en los campos de radio
  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar cambios en los combobox
  const handleComboboxChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Navegar al siguiente paso
  const nextStep = () => {
    // Validar campos obligatorios según el paso actual
    if (step === 2) {
      // En el paso 2, solo validamos los campos obligatorios de días laborables
      if (!formData.horaAcostarseLaboral || !formData.horaDespertarLaboral) {
        toast({
          title: "Campos obligatorios",
          description: "Por favor completa las horas de acostarse y despertar para días laborables.",
          variant: "destructive",
        })
        return
      }
    } else if (step === 3) {
      // En el paso 3, validamos los campos obligatorios de días libres
      if (!formData.horaAcostarseLibre || !formData.horaDespertarLibre) {
        toast({
          title: "Campos obligatorios",
          description: "Por favor completa las horas de acostarse y despertar para días libres.",
          variant: "destructive",
        })
        return
      }
    }

    if (step < totalSteps) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  // Navegar al paso anterior
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  // Mejorar el manejo de errores en la función handleSubmit
  const handleSubmit = async (event) => {
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
        actividades_antes_dormir: formData.actividadesAntesDormir,
        min_lectura_antes_dormir: Number.parseInt(formData.minutosLecturaAntesDormir || "0") || 0,

        horas_aire_libre_lab: Number.parseInt(formData.horasAireLibreDiasLaborales || "0") || 0,
        min_aire_libre_lab: Number.parseInt(formData.minutosAireLibreDiasLaborales || "0") || 0,
        horas_aire_libre_lib: Number.parseInt(formData.horasAireLibreDiasLibres || "0") || 0,
        min_aire_libre_lib: Number.parseInt(formData.minutosAireLibreDiasLibres || "0") || 0,

        // Incluir resultados calculados
        ...resultados,

        // Añadir un campo para identificar que es la versión reducida
        tipo_cuestionario: "reducido",
      }

      // Guardar en localStorage usando nuestra función
      guardarRespuesta(datosCompletos)

      // También guardar en sessionStorage para compatibilidad
      sessionStorage.setItem(`cronotipo_resultados_${id}`, JSON.stringify(datosCompletos))

      // Intentar guardar en el servidor local
      try {
        console.log("Enviando datos a la API local...")
        const response = await fetch("/api/respuestas-locales", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosCompletos),
        })

        const responseData = await response.json()
        console.log("Respuesta de la API local:", responseData)

        if (!responseData.success) {
          console.warn(
            "Advertencia: Los datos se guardaron localmente pero hubo un error con la API local:",
            responseData.error,
          )
          toast({
            title: "Advertencia",
            description:
              "Los datos se guardaron localmente pero hubo un problema con el servidor. Tus resultados están disponibles, pero podrían no aparecer en el panel de administración.",
            variant: "warning",
          })
        }
      } catch (fetchError) {
        console.error("Error al enviar datos al servidor local:", fetchError)
        toast({
          title: "Advertencia",
          description:
            "Hubo un problema al guardar los datos en el servidor, pero tus resultados están disponibles localmente.",
          variant: "warning",
        })
      }

      // Intentar guardar en Supabase como respaldo
      try {
        console.log("Intentando guardar en Supabase como respaldo...")
        fetch("/api/cuestionario-reducido", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosCompletos),
        }).catch((e) => console.log("Error al guardar en Supabase (ignorado):", e))
      } catch (supabaseError) {
        // Ignorar errores de Supabase, ya que estamos usando almacenamiento local
        console.log("Error al guardar en Supabase (ignorado):", supabaseError)
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
          tipo_cuestionario: "reducido",
        }

        // Guardar usando nuestra función
        guardarRespuesta(resultadosBasicos)

        // También guardar en sessionStorage para compatibilidad
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

  // Renderizar el paso actual del formulario
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Podés completar esta información si querés, pero no es obligatoria.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="edad">
                  Edad <span className="text-gray-500 text-sm">(opcional)</span>
                </Label>
                <Input
                  id="edad"
                  name="edad"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.edad}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Género <span className="text-gray-500 text-sm">(opcional)</span>
                </Label>
                <RadioGroup value={formData.genero} onValueChange={(value) => handleRadioChange("genero", value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="femenino" id="genero-femenino" />
                    <Label htmlFor="genero-femenino">Femenino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="masculino" id="genero-masculino" />
                    <Label htmlFor="genero-masculino">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="otro" id="genero-otro" />
                    <Label htmlFor="genero-otro">Otro</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pais">
                    País <span className="text-gray-500 text-sm">(opcional)</span>
                  </Label>
                  <Combobox
                    options={paisOptions}
                    value={formData.pais}
                    onChange={(value) => handleComboboxChange("pais", value)}
                    placeholder="Seleccionar país"
                    emptyMessage="No se encontraron países."
                  />
                </div>

                <div>
                  <Label htmlFor="provincia">
                    Provincia (si estás en Argentina) <span className="text-gray-500 text-sm">(opcional)</span>
                  </Label>
                  <Combobox
                    options={provinciaOptions}
                    value={formData.provincia}
                    onChange={(value) => handleComboboxChange("provincia", value)}
                    placeholder="Seleccionar provincia"
                    emptyMessage="No se encontraron provincias."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Días Laborables</CardTitle>
              <CardDescription>
                Por favor responde las siguientes preguntas sobre tus hábitos de sueño en días laborables.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="horaAcostarseLaboral" className="flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    ¿A qué hora te acuestas en días laborables?
                  </Label>
                  <Input
                    id="horaAcostarseLaboral"
                    name="horaAcostarseLaboral"
                    type="time"
                    value={formData.horaAcostarseLaboral}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="minutosParaDormirseLaboral">
                    ¿Cuántos minutos tardas en dormirte? <span className="text-gray-500 text-sm">(opcional)</span>
                  </Label>
                  <Input
                    id="minutosParaDormirseLaboral"
                    name="minutosParaDormirseLaboral"
                    type="number"
                    min="0"
                    value={formData.minutosParaDormirseLaboral}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="horaDespertarLaboral" className="flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    ¿A qué hora te despiertas en días laborables?
                  </Label>
                  <Input
                    id="horaDespertarLaboral"
                    name="horaDespertarLaboral"
                    type="time"
                    value={formData.horaDespertarLaboral}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="minutosPararLevantarseLaboral">
                    ¿Cuántos minutos tardas en levantarte? <span className="text-gray-500 text-sm">(opcional)</span>
                  </Label>
                  <Input
                    id="minutosPararLevantarseLaboral"
                    name="minutosPararLevantarseLaboral"
                    type="number"
                    min="0"
                    value={formData.minutosPararLevantarseLaboral}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    ¿Usas alarma para despertarte? <span className="text-gray-500 text-sm">(opcional)</span>
                  </Label>
                  <RadioGroup
                    value={formData.usaAlarmaLaboral}
                    onValueChange={(value) => handleRadioChange("usaAlarmaLaboral", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="alarma-lab-si" />
                      <Label htmlFor="alarma-lab-si">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="alarma-lab-no" />
                      <Label htmlFor="alarma-lab-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.usaAlarmaLaboral === "true" && (
                  <div className="space-y-2">
                    <Label>
                      ¿Te despiertas antes de que suene la alarma?{" "}
                      <span className="text-gray-500 text-sm">(opcional)</span>
                    </Label>
                    <RadioGroup
                      value={formData.despiertaAntesAlarmaLaboral}
                      onValueChange={(value) => handleRadioChange("despiertaAntesAlarmaLaboral", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="antes-alarma-lab-si" />
                        <Label htmlFor="antes-alarma-lab-si">Sí, frecuentemente</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="antes-alarma-lab-no" />
                        <Label htmlFor="antes-alarma-lab-no">No, rara vez</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Días Libres</CardTitle>
              <CardDescription>
                Por favor responde las siguientes preguntas sobre tus hábitos de sueño en días libres (fines de semana o
                días sin obligaciones).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="horaAcostarseLibre" className="flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    ¿A qué hora te acuestas en días libres?
                  </Label>
                  <Input
                    id="horaAcostarseLibre"
                    name="horaAcostarseLibre"
                    type="time"
                    value={formData.horaAcostarseLibre}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="minutosParaDormirseLibre">
                    ¿Cuántos minutos tardas en dormirte? <span className="text-gray-500 text-sm">(opcional)</span>
                  </Label>
                  <Input
                    id="minutosParaDormirseLibre"
                    name="minutosParaDormirseLibre"
                    type="number"
                    min="0"
                    value={formData.minutosParaDormirseLibre}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="horaDespertarLibre" className="flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    ¿A qué hora te despiertas en días libres?
                  </Label>
                  <Input
                    id="horaDespertarLibre"
                    name="horaDespertarLibre"
                    type="time"
                    value={formData.horaDespertarLibre}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="minutosPararLevantarseLibre">
                    ¿Cuántos minutos tardas en levantarte? <span className="text-gray-500 text-sm">(opcional)</span>
                  </Label>
                  <Input
                    id="minutosPararLevantarseLibre"
                    name="minutosPararLevantarseLibre"
                    type="number"
                    min="0"
                    value={formData.minutosPararLevantarseLibre}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    ¿Usas alarma para despertarte en días libres?{" "}
                    <span className="text-gray-500 text-sm">(opcional)</span>
                  </Label>
                  <RadioGroup
                    value={formData.usaAlarmaLibre}
                    onValueChange={(value) => handleRadioChange("usaAlarmaLibre", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="alarma-lib-si" />
                      <Label htmlFor="alarma-lib-si">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="alarma-lib-no" />
                      <Label htmlFor="alarma-lib-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>
                    ¿Hay razones por las que no puedes elegir libremente tu horario de sueño en días libres?{" "}
                    <span className="text-gray-500 text-sm">(opcional)</span>
                  </Label>
                  <RadioGroup
                    value={formData.razonesNoElegirSueno}
                    onValueChange={(value) => handleRadioChange("razonesNoElegirSueno", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="razones-si" />
                      <Label htmlFor="razones-si">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="razones-no" />
                      <Label htmlFor="razones-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.razonesNoElegirSueno === "true" && (
                  <div className="space-y-2">
                    <Label>
                      ¿Qué tipo de razones? <span className="text-gray-500 text-sm">(opcional)</span>
                    </Label>
                    <RadioGroup
                      value={formData.tipoRazonesNoElegirSueno}
                      onValueChange={(value) => handleRadioChange("tipoRazonesNoElegirSueno", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hijos" id="razones-hijos" />
                        <Label htmlFor="razones-hijos">Hijos/mascotas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hobbies" id="razones-hobbies" />
                        <Label htmlFor="razones-hobbies">Hobbies/actividades</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="otras" id="razones-otras" />
                        <Label htmlFor="razones-otras">Otras</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de sueño</CardTitle>
              <CardDescription>
                Por favor responde las siguientes preguntas sobre tus preferencias de sueño.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    ¿Prefieres dormir en una habitación completamente oscura?{" "}
                    <span className="text-gray-500 text-sm">(opcional)</span>
                  </Label>
                  <RadioGroup
                    value={formData.prefiereOscuridadTotal}
                    onValueChange={(value) => handleRadioChange("prefiereOscuridadTotal", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="oscuridad-si" />
                      <Label htmlFor="oscuridad-si">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="oscuridad-no" />
                      <Label htmlFor="oscuridad-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>
                    ¿Te despiertas más fácilmente cuando la luz de la mañana entra en tu habitación?{" "}
                    <span className="text-gray-500 text-sm">(opcional)</span>
                  </Label>
                  <RadioGroup
                    value={formData.despiertaMejorConLuz}
                    onValueChange={(value) => handleRadioChange("despiertaMejorConLuz", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="luz-si" />
                      <Label htmlFor="luz-si">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="luz-no" />
                      <Label htmlFor="luz-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>
                    ¿Qué actividades realizas antes de dormir? <span className="text-gray-500 text-sm">(opcional)</span>
                  </Label>
                  <div className="space-y-2">
                    {["leer", "pantallas", "musica", "otras"].map((actividad) => (
                      <div key={actividad} className="flex items-center space-x-2">
                        <Checkbox
                          id={`act-${actividad}`}
                          checked={formData.actividadesAntesDormir.includes(actividad)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData((prev) => ({
                                ...prev,
                                actividadesAntesDormir: [...prev.actividadesAntesDormir, actividad],
                              }))
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                actividadesAntesDormir: prev.actividadesAntesDormir.filter((a) => a !== actividad),
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={`act-${actividad}`}>
                          {actividad === "leer"
                            ? "Leer"
                            : actividad === "pantallas"
                              ? "Usar pantallas (celular, TV, computadora)"
                              : actividad === "musica"
                                ? "Escuchar música"
                                : "Otras actividades"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {formData.actividadesAntesDormir.length > 0 && (
                  <div>
                    <Label htmlFor="minutosLecturaAntesDormir">
                      ¿Cuántos minutos dedicas a estas actividades antes de dormir?{" "}
                      <span className="text-gray-500 text-sm">(opcional)</span>
                    </Label>
                    <Input
                      id="minutosLecturaAntesDormir"
                      name="minutosLecturaAntesDormir"
                      type="number"
                      min="0"
                      value={formData.minutosLecturaAntesDormir}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Cuestionario de Cronotipo de Munich (Versión Reducida)</h1>
          <p className="text-muted-foreground mt-2">
            Paso {step} de {totalSteps}
          </p>
          <div className="w-full bg-muted h-2 mt-4 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-8">
            <Tabs defaultValue="cuestionario" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="cuestionario">Cuestionario</TabsTrigger>
              </TabsList>
              <TabsContent value="cuestionario" className="mt-6">
                {renderStep()}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Anterior
                </Button>
              ) : (
                <Link href="/cuestionario-reducido">
                  <Button variant="outline">Volver</Button>
                </Link>
              )}

              {step < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Siguiente
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Ver Resultados"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
