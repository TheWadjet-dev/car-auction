"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function AuthButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      router.refresh()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  const handleLogin = async () => {
    setIsLoading(true)

    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    } catch (error) {
      console.error("Error logging in:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return user ? (
    <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
    </Button>
  ) : (
    <Button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
    </Button>
  )
}
