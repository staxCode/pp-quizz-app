import { redirect } from 'next/navigation'

export default function LoadDataDisabledPage() {
  redirect('/auth/login')
}
