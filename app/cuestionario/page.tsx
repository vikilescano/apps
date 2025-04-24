"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { calcularResultados } from "@/lib/cronotipo-utils"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Combobox } from "@/components/ui/combobox"
import { provinciasArgentina, paises } from "@/lib/location-data"

const formSchema = z.object({
  // Datos demográficos
  edad: z.coerce.number().min(1, "Edad inválida").max(120, "Edad inválida").optional().nullable(),
  genero: z.enum(["femenino", "masculino"]).optional().nullable(),
  provincia: z.string().optional().nullable(),
  pais: z.string().optional().nullable(),

  // Días laborables
  horaDespertarLaboral: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  minutosPararDespertarLaboral: z.coerce.number().min(0),
  despertarAntesAlarmaLaboral: z.enum(["true", "false", "null"]).optional(),
  horaCompletamenteDespiertaLaboral: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  horaEnergiaBajaLaboral: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  horaAcostarseLaboral: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  minutosParaDormirseLaboral: z.coerce.number().min(0),
  siestaDiaLaboral: z.boolean(),
  duracionSiestaDiaLaboral: z.coerce.number().min(0).optional().nullable(),

  // Días libres
  horaSuenoDespetarLibre: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  horaDespertarLibre: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  intentaDormirMasLibre: z.enum(["true", "false", "null"]).optional(),
  minutosExtraSuenoLibre: z.coerce.number().min(0).optional().nullable(),
  minutosPararDespertarLibre: z.coerce.number().min(0),
  horaCompletamenteDespiertaLibre: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  horaEnergiaBajaLibre: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  horaAcostarseLibre: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  minutosParaDormirseLibre: z.coerce.number().min(0),
  siestaDiaLibre: z.boolean(),
  duracionSiestaDiaLibre: z.coerce.number().min(0).optional().nullable(),

  // Hábitos antes de dormir y preferencias
  actividadesAntesDormir: z.array(z.string()).optional().default([]),
  minutosLecturaAntesDormir: z.coerce.number().min(0),

  minutosMaximoLectura: z.coerce.number().min(0),
  prefiereOscuridadTotal: z.boolean(),
  despiertaMejorConLuz: z.boolean(),

  // Tiempo al aire libre
  horasAireLibreDiasLaborales: z.coerce.number().min(0),
  minutosAireLibreDiasLaborales: z.coerce.number().min(0).max(59),
  horasAireLibreDiasLibres: z.coerce.number().min(0),
  minutosAireLibreDiasLibres: z.coerce.number().min(0).max(59),
})

