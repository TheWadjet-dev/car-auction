export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  phone_number: string | null
  address: string | null
  is_seller: boolean
  is_verified: boolean
  world_id_verified: boolean
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  seller_id: string
  make: string
  model: string
  year: number
  mileage: number
  engine: string | null
  transmission: string | null
  exterior_color: string | null
  interior_color: string | null
  vin: string | null
  description: string | null
  condition: string | null
  features: any | null
  documents: any | null
  created_at: string
  updated_at: string
  images?: VehicleImage[]
}

export interface VehicleImage {
  id: string
  vehicle_id: string
  url: string
  is_primary: boolean
  created_at: string
}

export interface Auction {
  id: string
  vehicle_id: string
  start_price: number
  reserve_price: number | null
  min_bid_increment: number
  start_date: string
  end_date: string
  status: "pending" | "active" | "ended" | "cancelled"
  winner_id: string | null
  final_price: number | null
  created_at: string
  updated_at: string
  vehicle?: Vehicle
  bids?: Bid[]
  _count?: {
    bids: number
  }
}

export interface Bid {
  id: string
  auction_id: string
  bidder_id: string
  amount: number
  created_at: string
  bidder?: Profile
}

export interface Transaction {
  id: string
  auction_id: string
  buyer_id: string
  seller_id: string
  amount: number
  status: "pending" | "paid" | "completed" | "refunded" | "cancelled"
  payment_method: string | null
  payment_id: string | null
  created_at: string
  updated_at: string
  auction?: Auction
}

export interface Favorite {
  id: string
  user_id: string
  auction_id: string
  created_at: string
  auction?: Auction
}

export interface WorldIDVerification {
  id: string
  user_id: string
  verification_level: string
  verification_id: string
  verified_at: string
}
