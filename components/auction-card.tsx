"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AuctionCardProps {
  id: string
  title: string
  image: string
  currentBid: number
  timeLeft: string
  bids: number
  featured?: boolean
}

export default function AuctionCard({
  id,
  title,
  image,
  currentBid,
  timeLeft,
  bids,
  featured = false,
}: AuctionCardProps) {
  return (
    <Card className={`overflow-hidden ${featured ? "border-primary border-2" : ""}`}>
      <Link href={`/auction/${id}`}>
        <div className="relative">
          {featured && <Badge className="absolute top-2 left-2 z-10">Destacado</Badge>}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm rounded-full h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              // Add to favorites logic
            }}
          >
            <Heart className="h-4 w-4" />
            <span className="sr-only">Añadir a favoritos</span>
          </Button>
          <div className="relative h-48 w-full">
            <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/auction/${id}`} className="block">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{title}</h3>
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-sm text-muted-foreground">Puja Actual</p>
              <p className="font-bold text-lg">${currentBid.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tiempo Restante</p>
              <p className="font-medium">{timeLeft}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {bids} {bids === 1 ? "puja" : "pujas"}
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
