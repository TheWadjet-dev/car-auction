"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import AuthButton from "@/components/auth-button"

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>AutoSubasta</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          <Link
            href="/"
            className="text-lg font-medium px-2 py-1 rounded-md hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Inicio
          </Link>
          <Link
            href="/search"
            className="text-lg font-medium px-2 py-1 rounded-md hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Buscar
          </Link>
          <Link
            href="/add-car"
            className="text-lg font-medium px-2 py-1 rounded-md hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Añadir Vehículo
          </Link>
          <Link
            href="/profile"
            className="text-lg font-medium px-2 py-1 rounded-md hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Perfil
          </Link>
          <div className="border-t my-4"></div>
          <div className="px-2">
            <AuthButton />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
