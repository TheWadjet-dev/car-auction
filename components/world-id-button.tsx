"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IDKitWidget, VerificationLevel, type ISuccessResult } from "@worldcoin/idkit"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface WorldIDButtonProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export default function WorldIDButton({ onSuccess, onError }: WorldIDButtonProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()

  const handleVerify = async (result: ISuccessResult) => {
    try {
      setIsVerifying(true)

      // Enviar la prueba al backend para verificación
      const response = await fetch("/api/verify-world-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proof: result.proof,
          merkle_root: result.merkle_root,
          nullifier_hash: result.nullifier_hash,
          verification_level: result.verification_level,
          action: "verify-identity", // Debe coincidir con el action en IDKitWidget
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar con WorldID")
      }

      // Mostrar mensaje de éxito
      toast({
        title: "¡Verificación exitosa!",
        description: "Tu identidad ha sido verificada con WorldID",
      })

      // Actualizar la UI
      router.refresh()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error verifying with WorldID:", error)

      toast({
        title: "Error de verificación",
        description: error instanceof Error ? error.message : "Ocurrió un error durante la verificación",
        variant: "destructive",
      })

      if (onError && error instanceof Error) {
        onError(error)
      }
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <IDKitWidget
      app_id={process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || ""}
      action="verify-identity"
      onSuccess={handleVerify}
      verification_level={VerificationLevel.Device}
      handleVerify={(proof) => {
        // Esta función es necesaria pero la verificación real se hace en el backend
        return new Promise((resolve) => resolve(true))
      }}
    >
      {({ open }) => (
        <Button onClick={open} disabled={isVerifying} className="w-full">
          {isVerifying ? "Verificando..." : "Verificar con WorldID"}
        </Button>
      )}
    </IDKitWidget>
  )
}
