"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { calcularResultados } from "@/lib/cronotipo-utils"
import { Combobox } from "@/components/ui/combobox"
import { provinciasArgentina, paises } from "@/lib/location-data"
import { Checkbox } from "@/components/ui/checkbox"

export default function CuestionarioReducidoFormularioPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const totalSteps = 4

  // Formulario simplificado con useState
  const [formData, setFormData] = useState({
    // Datos demográficos
    edad: "",
    genero: "",
    provincia: "",
    pais: "",

    // Días laborables
    horaAcostarseLaboral: "",
    horaPreparadoDormirLaboral: "",
    minutosParaDormirseLaboral: "0",
    horaDespertarLaboral: "",
    minutosPararLevantarseLaboral: "0",
    usaAlarmaLaboral: "",
    despiertaAntesAlarmaLaboral: "",

    // Días libres
    horaAcostarseLibre: "",
    horaPreparadoDormirLibre: "",
    minutosParaDormirseLibre: "0",
    horaDespertarLibre: "",
    minutosPararLevantarseLibre: "0",
    usaAlarmaLibre: "",
    razonesNoElegirSueno: "",
    tipoRazonesNoElegirSueno: [],

    // Hábitos y preferencias
    prefiereOscuridadTotal: "",
    despiertaMejorConLuz: "",
    actividadesAntesDormir: [],
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleRadioChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleComboboxChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCheckboxChange = (name, value, checked) => {
    if (Array.isArray(formData[name])) {
      setFormData({
        ...formData,
        [name]: checked ? [...formData[name], value] : formData[name].filter((item) => item !== value),
      })
    } else {
      setFormData({
        ...formData,
        [name]: checked,
      })
    }
  }

  const nextStep = () => {
    // Validación básica antes de avanzar
    let isValid = true
    let errorMessage = ""

    // Validar campos según el paso actual
    if (step === 2) {
      if (!formData.horaAcostarseLaboral) {
        isValid = false
        errorMessage = "Por favor ingresa la hora a la que te acuestas en días laborables"
      } else if (!formData.horaDespertarLaboral) {
        isValid = false
        errorMessage = "Por favor ingresa la hora a la que te despiertas en días laborables"
      } else if (!formData.usaAlarmaLaboral) {
        isValid = false
        errorMessage = "Por favor indica si usas un despertador en días laborables"
      } else if (formData.usaAlarmaLaboral === "true" && !formData.despiertaAntesAlarmaLaboral) {
        isValid = false
        errorMessage = "Por favor indica si te despiertas antes de que suene la alarma"
      }
    } else if (step === 3) {
      if (!formData.horaAcostarseLibre) {
        isValid = false
        errorMessage = "Por favor ingresa la hora a la que te acuestas en días libres"
      } else if (!formData.horaDespertarLibre) {
        isValid = false
        errorMessage = "Por favor ingresa la hora a la que te despiertas en días libres"
      } else if (!formData.usaAlarmaLibre) {
        isValid = false
        errorMessage = "Por favor indica si usas un despertador en días libres"
      } else if (!formData.razonesNoElegirSueno) {
        isValid = false
        errorMessage = "Por favor indica si hay razones por las que no puedes elegir libremente tus horarios de sueño"
      } else if (formData.razonesNoElegirSueno === "true" && formData.tipoRazonesNoElegirSueno.length === 0) {
        isValid = false
        errorMessage =
          "Por favor selecciona al menos una razón por la que no puedes elegir libremente tus horarios de sueño"
      }
    }

    if (!isValid) {
      toast({
        title: "Por favor completa todos los campos",
        description: errorMessage,
        variant: "destructive",
      })
      return
    }

    setStep(step + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validación final antes de enviar
    if (!formData.prefiereOscuridadTotal || !formData.despiertaMejorConLuz) {
      toast({
        title: "Por favor completa todos los campos",
        description: "Debes responder todas las preguntas sobre preferencias de sueño",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Convertir los datos del formulario al formato esperado por calcularResultados
      const datosParaCalculos = {
        horaAcostarseLaboral: formData.horaAcostarseLaboral,
        minutosParaDormirseLaboral: Number.parseInt(formData.minutosParaDormirseLaboral) || 0,
        horaDespertarLaboral: formData.horaDespertarLaboral,
        minutosPararDespertarLaboral: Number.parseInt(formData.minutosPararLevantarseLaboral) || 0,
        despertarAntesAlarmaLaboral:
          formData.usaAlarmaLaboral === "true" ? formData.despiertaAntesAlarmaLaboral === "true" : null,
        horaCompletamenteDespiertaLaboral: formData.horaDespertarLaboral,
        horaEnergiaBajaLaboral: "18:00",
        siestaDiaLaboral: false,
        duracionSiestaDiaLaboral: null,

        horaAcostarseLibre: formData.horaAcostarseLibre,
        minutosParaDormirseLibre: Number.parseInt(formData.minutosParaDormirseLibre) || 0,
        horaDespertarLibre: formData.horaDespertarLibre,
        minutosPararDespertarLibre: Number.parseInt(formData.minutosPararLevantarseLibre) || 0,
        horaSuenoDespetarLibre: formData.horaDespertarLibre,
        intentaDormirMasLibre: false,
        minutosExtraSuenoLibre: null,
        horaCompletamenteDespiertaLibre: formData.horaDespertarLibre,
        horaEnergiaBajaLibre: "18:00",
        siestaDiaLibre: false,
        duracionSiestaDiaLibre: null,
      }

      // Calcular resultados
      const resultados = calcularResultados(datosParaCalculos)

      // Preparar datos para enviar
      const datosCompletos = {
        edad: formData.edad ? Number.parseInt(formData.edad) : null,
        genero: formData.genero || null,
        provincia: formData.provincia || null,
        pais: formData.pais || null,

        horaAcostarseLaboral: formData.horaAcostarseLaboral,
        minutosParaDormirseLaboral: Number.parseInt(formData.minutosParaDormirseLaboral) || 0,
        horaDespertarLaboral: formData.horaDespertarLaboral,
        minutosPararLevantarseLaboral: Number.parseInt(formData.minutosPararLevantarseLaboral) || 0,
        usaAlarmaLaboral: formData.usaAlarmaLaboral === "true",
        despiertaAntesAlarmaLaboral: formData.despiertaAntesAlarmaLaboral === "true",

        horaAcostarseLibre: formData.horaAcostarseLibre,
        minutosParaDormirseLibre: Number.parseInt(formData.minutosParaDormirseLibre) || 0,
        horaDespertarLibre: formData.horaDespertarLibre,
        minutosPararLevantarseLibre: Number.parseInt(formData.minutosPararLevantarseLibre) || 0,
        usaAlarmaLibre: formData.usaAlarmaLibre === "true",
        razonesNoElegirSueno: formData.razonesNoElegirSueno === "true",
        tipoRazonesNoElegirSueno: formData.tipoRazonesNoElegirSueno,

        prefiereOscuridadTotal: formData.prefiereOscuridadTotal === "true",
        despiertaMejorConLuz: formData.despiertaMejorConLuz === "true",

        // Actividades antes de dormir
        actividadesAntesDormir: formData.actividadesAntesDormir,
        minutosLecturaAntesDormir: Number.parseInt(formData.minutosLecturaAntesDormir) || 0,

        horasAireLibreDiasLaborales: Number.parseInt(formData.horasAireLibreDiasLaborales) || 0,
        minutosAireLibreDiasLaborales: Number.parseInt(formData.minutosAireLibreDiasLaborales) || 0,
        horasAireLibreDiasLibres: Number.parseInt(formData.horasAireLibreDiasLibres) || 0,
        minutosAireLibreDiasLibres: Number.parseInt(formData.minutosAireLibreDiasLibres) || 0,

        // Incluir resultados calculados
        ...resultados,
      }

      // Enviar datos al servidor
      const response = await fetch("/api/cuestionario-reducido", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosCompletos),
      })

      if (!response.ok) {
        throw new Error("Error al enviar los datos")
      }

      const data = await response.json()

      // Redirigir a la página de resultados
      router.push(`/resultados/${data.id}`)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al enviar el cuestionario. Por favor, intentalo de nuevo.",
        variant: "destructive",
      })
      setIsSubmitting(false)
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

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Paso 1: Datos demográficos */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Información Personal (opcional)</CardTitle>
                <CardDescription>Podés completar esta información si querés, pero no es obligatoria.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="edad">Edad</Label>
                  <Input id="edad" name="edad" type="number" value={formData.edad} onChange={handleInputChange} />
                </div>

                <div>
                  <Label>Género</Label>
                  <RadioGroup value={formData.genero} onValueChange={(value) => handleRadioChange("genero", value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="femenino" id="femenino" />
                      <Label htmlFor="femenino">Femenino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masculino" id="masculino" />
                      <Label htmlFor="masculino">Masculino</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pais">País</Label>
                    <Combobox
                      options={paisOptions}
                      value={formData.pais}
                      onChange={(value) => handleComboboxChange("pais", value)}
                      placeholder="Seleccionar país"
                      emptyMessage="No se encontraron países."
                    />
                  </div>

                  <div>
                    <Label htmlFor="provincia">Provincia (si estás en Argentina)</Label>
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
          )}

          {/* Paso 2: Días laborables */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Días laborables</CardTitle>
                <CardDescription>
                  Por favor respondé las siguientes preguntas sobre tus hábitos de sueño en días laborables.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="horaAcostarseLaboral">Me acuesto a las...</Label>
                  <Input
                    id="horaAcostarseLaboral"
                    name="horaAcostarseLaboral"
                    type="time"
                    value={formData.horaAcostarseLaboral}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="horaPreparadoDormirLaboral">Me preparo para dormir a las...</Label>
                  <Input
                    id="horaPreparadoDormirLaboral"
                    name="horaPreparadoDormirLaboral"
                    type="time"
                    value={formData.horaPreparadoDormirLaboral}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="minutosParaDormirseLaboral">Necesito... minutos para quedarme dormido/a</Label>
                  <Input
                    id="minutosParaDormirseLaboral"
                    name="minutosParaDormirseLaboral"
                    type="number"
                    value={formData.minutosParaDormirseLaboral}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="horaDespertarLaboral">Me despierto a las...</Label>
                  <Input
                    id="horaDespertarLaboral"
                    name="horaDespertarLaboral"
                    type="time"
                    value={formData.horaDespertarLaboral}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="minutosPararLevantarseLaboral">Después de... minutos me levanto</Label>
                  <Input
                    id="minutosPararLevantarseLaboral"
                    name="minutosPararLevantarseLaboral"
                    type="number"
                    value={formData.minutosPararLevantarseLaboral}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label>Uso un despertador en días laborables:</Label>
                  <RadioGroup
                    value={formData.usaAlarmaLaboral}
                    onValueChange={(value) => handleRadioChange("usaAlarmaLaboral", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="usaAlarmaLaboralSi" />
                      <Label htmlFor="usaAlarmaLaboralSi">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="usaAlarmaLaboralNo" />
                      <Label htmlFor="usaAlarmaLaboralNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.usaAlarmaLaboral === "true" && (
                  <div>
                    <Label>Regularmente me despierto ANTES de que suene la alarma:</Label>
                    <RadioGroup
                      value={formData.despiertaAntesAlarmaLaboral}
                      onValueChange={(value) => handleRadioChange("despiertaAntesAlarmaLaboral", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="despiertaAntesSi" />
                        <Label htmlFor="despiertaAntesSi">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="despiertaAntesNo" />
                        <Label htmlFor="despiertaAntesNo">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Paso 3: Días libres */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Días libres</CardTitle>
                <CardDescription>
                  Por favor respondé las siguientes preguntas sobre tus hábitos de sueño en días libres.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="horaAcostarseLibre">Me acuesto a las...</Label>
                  <Input
                    id="horaAcostarseLibre"
                    name="horaAcostarseLibre"
                    type="time"
                    value={formData.horaAcostarseLibre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="horaPreparadoDormirLibre">Me preparo para dormir a las...</Label>
                  <Input
                    id="horaPreparadoDormirLibre"
                    name="horaPreparadoDormirLibre"
                    type="time"
                    value={formData.horaPreparadoDormirLibre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="minutosParaDormirseLibre">Necesito... minutos para quedarme dormido/a</Label>
                  <Input
                    id="minutosParaDormirseLibre"
                    name="minutosParaDormirseLibre"
                    type="number"
                    value={formData.minutosParaDormirseLibre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="horaDespertarLibre">Me despierto a las...</Label>
                  <Input
                    id="horaDespertarLibre"
                    name="horaDespertarLibre"
                    type="time"
                    value={formData.horaDespertarLibre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="minutosPararLevantarseLibre">Después de... minutos me levanto</Label>
                  <Input
                    id="minutosPararLevantarseLibre"
                    name="minutosPararLevantarseLibre"
                    type="number"
                    value={formData.minutosPararLevantarseLibre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label>Mi hora de despertar (en días libres) se debe al uso de un despertador:</Label>
                  <RadioGroup
                    value={formData.usaAlarmaLibre}
                    onValueChange={(value) => handleRadioChange("usaAlarmaLibre", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="usaAlarmaLibreSi" />
                      <Label htmlFor="usaAlarmaLibreSi">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="usaAlarmaLibreNo" />
                      <Label htmlFor="usaAlarmaLibreNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>
                    Hay razones particulares por las que no puedo elegir libremente mis horarios de sueño en días
                    libres:
                  </Label>
                  <RadioGroup
                    value={formData.razonesNoElegirSueno}
                    onValueChange={(value) => handleRadioChange("razonesNoElegirSueno", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="razonesNoElegirSuenoSi" />
                      <Label htmlFor="razonesNoElegirSuenoSi">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="razonesNoElegirSuenoNo" />
                      <Label htmlFor="razonesNoElegirSuenoNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.razonesNoElegirSueno === "true" && (
                  <div>
                    <Label className="mb-2 block">Selecciona las razones:</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="razon-ninos-mascotas"
                          checked={formData.tipoRazonesNoElegirSueno.includes("ninos_mascotas")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("tipoRazonesNoElegirSueno", "ninos_mascotas", checked)
                          }
                        />
                        <Label htmlFor="razon-ninos-mascotas">Niño(s)/mascota(s)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="razon-hobbies"
                          checked={formData.tipoRazonesNoElegirSueno.includes("hobbies")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("tipoRazonesNoElegirSueno", "hobbies", checked)
                          }
                        />
                        <Label htmlFor="razon-hobbies">Hobbies</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="razon-otros"
                          checked={formData.tipoRazonesNoElegirSueno.includes("otros")}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("tipoRazonesNoElegirSueno", "otros", checked)
                          }
                        />
                        <Label htmlFor="razon-otros">Otros</Label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Paso 4: Hábitos y preferencias + Tiempo al aire libre */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Hábitos y preferencias</CardTitle>
                <CardDescription>
                  Por favor respondé las siguientes preguntas sobre tus hábitos antes de dormir y preferencias.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Prefiero dormir en una habitación completamente oscura</Label>
                  <RadioGroup
                    value={formData.prefiereOscuridadTotal}
                    onValueChange={(value) => handleRadioChange("prefiereOscuridadTotal", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="oscuridadSi" />
                      <Label htmlFor="oscuridadSi">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="oscuridadNo" />
                      <Label htmlFor="oscuridadNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Me despierto más fácilmente cuando la luz de la mañana entra en mi habitación</Label>
                  <RadioGroup
                    value={formData.despiertaMejorConLuz}
                    onValueChange={(value) => handleRadioChange("despiertaMejorConLuz", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="luzSi" />
                      <Label htmlFor="luzSi">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="luzNo" />
                      <Label htmlFor="luzNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Una vez que estoy en la cama, me gustaría... (podés seleccionar varias opciones)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "leer",
                      "mirar una serie/película",
                      "usar redes sociales",
                      "escuchar música",
                      "meditar",
                      "otras",
                      "ninguna",
                    ].map((actividad) => (
                      <div key={actividad} className="flex items-center space-x-2">
                        <Checkbox
                          id={`actividad-${actividad}`}
                          checked={formData.actividadesAntesDormir.includes(actividad)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange("actividadesAntesDormir", actividad, checked)
                          }
                        />
                        <Label htmlFor={`actividad-${actividad}`}>{actividad}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="minutosLecturaAntesDormir">Durante... minutos</Label>
                  <Input
                    id="minutosLecturaAntesDormir"
                    name="minutosLecturaAntesDormir"
                    type="number"
                    value={formData.minutosLecturaAntesDormir}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Tiempo al aire libre</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    ¿Cuánto tiempo al día pasás en promedio al aire libre (realmente al aire libre){" "}
                    <strong>expuesto a la luz del día</strong>?
                  </p>

                  <h4 className="font-medium mb-2">En días laborables:</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="horasAireLibreDiasLaborales">Horas</Label>
                      <Input
                        id="horasAireLibreDiasLaborales"
                        name="horasAireLibreDiasLaborales"
                        type="number"
                        value={formData.horasAireLibreDiasLaborales}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="minutosAireLibreDiasLaborales">Minutos</Label>
                      <Input
                        id="minutosAireLibreDiasLaborales"
                        name="minutosAireLibreDiasLaborales"
                        type="number"
                        value={formData.minutosAireLibreDiasLaborales}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <h4 className="font-medium mb-2">En días libres:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="horasAireLibreDiasLibres">Horas</Label>
                      <Input
                        id="horasAireLibreDiasLibres"
                        name="horasAireLibreDiasLibres"
                        type="number"
                        value={formData.horasAireLibreDiasLibres}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="minutosAireLibreDiasLibres">Minutos</Label>
                      <Input
                        id="minutosAireLibreDiasLibres"
                        name="minutosAireLibreDiasLibres"
                        type="number"
                        value={formData.minutosAireLibreDiasLibres}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Anterior
              </Button>
            ) : (
              <div></div>
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
        </form>
      </div>
    </div>
  )
}
