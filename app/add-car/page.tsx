import { cookies } from "next/headers"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AddCarForm from "./add-car-form"
import WorldIDButton from "@/components/world-id-button"

export default function AddCarPage() {
  // Verificar si el usuario está verificado con WorldID
  const isVerified = cookies().get("worldid_verified")?.value === "true"

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
          <h1 className="text-xl font-bold">Añadir Vehículo</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        {isVerified ? (
          <AddCarForm />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Verificación Requerida</CardTitle>
              <CardDescription>
                Para añadir un vehículo a la plataforma, necesitas verificar tu identidad con WorldID. Esto nos ayuda a
                mantener la seguridad y confianza en nuestra plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  WorldID es un sistema de verificación de identidad que garantiza que cada persona solo puede tener una
                  cuenta. La verificación es rápida y segura.
                </p>
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2">¿Cómo funciona?</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Haz clic en el botón "Verificar con WorldID" a continuación</li>
                    <li>Se abrirá una ventana de WorldID para verificar tu identidad</li>
                    <li>Sigue las instrucciones para completar la verificación</li>
                    <li>Una vez verificado, podrás añadir vehículos a la plataforma</li>
                  </ol>
                </div>
                <WorldIDButton />
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
