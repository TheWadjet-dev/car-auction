import Link from "next/link"
import Image from "next/image"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCars } from "@/lib/api/cars"

export default async function HomePage() {
  const cars = await getCars()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-14 px-4">
          <h1 className="text-xl font-bold">AutoMarket</h1>
        </div>
      </header>

      <main className="flex-1 relative">
        <section className="container px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">Vehículos Disponibles</h1>

          {cars.length > 0 ? (
            <div className="grid gap-4">
              {cars.map((car) => (
                <Link key={car.id} href={`/car/${car.id}`} className="block">
                  <div className="bg-white rounded-lg overflow-hidden border shadow-sm">
                    <div className="relative">
                      <div className="relative h-48 w-full">
                        <Image
                          src={car.imagen || "/placeholder.svg?height=200&width=300"}
                          alt={`${car.año} ${car.marca} ${car.modelo}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">
                        {car.año} {car.marca} {car.modelo}
                      </h3>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Precio Inicial</p>
                          <p className="font-medium">${car.precioInicial.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Propietario</p>
                          <p className="font-medium truncate max-w-[150px]">{car.ownerWallet}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No hay vehículos disponibles</p>
              <Button asChild>
                <Link href="/add-car">Añadir un vehículo</Link>
              </Button>
            </div>
          )}
        </section>

        {/* Botón flotante para añadir carro */}
        <Link href="/add-car" className="fixed bottom-6 right-6 z-10">
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Añadir Vehículo</span>
          </Button>
        </Link>
      </main>
    </div>
  )
}
