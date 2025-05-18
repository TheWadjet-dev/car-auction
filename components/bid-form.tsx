"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { placeBid } from "@/lib/api/auctions"

interface BidFormProps {
  auctionId: string
  currentBid: number
  minIncrement: number
}

export default function BidForm({ auctionId, currentBid, minIncrement }: BidFormProps) {
  const [open, setOpen] = useState(false)
  const [bidAmount, setBidAmount] = useState((currentBid + minIncrement).toString())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Verificar que el usuario esté autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Inicia sesión para pujar",
          description: "Debes iniciar sesión para realizar una puja.",
          variant: "destructive",
        })
        return
      }

      // Realizar la puja
      await placeBid(auctionId, user.id, Number.parseFloat(bidAmount))

      toast({
        title: "¡Puja realizada con éxito!",
        description: `Has pujado $${Number.parseInt(bidAmount).toLocaleString()} por este vehículo.`,
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error placing bid:", error)
      toast({
        title: "Error al realizar la puja",
        description: error instanceof Error ? error.message : "Por favor, inténtalo de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Hacer Puja</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Realizar una Puja</DialogTitle>
          <DialogDescription>
            Ingresa el monto de tu puja. La puja mínima es de ${(currentBid + minIncrement).toLocaleString()}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bid-amount">Monto de la Puja ($)</Label>
              <Input
                id="bid-amount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={currentBid + minIncrement}
                step={100}
                required
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Información importante:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Las pujas son vinculantes y no pueden ser retiradas</li>
                <li>Si ganas, deberás completar la compra en 3 días</li>
                <li>Se aplica una comisión del 5% al precio final</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Procesando..." : "Confirmar Puja"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
