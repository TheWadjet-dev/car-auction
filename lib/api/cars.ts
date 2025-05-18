// Tipos para los datos de carros
export interface Car {
  id: string
  marca: string
  modelo: string
  año: number
  precioInicial: number
  ownerWallet: string
  imagen?: string
}

// URL base de la API
const API_URL = "https://car-auction-api.onrender.com/api/carros"

// Función para obtener todos los carros
export async function getCars(): Promise<Car[]> {
  try {
    const response = await fetch(API_URL, {
      cache: "no-store", // Desactivar caché para obtener datos frescos
    })

    if (!response.ok) {
      throw new Error(`Error al obtener carros: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching cars:", error)
    return []
  }
}

// Función para obtener un carro por ID
export async function getCarById(id: string): Promise<Car | null> {
  try {
    const cars = await getCars()
    const car = cars.find((car) => car.id === id)
    return car || null
  } catch (error) {
    console.error(`Error fetching car with ID ${id}:`, error)
    return null
  }
}

// Función para añadir un nuevo carro
export async function addCar(carData: Omit<Car, "id">): Promise<Car> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(carData),
    })

    if (!response.ok) {
      throw new Error(`Error al añadir carro: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error adding car:", error)
    throw error
  }
}
