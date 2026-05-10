import type { Profile } from '@/lib/types'

export type { Profile }

export interface AuthSession {
  user: {
    id: string
    email?: string
  }
  profile: Profile | null
}

export interface LoginInput {
  email: string
  password: string
}
