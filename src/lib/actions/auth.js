'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// A7: logout — encerra a sessão atual.
export async function logoutUser() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
