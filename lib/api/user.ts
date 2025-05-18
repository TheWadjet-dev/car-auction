import { getSupabaseClient } from "@/lib/supabase/client"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { Profile, Bid, Auction } from "@/lib/supabase/types"

// Función para obtener el perfil del usuario actual (servidor)
export async function getCurrentUserProfile() {
  const supabase = getSupabaseServer()

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return null
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    return data as Profile
  } catch (error) {
    console.error("Error in getCurrentUserProfile:", error)
    return null
  }
}

// Función para obtener el perfil del usuario actual (cliente)
export async function getCurrentUserProfileClient() {
  const supabase = getSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("Error getting current user:", authError)
    return null
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data as Profile
}

// Función para obtener las pujas activas del usuario (servidor)
export async function getUserActiveBids(userId: string) {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from("bids")
    .select(`
      *,
      auction:auctions!inner(
        *,
        vehicle:vehicles(*)
      )
    `)
    .eq("bidder_id", userId)
    .eq("auction.status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user active bids:", error)
    return []
  }

  return data as (Bid & { auction: Auction & { vehicle: any } })[]
}

// Función para obtener las subastas ganadas por el usuario (servidor)
export async function getUserWonAuctions(userId: string) {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from("auctions")
    .select(`
      *,
      vehicle:vehicles(*)
    `)
    .eq("winner_id", userId)
    .eq("status", "ended")
    .order("end_date", { ascending: false })

  if (error) {
    console.error("Error fetching user won auctions:", error)
    return []
  }

  return data as (Auction & { vehicle: any })[]
}

// Función para verificar con WorldID (cliente)
export async function verifyWithWorldId(
  userId: string,
  verificationData: { verification_level: string; verification_id: string },
) {
  const supabase = getSupabaseClient()

  // Insertar la verificación
  const { error: verificationError } = await supabase.from("world_id_verifications").insert({
    user_id: userId,
    ...verificationData,
  })

  if (verificationError) {
    console.error("Error adding WorldID verification:", verificationError)
    throw new Error("Error al verificar con WorldID")
  }

  // Actualizar el perfil del usuario
  const { error: profileError } = await supabase.from("profiles").update({ world_id_verified: true }).eq("id", userId)

  if (profileError) {
    console.error("Error updating user profile with WorldID verification:", profileError)
    throw new Error("Error al actualizar el perfil con la verificación de WorldID")
  }

  return true
}
