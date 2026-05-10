import { redirect } from 'next/navigation'

export default function SetupDisabledPage() {
  redirect('/auth/login')
}
