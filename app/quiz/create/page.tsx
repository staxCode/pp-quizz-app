'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createQuizInputSchema } from '@/features/quiz/schemas'
import { createQuizAction } from '@/features/quiz/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type CreateQuizFormValues = z.infer<typeof createQuizInputSchema>

export default function CreateQuiz() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateQuizFormValues>({
    resolver: zodResolver(createQuizInputSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const onSubmit = async (values: CreateQuizFormValues) => {
    setLoading(true)
    try {
      const quiz = await createQuizAction({
        title: values.title,
        description: values.description || undefined,
      })
      toast.success('Quiz creado correctamente')
      router.push(`/quiz/${quiz.id}/edit`)
    } catch (error) {
      console.error('Error creating quiz:', error)
      toast.error('No se pudo crear el quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Crear nuevo quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="title">Titulo del quiz</Label>
                <Input
                  id="title"
                  placeholder="Ingresa el titulo del quiz"
                  {...register('title')}
                  disabled={loading}
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Descripcion (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Ingresa una descripcion del quiz"
                  {...register('description')}
                  disabled={loading}
                  rows={4}
                />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || !isValid}>
                  {loading ? 'Creando...' : 'Crear quiz'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
