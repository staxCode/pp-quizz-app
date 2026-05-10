import { redirect } from 'next/navigation'

export default function CreateUserDisabledPage() {
  redirect('/auth/login')
}
