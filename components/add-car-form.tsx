"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { addVehicle } from "@/lib/api/vehicles"
import { createAuction } from "@/lib/api/auctions"

// Esquema de validación para el formulario
const formSchema = z.object({
  make: z.string().min(1, "La marca es requerida"),
  model: z.string().min(1, "El modelo es requerido"),
  year: z.string().refine((val) => {
    const year = Number.parseInt(val)
    return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
  }, "Año inválido"),
  mileage: z.string().refine((val) => {
    const mileage = Number.parseInt(val)
    return !isNaN(mileage) && mileage >= 0
  }, "Kilometraje inválido"),
  engine: z.string().optional(),
  transmission: z.string().optional(),
  exterior_color: z.string().optional(),
  interior_color: z.string().optional(),
  vin: z.string().optional(),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  condition: z.string().optional(),
  start_price: z.string().refine((val) => {
    const price = Number.parseFloat(val)
    return !isNaN(price) && price > 0
  }, "Precio inicial inválido"),
  reserve_price: z.string().optional(),
  auction_duration: z.string().min(1, "La duración de la subasta es requerida"),
  image_url: z.string().url("URL de imagen inválida").optional(),
})

interface AddCarFormProps {
  userId: string
}

export default function AddCarForm({ userId }: AddCarFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Inicializar el formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      mileage: "",
      engine: "",
      transmission: "",
      exterior_color: "",
      interior_color: "",
      vin: "",
      description: "",
      condition: "",
      start_price: "",
      reserve_price: "",
      auction_duration: "7",
      image_url: "",
    },
  })

  // Manejar el envío del formulario
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      // Preparar los datos del vehículo
      const vehicleData = {
        seller_id: userId,
        make: values.make,
        model: values.model,
        year: Number.parseInt(values.year),
        mileage: Number.parseInt(values.mileage),
        engine: values.engine || null,
        transmission: values.transmission || null,
        exterior_color: values.exterior_color || null,
        interior_color: values.interior_color || null,
        vin: values.vin || null,
        description: values.description,
        condition: values.condition || null,
        features: null,
        documents: null,
      }

      // Añadir el vehículo
      const vehicle = await addVehicle(vehicleData, [
        {
          url: values.image_url || "/placeholder.svg?height=300&width=500",
          is_primary: true,
        },
      ])

      // Calcular las fechas de inicio y fin de la subasta
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + Number.parseInt(values.auction_duration))

      // Preparar los datos de la subasta
      const auctionData = {
        vehicle_id: vehicle.id,
        start_price: Number.parseFloat(values.start_price),
        reserve_price: values.reserve_price ? Number.parseFloat(values.reserve_price) : null,
        min_bid_increment: 100, // Incremento mínimo por defecto
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: "active" as const,
      }

      // Crear la subasta
      await createAuction(auctionData)

      toast({
        title: "Vehículo añadido con éxito",
        description: "Tu vehículo ha sido añadido y la subasta ha comenzado.",
      })

      // Redirigir a la página principal
      router.push("/")
    } catch (error) {
      console.error("Error adding vehicle:", error)
      toast({
        title: "Error al añadir el vehículo",
        description: error instanceof Error ? error.message : "Ha ocurrido un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Vehículo</CardTitle>
            <CardDescription>Ingresa los detalles básicos de tu vehículo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Corolla" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 2020" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilometraje</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 50000" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="engine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 2.0L 4 cilindros" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transmission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmisión</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Automática">Automática</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="CVT">CVT</SelectItem>
                        <SelectItem value="Semiautomática">Semiautomática</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exterior_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Exterior</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Blanco Perla" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interior_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Interior</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Negro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número VIN</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 1HGCM82633A123456" {...field} />
                  </FormControl>
                  <FormDescription>
                    El número de identificación del vehículo (VIN) es un código único que identifica tu vehículo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condición</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Nuevo">Nuevo</SelectItem>
                      <SelectItem value="Como nuevo">Como nuevo</SelectItem>
                      <SelectItem value="Excelente">Excelente</SelectItem>
                      <SelectItem value="Bueno">Bueno</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Necesita reparaciones">Necesita reparaciones</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe tu vehículo, incluyendo características especiales, historial de mantenimiento, etc."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Imagen</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Ingresa la URL de una imagen de tu vehículo. Si no tienes una, dejaremos una imagen de marcador de
                    posición.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Subasta</CardTitle>
            <CardDescription>Configura los parámetros de la subasta para tu vehículo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Inicial ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 10000" type="number" {...field} />
                    </FormControl>
                    <FormDescription>El precio inicial de la subasta</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reserve_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Reserva ($) (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 15000" type="number" {...field} />
                    </FormControl>
                    <FormDescription>El precio mínimo al que estás dispuesto a vender</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="auction_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración de la Subasta</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 día</SelectItem>
                      <SelectItem value="3">3 días</SelectItem>
                      <SelectItem value="5">5 días</SelectItem>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="14">14 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Cuánto tiempo durará la subasta</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Publicar Vehículo"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
