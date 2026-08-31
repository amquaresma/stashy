import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Rotas acessíveis sem estar logado.
// Tudo que não estiver aqui é considerado área privada.
const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password']

// Prefixos públicos (perfil público /u/[username], rotas internas de auth)
const PUBLIC_PREFIXES = ['/u/', '/auth/']

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.includes(pathname)) return true
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

// Páginas que um usuário JÁ logado não deveria conseguir acessar
// de novo (login, cadastro, etc. — manda direto pro dashboard).
const AUTH_ONLY_PATHS = ['/login', '/register', '/forgot-password']

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Importante: não remova esta chamada. Ela renova o token de sessão
  // do usuário, se necessário, antes de servir a página.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (user && AUTH_ONLY_PATHS.includes(pathname)) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}
