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
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  // Datos demográficos
  edad: z.coerce.number().min(1, "Edad inválida").max(120, "Edad inválida").optional().nullable(),
  genero: z.enum(["femenino", "masculino"]).optional().nullable(),
  provincia: z.string().optional().nullable(),
  pais: z.string().optional().nullable(),

  // Días laborables
  horaAcostarseLaboral: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  horaPreparadoDormirLaboral: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  minutosParaDormirseLaboral: z.coerce.number().min(0),
  horaDespertarLaboral: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  minutosPararLevantarseLaboral: z.coerce.number().min(0),
  usaAlarmaLaboral: z.boolean(),
  despiertaAntesAlarmaLaboral: z.boolean().optional().nullable(),

  // Días libres
  horaAcostarseLibre: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  horaPreparadoDormirLibre: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  minutosParaDormirseLibre: z.coerce.number().min(0),
  horaDespertarLibre: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  minutosPararLevantarseLibre: z.coerce.number().min(0),
  usaAlarmaLibre: z.boolean(),
  razonesNoElegirSueno: z.boolean(),
  razonesNoElegirSuenoTipos: z.array(z.string()).optional(),
  razonesNoElegirSuenoOtros: z.string().optional(),

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

export default function CuestionarioReducidoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      edad: null,
      genero: null,
      provincia: null,
      pais: null,

      horaAcostarseLaboral: "",
      horaPreparadoDormirLaboral: "",
      minutosParaDormirseLaboral: 0,
      horaDespertarLaboral: "",
      minutosPararLevantarseLaboral: 0,
      usaAlarmaLaboral: false,
      despiertaAntesAlarmaLaboral: null,

      horaAcostarseLibre: "",
      horaPreparadoDormirLibre: "",
      minutosParaDormirseLibre: 0,
      horaDespertarLibre: "",
      minutosPararLevantarseLibre: 0,
      usaAlarmaLibre: false,
      razonesNoElegirSueno: false,
      razonesNoElegirSuenoTipos: [],
      razonesNoElegirSuenoOtros: "",

      actividadesAntesDormir: [],
      minutosLecturaAntesDormir: 0,
      minutosMaximoLectura: 0,
      prefiereOscuridadTotal: false,
      despiertaMejorConLuz: false,

      horasAireLibreDiasLaborales: 0,
      minutosAireLibreDiasLaborales: 0,
      horasAireLibreDiasLibres: 0,
      minutosAireLibreDiasLibres: 0,
    },
  })

  // Observar cambios en usaAlarmaLaboral para resetear despiertaAntesAlarmaLaboral cuando sea necesario
  const usaAlarmaLaboral = form.watch("usaAlarmaLaboral")
  if (!usaAlarmaLaboral && form.getValues("despiertaAntesAlarmaLaboral") !== null) {
    form.setValue("despiertaAntesAlarmaLaboral", null)
  }

  // Observar cambios en razonesNoElegirSueno para resetear tipos cuando sea necesario
  const razonesNoElegirSueno = form.watch("razonesNoElegirSueno")
  if (!razonesNoElegirSueno && form.getValues("razonesNoElegirSuenoTipos").length > 0) {
    form.setValue("razonesNoElegirSuenoTipos", [])
    form.setValue("razonesNoElegirSuenoOtros", "")
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Convertir los datos del formulario reducido al formato esperado por la función calcularResultados
      const datosParaCalculos = {
        // Días laborables
        horaAcostarseLaboral: values.horaAcostarseLaboral,
        minutosParaDormirseLaboral: values.minutosParaDormirseLaboral,
        horaDespertarLaboral: values.horaDespertarLaboral,
        minutosPararDespertarLaboral: values.minutosPararLevantarseLaboral,
        despertarAntesAlarmaLaboral: values.usaAlarmaLaboral ? values.despiertaAntesAlarmaLaboral : null,
        horaCompletamenteDespiertaLaboral: values.horaDespertarLaboral, // Aproximación
        horaEnergiaBajaLaboral: "18:00", // Valor por defecto
        siestaDiaLaboral: false,
        duracionSiestaDiaLaboral: null,

        // Días libres
        horaAcostarseLibre: values.horaAcostarseLibre,
        minutosParaDormirseLibre: values.minutosParaDormirseLibre,
        horaDespertarLibre: values.horaDespertarLibre,
        minutosPararDespertarLibre: values.minutosPararLevantarseLibre,
        horaSuenoDespetarLibre: values.horaDespertarLibre, // Aproximación
        intentaDormirMasLibre: false, // Valor por defecto
        minutosExtraSuenoLibre: null,
        horaCompletamenteDespiertaLibre: values.horaDespertarLibre, // Aproximación
        horaEnergiaBajaLibre: "18:00", // Valor por defecto
        siestaDiaLibre: false,
        duracionSiestaDiaLibre: null,

        // Resto de valores
        ...values,
      }

      // Calcular los resultados
      const resultados = calcularResultados(datosParaCalculos)

      // Combinar los valores del formulario con los resultados calculados
      const datosCompletos = {
        ...datosParaCalculos,
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
          <h1 className="text-3xl font-bold">Cuestionario de Cronotipo de Munich (Versión Reducida)</h1>
          <p className="text-muted-foreground mt-2">Por favor completá este cuestionario para evaluar tu cronotipo</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Datos demográficos */}
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

            {/* Días laborables */}
            <Card>
              <CardHeader>
                <CardTitle>Días laborables</CardTitle>
                <CardDescription>
                  Por favor respondé las siguientes preguntas sobre tus hábitos de sueño en días laborables.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="horaAcostarseLaboral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Me acuesto a las... (formato HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <p className="text-sm text-muted-foreground">
                  Nota: algunas personas permanecen despiertas por un tiempo cuando están en la cama!
                </p>

                <FormField
                  control={form.control}
                  name="horaPreparadoDormirLaboral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Me preparo para dormir a las... (formato HH:MM)</FormLabel>
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
                      <FormLabel>Necesito... minutos para quedarme dormido/a</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horaDespertarLaboral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Me despierto a las... (formato HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minutosPararLevantarseLaboral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Después de... minutos me levanto</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usaAlarmaLaboral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uso un despertador en días laborables:</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          value={field.value ? "true" : "false"}
                          className="flex space-x-8"
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

                {usaAlarmaLaboral && (
                  <FormField
                    control={form.control}
                    name="despiertaAntesAlarmaLaboral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Si "Sí": Regularmente me despierto ANTES de que suene la alarma:</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "true")}
                            value={field.value === null ? "" : field.value ? "true" : "false"}
                            className="flex space-x-8"
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
                )}
              </CardContent>
            </Card>

            {/* Días libres */}
            <Card>
              <CardHeader>
                <CardTitle>Días libres</CardTitle>
                <CardDescription>
                  Por favor respondé las siguientes preguntas sobre tus hábitos de sueño en días libres.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="horaAcostarseLibre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Me acuesto a las... (formato HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <p className="text-sm text-muted-foreground">
                  Nota: algunas personas permanecen despiertas por un tiempo cuando están en la cama!
                </p>

                <FormField
                  control={form.control}
                  name="horaPreparadoDormirLibre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Me preparo para dormir a las... (formato HH:MM)</FormLabel>
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
                      <FormLabel>Necesito... minutos para quedarme dormido/a</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
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
                      <FormLabel>Me despierto a las... (formato HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minutosPararLevantarseLibre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Después de... minutos me levanto</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usaAlarmaLibre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mi hora de despertar (en días libres) se debe al uso de un despertador:</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          value={field.value ? "true" : "false"}
                          className="flex space-x-8"
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
                  name="razonesNoElegirSueno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Hay razones particulares por las que <strong>no puedo</strong> elegir libremente mis horarios de
                        sueño en días libres:
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          value={field.value ? "true" : "false"}
                          className="flex space-x-8"
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

                {razonesNoElegirSueno && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="razonesNoElegirSuenoTipos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Si "Sí":</FormLabel>
                          <FormControl>
                            <div className="flex flex-wrap gap-4">
                              {[
                                { id: "ninos", label: "Niño(s)/mascota(s)" },
                                { id: "hobbies", label: "Hobbies" },
                                { id: "otros", label: "Otros" },
                              ].map((item) => (
                                <div key={item.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={item.id}
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...(field.value || []), item.id]
                                        : (field.value || []).filter((val) => val !== item.id)
                                      field.onChange(updatedValue)
                                    }}
                                  />
                                  <label
                                    htmlFor={item.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {item.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("razonesNoElegirSuenoTipos")?.includes("otros") && (
                      <FormField
                        control={form.control}
                        name="razonesNoElegirSuenoOtros"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Por ejemplo:</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Especificar otras razones" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hábitos antes de dormir y preferencias */}
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
                                <Checkbox
                                  id={actividad}
                                  checked={field.value?.includes(actividad)}
                                  onCheckedChange={(checked) => {
                                    const updatedActividades = checked
                                      ? [...(field.value || []), actividad]
                                      : (field.value || []).filter((item) => item !== actividad)
                                    field.onChange(updatedActividades)
                                  }}
                                />
                                <label
                                  htmlFor={actividad}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
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
                          value={field.value ? "true" : "false"}
                          className="flex space-x-8"
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
                          value={field.value ? "true" : "false"}
                          className="flex space-x-8"
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

            {/* Tiempo al aire libre */}
            <Card>
              <CardHeader>
                <CardTitle>Tiempo al aire libre</CardTitle>
                <CardDescription>
                  ¿Cuánto tiempo al día pasás en promedio al aire libre (realmente al aire libre) expuesto a la luz del
                  día?
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

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Ver Resultados"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
