import { getSupabaseClient } from "@/lib/supabase/client"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { Auction, Bid } from "@/lib/supabase/types"

// Función para obtener todas las subastas activas (servidor)
export async function getActiveAuctions() {
  const supabase = getSupabaseServer()

  try {
    const { data, error } = await supabase
      .from("auctions")
      .select(`
        *,
        vehicle:vehicles(*),
        bids(count)
      `)
      .eq("status", "active")
      .order("end_date", { ascending: true })

    if (error) {
      console.error("Error fetching active auctions:", error)
      return []
    }

    // Transformar los datos para incluir el conteo de pujas
    return data.map((auction) => ({
      ...auction,
      _count: {
        bids: auction.bids[0]?.count || 0,
      },
    })) as Auction[]
  } catch (error) {
    console.error("Error in getActiveAuctions:", error)
    return []
  }
}

// Función para obtener una subasta por ID (servidor)
export async function getAuctionById(id: string) {
  const supabase = getSupabaseServer()

  try {
    const { data, error } = await supabase
      .from("auctions")
      .select(`
        *,
        vehicle:vehicles(*),
        bids(*, bidder:profiles(*))
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Error fetching auction with ID ${id}:`, error)
      return null
    }

    return data as Auction & { bids: (Bid & { bidder: any })[] }
  } catch (error) {
    console.error(`Error in getAuctionById for ID ${id}:`, error)
    return null
  }
}

// Función para crear una subasta (cliente)
export async function createAuction(
  auctionData: Omit<Auction, "id" | "created_at" | "updated_at" | "winner_id" | "final_price">,
) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("auctions").insert(auctionData).select().single()

  if (error) {
    console.error("Error creating auction:", error)
    throw new Error("Error al crear la subasta")
  }

  return data
}

// Función para realizar una puja (cliente)
export async function placeBid(auctionId: string, bidderId: string, amount: number) {
  const supabase = getSupabaseClient()

  // Primero verificamos que la subasta esté activa
  const { data: auction, error: auctionError } = await supabase
    .from("auctions")
    .select("*")
    .eq("id", auctionId)
    .eq("status", "active")
    .single()

  if (auctionError) {
    console.error("Error fetching auction for bid:", auctionError)
    throw new Error("La subasta no está disponible o ha finalizado")
  }

  // Verificamos que la puja sea mayor que la puja actual más el incremento mínimo
  const { data: highestBid, error: bidError } = await supabase
    .from("bids")
    .select("amount")
    .eq("auction_id", auctionId)
    .order("amount", { ascending: false })
    .limit(1)
    .single()

  const minValidBid = highestBid ? highestBid.amount + auction.min_bid_increment : auction.start_price

  if (amount < minValidBid) {
    throw new Error(`La puja debe ser al menos $${minValidBid.toLocaleString()}`)
  }

  // Realizamos la puja
  const { data: bid, error: insertError } = await supabase
    .from("bids")
    .insert({
      auction_id: auctionId,
      bidder_id: bidderId,
      amount,
    })
    .select()
    .single()

  if (insertError) {
    console.error("Error placing bid:", insertError)
    throw new Error("Error al realizar la puja")
  }

  return bid
}
