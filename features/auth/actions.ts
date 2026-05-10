'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { loginSchema } from '@/features/auth/schemas'
import { UnauthorizedError } from '@/lib/shared/errors'

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed)

  if (error) throw new UnauthorizedError('Credenciales invalidas')

  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function getSessionAction() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}