export default function CuestionarioPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 5
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      edad: null,
      genero: null,
      provincia: null,
      pais: null,

      horaDespertarLaboral: "",
      minutosPararDespertarLaboral: 0,
      despertarAntesAlarmaLaboral: undefined, // Cambiado a undefined para que no haya selección por defecto
      horaCompletamenteDespiertaLaboral: "",
      horaEnergiaBajaLaboral: "",
      horaAcostarseLaboral: "",
      minutosParaDormirseLaboral: 0,
      siestaDiaLaboral: null,
      duracionSiestaDiaLaboral: null,

      horaSuenoDespetarLibre: "",
      horaDespertarLibre: "",
      intentaDormirMasLibre: undefined, // Cambiado a undefined para que no haya selección por defecto
      minutosExtraSuenoLibre: null,
      minutosPararDespertarLibre: 0,
      horaCompletamenteDespiertaLibre: "",
      horaEnergiaBajaLibre: "",
      horaAcostarseLibre: "",
      minutosParaDormirseLibre: 0,
      siestaDiaLibre: null,
      duracionSiestaDiaLibre: null,

      actividadesAntesDormir: [],
      minutosLecturaAntesDormir: 0,
      minutosMaximoLectura: 0,
      prefiereOscuridadTotal: null, // Cambiado de false a null
      despiertaMejorConLuz: null, // Cambiado de false a null

      horasAireLibreDiasLaborales: 0,
      minutosAireLibreDiasLaborales: 0,
      horasAireLibreDiasLibres: 0,
      minutosAireLibreDiasLibres: 0,
    },
  })

  const nextStep = async () => {
    // Definir los campos a validar según el paso actual
    let fieldsToValidate: string[] = []

    switch (step) {
      case 1:
        // Paso 1: Datos demográficos (opcionales)
        setStep(step + 1)
        window.scrollTo(0, 0)
        return
      case 2:
        fieldsToValidate = [
          "horaDespertarLaboral",
          "minutosPararDespertarLaboral",
          "horaCompletamenteDespiertaLaboral",
          "horaEnergiaBajaLaboral",
          "horaAcostarseLaboral",
          "minutosParaDormirseLaboral",
          "siestaDiaLaboral",
        ]
        // Asegurarse de que despertarAntesAlarmaLaboral tenga un valor
        if (!form.getValues("despertarAntesAlarmaLaboral")) {
          form.setError("despertarAntesAlarmaLaboral", {
            type: "manual",
            message: "Por favor selecciona una opción",
          })
          toast({
            title: "Por favor revisá los campos",
            description: "Hay errores en el formulario que deben ser corregidos.",
            variant: "destructive",
          })
          return
        }
        break
      case 3:
        fieldsToValidate = [
          "horaSuenoDespetarLibre",
          "horaDespertarLibre",
          "minutosPararDespertarLibre",
          "horaCompletamenteDespiertaLibre",
          "horaEnergiaBajaLibre",
          "horaAcostarseLibre",
          "minutosParaDormirseLibre",
          "siestaDiaLibre",
        ]
        // Asegurarse de que intentaDormirMasLibre tenga un valor
        if (!form.getValues("intentaDormirMasLibre")) {
          form.setError("intentaDormirMasLibre", {
            type: "manual",
            message: "Por favor selecciona una opción",
          })
          toast({
            title: "Por favor revisá los campos",
            description: "Hay errores en el formulario que deben ser corregidos.",
            variant: "destructive",
          })
          return
        }
        break
      case 4:
        fieldsToValidate = [
          "actividadesAntesDormir",
          "minutosLecturaAntesDormir",
          "minutosMaximoLectura",
          "prefiereOscuridadTotal",
          "despiertaMejorConLuz",
        ]
        break
      case 5:
        fieldsToValidate = [
          "horasAireLibreDiasLaborales",
          "minutosAireLibreDiasLaborales",
          "horasAireLibreDiasLibres",
          "minutosAireLibreDiasLibres",
        ]
        break
    }

    // Validar los campos
    const isValid = await form.trigger(fieldsToValidate as any)

    if (isValid) {
      if (step < totalSteps) {
        setStep(step + 1)
        window.scrollTo(0, 0)
      }
    } else {
      toast({
        title: "Por favor revisá los campos",
        description: "Hay errores en el formulario que deben ser corregidos.",
        variant: "destructive",
      })
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Convertir los valores de string a boolean o null
      const processedValues = {
        ...values,
        despertarAntesAlarmaLaboral:
          values.despertarAntesAlarmaLaboral === "true"
            ? true
            : values.despertarAntesAlarmaLaboral === "false"
              ? false
              : null,
        intentaDormirMasLibre:
          values.intentaDormirMasLibre === "true" ? true : values.intentaDormirMasLibre === "false" ? false : null,
      }

      // Calcular los resultados
      const resultados = calcularResultados(processedValues)

      // Combinar los valores del formulario con los resultados calculados
      const datosCompletos = {
        ...processedValues,
        ...resultados,
      }

      // Enviar los datos al servidor
      const response = await fetch("/api/cuestionario", {
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

  // Convertir las provincias y países a formato de opciones para el combobox
  const provinciaOptions = provinciasArgentina.map((provincia) => ({
    value: provincia,
    label: provincia,
  }))

  const paisOptions = paises.map((pais) => ({
    value: pais,
    label: pais,
  }))

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Cuestionario de Cronotipo de Munich</h1>
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal (opcional)</CardTitle>
                  <CardDescription>Podés completar esta información si querés, pero no es obligatoria.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="edad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edad</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="genero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="femenino" />
                              </FormControl>
                              <FormLabel className="font-normal">Femenino</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="masculino" />
                              </FormControl>
                              <FormLabel className="font-normal">Masculino</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="provincia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provincia</FormLabel>
                          <FormControl>
                            <Combobox
                              options={provinciaOptions}
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder="Seleccionar provincia"
                              emptyMessage="No se encontraron provincias."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pais"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Combobox
                              options={paisOptions}
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder="Seleccionar país"
                              emptyMessage="No se encontraron países."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>En días laborables...</CardTitle>
                  <CardDescription>
                    Por favor respondé las siguientes preguntas sobre tus hábitos de sueño en días laborables.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="horaDespertarLaboral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tengo que despertarme a las... (formato am/pm, ej: 07:00 am para 7 de la mañana, 12:00 pm para
                          12 del mediodía)
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minutosPararDespertarLaboral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Necesito... minutos para levantarme</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="despertarAntesAlarmaLaboral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regularmente me despierto...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="true" />
                              </FormControl>
                              <FormLabel className="font-normal">Antes de la alarma</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="false" />
                              </FormControl>
                              <FormLabel className="font-normal">Con la alarma</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="null" />
                              </FormControl>
                              <FormLabel className="font-normal">No uso alarma</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horaCompletamenteDespiertaLaboral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          A partir de las... estoy completamente despierto/a (formato am/pm, ej: 07:00 am para 7 de la
                          mañana, 12:00 pm para 12 del mediodía)
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horaEnergiaBajaLaboral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Alrededor de las... tengo una bajada de energía (formato am/pm, ej: 03:00 pm para 3 de la
                          tarde, 06:00 pm para 6 de la tarde)
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horaAcostarseLaboral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          En las noches antes de días laborables, me acuesto a las... (formato am/pm, ej: 11:00 pm para
                          11 de la noche, 12:00 am para 12 de la madrugada)
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minutosParaDormirseLaboral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>...y entonces me toma... minutos quedarme dormido/a</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="siestaDiaLaboral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Si tengo la oportunidad, me gusta tomar una siesta...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            value={field.value === null ? "" : field.value ? "true" : "false"}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="true" />
                              </FormControl>
                              <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="false" />
                              </FormControl>
                              <FormLabel className="font-normal">No, me sentiría terrible después</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("siestaDiaLaboral") && (
                    <FormField
                      control={form.control}
                      name="duracionSiestaDiaLaboral"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entonces duermo durante... minutos</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    En días libres (por favor juzgue solo días libres normales, es decir, sin fiestas, etc.)...
                  </CardTitle>
                  <CardDescription>
                    Por favor respondé las siguientes preguntas sobre tus hábitos de sueño en días libres.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="horaSuenoDespetarLibre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Mi sueño sería dormir hasta las... (formato am/pm, ej: 09:00 am para 9 de la mañana, 12:00 pm
                          para 12 del mediodía)
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horaDespertarLibre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Normalmente me despierto a las... (formato am/pm, ej: 09:00 am para 9 de la mañana, 12:00 pm
                          para 12 del mediodía)
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="intentaDormirMasLibre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Si me despierto a la hora normal de la alarma (día laborable), intento volver a dormirme...
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="true" />
                              </FormControl>
                              <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="false" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="null" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                No aplica (no uso alarma/nunca me despierto en ese horario)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("intentaDormirMasLibre") === "true" && (
                    <FormField
                      control={form.control}
                      name="minutosExtraSuenoLibre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Si vuelvo a dormirme, duermo otros... minutos</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="minutosPararDespertarLibre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Necesito... minutos para levantarme</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horaCompletamenteDespiertaLibre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          A partir de las... estoy completamente despierto/a (formato am/pm, ej: 09:00 am para 9 de la
                          mañana, 12:00 pm para 12 del mediodía)
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horaEnergiaBajaLibre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Alrededor de las... tengo una bajada de energía (formato am/pm, ej: 03:00 pm para 3 de la
                          tarde, 06:00 pm para 6 de la tarde)
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horaAcostarseLibre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          En las noches antes de días libres, me acuesto a las... (formato am/pm, ej: 11:00 pm para 11
                          de la noche, 12:00 am para 12 de la madrugada)
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minutosParaDormirseLibre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>...y entonces me toma... minutos quedarme dormido/a</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="siestaDiaLibre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Si tengo la oportunidad, me gusta tomar una siesta...</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            value={field.value === null ? "" : field.value ? "true" : "false"}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="true" />
                              </FormControl>
                              <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="false" />
                              </FormControl>
                              <FormLabel className="font-normal">No, me sentiría terrible después</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("siestaDiaLibre") && (
                    <FormField
                      control={form.control}
                      name="duracionSiestaDiaLibre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entonces duermo durante... minutos</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Hábitos de lectura y preferencias de sueño</CardTitle>
                  <CardDescription>
                    Por favor respondé las siguientes preguntas sobre tus hábitos de lectura y preferencias de sueño.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="actividadesAntesDormir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Una vez que estoy en la cama, me gustaría... (podés seleccionar varias opciones)
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2">
                            {["leer", "mirar una serie/película", "usar redes sociales", "otras", "ninguna"].map(
                              (actividad) => (
                                <div key={actividad} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={actividad}
                                    checked={field.value?.includes(actividad)}
                                    onChange={(e) => {
                                      const updatedActividades = e.target.checked
                                        ? [...field.value, actividad]
                                        : field.value.filter((item: string) => item !== actividad)
                                      field.onChange(updatedActividades)
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <label htmlFor={actividad} className="text-sm font-medium">
                                    {actividad}
                                  </label>
                                </div>
                              ),
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minutosLecturaAntesDormir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durante... minutos</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minutosMaximoLectura"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>...pero generalmente me quedo dormido/a después de no más de... minutos</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prefiereOscuridadTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prefiero dormir en una habitación completamente oscura</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            value={field.value === null ? "" : field.value ? "true" : "false"}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="true" />
                              </FormControl>
                              <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="false" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="despiertaMejorConLuz"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Me despierto más fácilmente cuando la luz de la mañana entra en mi habitación
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            value={field.value === null ? "" : field.value ? "true" : "false"}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="true" />
                              </FormControl>
                              <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="false" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {step === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tiempo al aire libre</CardTitle>
                  <CardDescription>
                    ¿Cuánto tiempo al día pasás en promedio al aire libre (realmente al aire libre) expuesto a la luz
                    del día?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">En días laborables:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="horasAireLibreDiasLaborales"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horas</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="minutosAireLibreDiasLaborales"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minutos</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">En días libres:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="horasAireLibreDiasLibres"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horas</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="minutosAireLibreDiasLibres"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minutos</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Ver Resultados"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
