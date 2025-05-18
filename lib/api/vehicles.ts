import { getSupabaseClient } from "@/lib/supabase/client"
import { getSupabaseServer } from "@/lib/supabase/server"
import type { Vehicle, VehicleImage } from "@/lib/supabase/types"

// Función para obtener todos los vehículos (servidor)
export async function getVehicles() {
  const supabase = getSupabaseServer()

  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select(`
        *,
        vehicle_images(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching vehicles:", error)
      return []
    }

    return data as (Vehicle & { vehicle_images: VehicleImage[] })[]
  } catch (error) {
    console.error("Error in getVehicles:", error)
    return []
  }
}

// Función para obtener un vehículo por ID (servidor)
export async function getVehicleById(id: string) {
  const supabase = getSupabaseServer()

  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select(`
        *,
        vehicle_images(*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Error fetching vehicle with ID ${id}:`, error)
      return null
    }

    return data as Vehicle & { vehicle_images: VehicleImage[] }
  } catch (error) {
    console.error(`Error in getVehicleById for ID ${id}:`, error)
    return null
  }
}

// Función para añadir un vehículo (cliente)
export async function addVehicle(
  vehicleData: Omit<Vehicle, "id" | "created_at" | "updated_at">,
  images: { url: string; is_primary: boolean }[],
) {
  const supabase = getSupabaseClient()

  // Insertar el vehículo
  const { data: vehicle, error: vehicleError } = await supabase.from("vehicles").insert(vehicleData).select().single()

  if (vehicleError) {
    console.error("Error adding vehicle:", vehicleError)
    throw new Error("Error al añadir el vehículo")
  }

  // Insertar las imágenes
  if (images.length > 0) {
    const imagesWithVehicleId = images.map((img) => ({
      ...img,
      vehicle_id: vehicle.id,
    }))

    const { error: imagesError } = await supabase.from("vehicle_images").insert(imagesWithVehicleId)

    if (imagesError) {
      console.error("Error adding vehicle images:", imagesError)
      throw new Error("Error al añadir las imágenes del vehículo")
    }
  }

  return vehicle
}
