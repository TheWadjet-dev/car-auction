import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCarById } from "@/lib/api/cars"

export default async function CarDetailPage({ params }: { params: { id: string } }) {
  const car = await getCarById(params.id)

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Vehículo no encontrado</h1>
        <p className="text-muted-foreground mb-6">El vehículo que estás buscando no existe o ha sido eliminado.</p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    )
  }

  // Preparar los datos del vehículo para mostrar
  const specs = {
    año: car.año,
    marca: car.marca,
    modelo: car.modelo,
    precioInicial: `$${car.precioInicial.toLocaleString()}`,
    propietario: car.ownerWallet,
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-14 px-4">
          <Link href="/" className="mr-auto">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver</span>
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Detalles del Vehículo</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1">
        <div className="relative w-full h-64">
          <Image
            src={car.imagen || "/placeholder.svg?height=300&width=500"}
            alt={`${car.año} ${car.marca} ${car.modelo}`}
            fill
            className="object-cover"
          />
        </div>

        <div className="container px-4 py-4">
          <h1 className="text-2xl font-bold mb-2">
            {car.año} {car.marca} {car.modelo}
          </h1>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Precio Inicial</p>
                  <p className="font-bold text-2xl">${car.precioInicial.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Propietario:</p>
                <p className="font-medium break-all">{car.ownerWallet}</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="specs">
            <TabsList className="grid grid-cols-1 mb-4">
              <TabsTrigger value="specs">Especificaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="specs">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(specs).map(
                  ([key, value]) =>
                    value && (
                      <div key={key} className="py-2 border-b">
                        <p className="text-sm text-muted-foreground capitalize">{key}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ),
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
