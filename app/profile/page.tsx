import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUserProfile, getUserActiveBids, getUserWonAuctions } from "@/lib/api/user"
import { formatTimeLeft, formatDate } from "@/lib/utils"
import WorldIDButton from "@/components/world-id-button"

export default async function ProfilePage() {
  const profile = await getCurrentUserProfile()

  // Si el usuario no está autenticado, redirigir al inicio
  if (!profile) {
    redirect("/")
  }

  // Obtener las pujas activas del usuario
  const activeBids = await getUserActiveBids(profile.id)

  // Obtener las subastas ganadas por el usuario
  const wonAuctions = await getUserWonAuctions(profile.id)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-14 px-4">
          <h1 className="text-xl font-bold">Perfil</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Configuración</span>
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative h-16 w-16 rounded-full overflow-hidden">
              <Image
                src={profile.avatar_url || "/placeholder.svg?height=100&width=100"}
                alt={profile.full_name || "Usuario"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl">{profile.full_name || profile.username || "Usuario"}</h2>
              <p className="text-sm text-muted-foreground">Miembro desde {formatDate(profile.created_at)}</p>
            </div>
            {!profile.world_id_verified && (
              <div>
                <WorldIDButton />
              </div>
            )}
          </div>

          <Tabs defaultValue="active-bids">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="active-bids">Pujas Activas</TabsTrigger>
              <TabsTrigger value="won">Ganadas</TabsTrigger>
              <TabsTrigger value="my-cars">Mis Vehículos</TabsTrigger>
            </TabsList>

            <TabsContent value="active-bids">
              {activeBids.length > 0 ? (
                <div className="space-y-4">
                  {activeBids.map((bid) => {
                    const auction = bid.auction
                    const vehicle = auction.vehicle

                    // Verificar si es la puja más alta
                    const isHighestBid =
                      auction.bids && auction.bids.length > 0
                        ? Math.max(...auction.bids.map((b) => b.amount)) === bid.amount
                        : true

                    return (
                      <Card key={bid.id}>
                        <CardContent className="p-4">
                          <Link href={`/auction/${auction.id}`} className="flex gap-3">
                            <div className="relative h-20 w-28 flex-shrink-0">
                              <Image
                                src={vehicle?.images?.[0]?.url || "/placeholder.svg?height=80&width=120"}
                                alt={`${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold line-clamp-1">
                                {vehicle?.year} {vehicle?.make} {vehicle?.model}
                              </h3>
                              <div className="grid grid-cols-2 gap-1 mt-1">
                                <div>
                                  <p className="text-xs text-muted-foreground">Tu puja</p>
                                  <p className="font-medium">${bid.amount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Puja actual</p>
                                  <p className="font-medium">
                                    $
                                    {(auction.bids && auction.bids.length > 0
                                      ? Math.max(...auction.bids.map((b) => b.amount))
                                      : auction.start_price
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm">{formatTimeLeft(auction.end_date)} restantes</span>
                                {isHighestBid ? (
                                  <span className="text-sm text-green-500 font-medium">Puja más alta</span>
                                ) : (
                                  <span className="text-sm text-red-500 font-medium">Superado</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tienes pujas activas</p>
                  <Button asChild className="mt-4">
                    <Link href="/">Explorar subastas</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="won">
              {wonAuctions.length > 0 ? (
                <div className="space-y-4">
                  {wonAuctions.map((auction) => {
                    const vehicle = auction.vehicle

                    return (
                      <Card key={auction.id}>
                        <CardContent className="p-4">
                          <Link href={`/auction/${auction.id}`} className="flex gap-3">
                            <div className="relative h-20 w-28 flex-shrink-0">
                              <Image
                                src={vehicle?.images?.[0]?.url || "/placeholder.svg?height=80&width=120"}
                                alt={`${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold line-clamp-1">
                                {vehicle?.year} {vehicle?.make} {vehicle?.model}
                              </h3>
                              <div className="mt-1">
                                <p className="text-xs text-muted-foreground">Precio final</p>
                                <p className="font-medium">${auction.final_price?.toLocaleString() || "N/A"}</p>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm">Ganada el {formatDate(auction.end_date)}</span>
                                <span className="text-sm font-medium">Completar pago</span>
                              </div>
                            </div>
                          </Link>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No has ganado ninguna subasta todavía</p>
                  <Button asChild className="mt-4">
                    <Link href="/">Explorar subastas</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-cars">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Aquí podrás ver los vehículos que has puesto en subasta</p>
                <Button asChild>
                  <Link href="/add-car">Añadir un vehículo</Link>
                </Button>
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
          <Link href="/profile" className="flex flex-col items-center justify-center text-primary">
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
