import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    })

    await supabase.auth.exchangeCodeForSession(code)

    // Verificar si el usuario ya tiene un perfil, si no, crearlo
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (!profile) {
        // Crear un perfil para el nuevo usuario
        await supabase.from("profiles").insert({
          id: user.id,
          username: user.email?.split("@")[0],
          full_name: user.user_metadata.full_name,
          avatar_url: user.user_metadata.avatar_url,
        })
      }
    }
  }

  // Redirigir a la página principal
  return NextResponse.redirect(new URL("/", request.url))
}
