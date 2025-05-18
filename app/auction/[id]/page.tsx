import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BidForm from "@/components/bid-form"
import { getAuctionById } from "@/lib/api/auctions"
import { formatTimeLeft } from "@/lib/utils"

export default async function AuctionDetailPage({ params }: { params: { id: string } }) {
  const auction = await getAuctionById(params.id)

  if (!auction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Subasta no encontrada</h1>
        <p className="text-muted-foreground mb-6">La subasta que estás buscando no existe o ha sido eliminada.</p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    )
  }

  // Obtener la puja más alta
  const highestBid =
    auction.bids && auction.bids.length > 0
      ? auction.bids.reduce((max, bid) => (bid.amount > max.amount ? bid : max), auction.bids[0])
      : null

  // Precio actual (la puja más alta o el precio inicial)
  const currentPrice = highestBid ? highestBid.amount : auction.start_price

  // Preparar los datos del vehículo para mostrar
  const vehicle = auction.vehicle
  const specs = {
    año: vehicle?.year,
    marca: vehicle?.make,
    modelo: vehicle?.model,
    kilometraje: vehicle?.mileage,
    motor: vehicle?.engine,
    transmisión: vehicle?.transmission,
    colorExterior: vehicle?.exterior_color,
    colorInterior: vehicle?.interior_color,
    vin: vehicle?.vin,
    condición: vehicle?.condition,
  }

  // Información adicional para mostrar
  const garantía = "Garantía del fabricante hasta 2024"
  const documentos = ["Título limpio", "Historial de servicio completo", "Inspección reciente"]
  const condicionesPago = [
    "Depósito del 10% dentro de las 24 horas de ganar la subasta",
    "Pago completo dentro de los 3 días",
    "Métodos de pago aceptados: transferencia bancaria, financiamiento aprobado",
  ]
  const entrega = [
    "Recogida en persona disponible",
    "Envío nacional disponible por €500",
    "El comprador es responsable de los impuestos y tarifas de registro",
  ]

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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Añadir a favoritos</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Compartir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="relative w-full h-64">
          <Image
            src={vehicle?.images?.[0]?.url || "/placeholder.svg?height=300&width=500"}
            alt={`${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`}
            fill
            className="object-cover"
          />
        </div>

        <div className="container px-4 py-4">
          <h1 className="text-2xl font-bold mb-2">
            {vehicle?.year} {vehicle?.make} {vehicle?.model}
          </h1>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 text-orange-500">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Quedan {formatTimeLeft(auction.end_date)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {auction.bids?.length || 0} {auction.bids?.length === 1 ? "puja" : "pujas"}
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Puja Actual</p>
                  <p className="font-bold text-2xl">${currentPrice.toLocaleString()}</p>
                </div>
                <BidForm auctionId={auction.id} currentBid={currentPrice} minIncrement={auction.min_bid_increment} />
              </div>

              <div className="text-sm">
                <p>
                  Vendedor: <span className="font-medium">{vehicle?.seller_id}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="specs">Especificaciones</TabsTrigger>
              <TabsTrigger value="bids">Historial de Pujas</TabsTrigger>
              <TabsTrigger value="terms">Términos</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <h2 className="font-semibold text-lg">Descripción</h2>
              <p>{vehicle?.description}</p>
            </TabsContent>

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

            <TabsContent value="bids">
              <div className="space-y-3">
                {auction.bids && auction.bids.length > 0 ? (
                  auction.bids
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((bid) => (
                      <div key={bid.id} className="flex justify-between py-2 border-b">
                        <div>
                          <p className="font-medium">{bid.bidder?.username || "Usuario"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(bid.created_at).toLocaleString("es-ES")}
                          </p>
                        </div>
                        <p className="font-bold">${bid.amount.toLocaleString()}</p>
                      </div>
                    ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    No hay pujas todavía. ¡Sé el primero en pujar!
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="terms" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Garantía</h3>
                <p>{garantía}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Documentos</h3>
                <ul className="list-disc pl-5">
                  {documentos.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Condiciones de Pago</h3>
                <ul className="list-disc pl-5">
                  {condicionesPago.map((condition, index) => (
                    <li key={index}>{condition}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Entrega</h3>
                <ul className="list-disc pl-5">
                  {entrega.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <nav className="sticky bottom-0 border-t bg-white">
        <div className="container grid grid-cols-4 h-16">
          <Link href="/" className="flex flex-col items-center justify-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xs mt-1">Inicio</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center justify-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="text-xs mt-1">Buscar</span>
          </Link>
          <Link href="/add-car" className="flex flex-col items-center justify-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M19 15V3h-8L3 11v10h16v-6Z" />
              <circle cx="12" cy="13" r="2" />
              <path d="M10 3v4h4" />
              <path d="M21 15h-6" />
              <path d="M15 18v3" />
              <path d="M15 12v3" />
            </svg>
            <span className="text-xs mt-1">Añadir</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
