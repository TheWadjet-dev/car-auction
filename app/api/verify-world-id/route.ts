import { type NextRequest, NextResponse } from "next/server"
import { verifyProof } from "@worldcoin/idkit-js"

// Variable para almacenar los usuarios verificados (en una aplicación real, esto estaría en una base de datos)
const verifiedUsers: Record<string, boolean> = {}

export async function POST(req: NextRequest) {
  try {
    const { proof, merkle_root, nullifier_hash, verification_level, action } = await req.json()

    // Verificar la prueba con WorldID
    const result = await verifyProof({
      merkle_root,
      nullifier_hash,
      proof,
      verification_level,
      action,
      signal: "", // Opcional, no lo estamos usando
    })

    if (!result.success) {
      return NextResponse.json({ error: "La verificación con WorldID falló", details: result }, { status: 400 })
    }

    // Almacenar el usuario verificado (en una aplicación real, esto se guardaría en una base de datos)
    verifiedUsers[nullifier_hash] = true

    // Establecer una cookie para mantener el estado de verificación
    const response = NextResponse.json({ success: true })
    response.cookies.set("worldid_verified", "true", {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error in verify-world-id route:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Función para verificar si un usuario está verificado (para uso interno)
export function isUserVerified(req: NextRequest): boolean {
  const verified = req.cookies.get("worldid_verified")?.value === "true"
  return verified
}
