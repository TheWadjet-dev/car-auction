"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { addCar } from "@/lib/api/cars"

// Esquema de validación para el formulario
const formSchema = z.object({
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
  año: z.string().refine((val) => {
    const year = Number.parseInt(val)
    return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
  }, "Año inválido"),
  precioInicial: z.string().refine((val) => {
    const price = Number.parseFloat(val)
    return !isNaN(price) && price > 0
  }, "Precio inicial inválido"),
  ownerWallet: z.string().min(1, "La dirección de wallet es requerida"),
  imagen: z.string().url("URL de imagen inválida").optional(),
})

export default function AddCarForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Inicializar el formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marca: "",
      modelo: "",
      año: "",
      precioInicial: "",
      ownerWallet: "",
      imagen: "",
    },
  })

  // Manejar el envío del formulario
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      // Preparar los datos del vehículo
      const carData = {
        marca: values.marca,
        modelo: values.modelo,
        año: Number.parseInt(values.año),
        precioInicial: Number.parseFloat(values.precioInicial),
        ownerWallet: values.ownerWallet,
        imagen: values.imagen || "/placeholder.svg?height=300&width=500",
      }

      // Añadir el vehículo
      await addCar(carData)

      toast({
        title: "Vehículo añadido con éxito",
        description: "Tu vehículo ha sido añadido a la plataforma.",
      })

      // Redirigir a la página principal
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error adding car:", error)
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
                name="marca"
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
                name="modelo"
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
                name="año"
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
                name="precioInicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Inicial</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 10000" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ownerWallet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección de Wallet</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 0xABC123..." {...field} />
                  </FormControl>
                  <FormDescription>La dirección de wallet del propietario del vehículo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imagen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Imagen (Opcional)</FormLabel>
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
