import { redirect } from 'next/navigation'

export default function SignUpDisabledPage() {
  redirect('/auth/login')
}
