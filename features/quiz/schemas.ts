import { z } from 'zod'

export const createQuizInputSchema = z.object({
  title: z.string().trim().min(1, 'El titulo es obligatorio').max(120, 'El titulo es demasiado largo'),
  description: z.string().trim().max(500, 'La descripcion es demasiado larga').optional(),
})

export const updateQuizInputSchema = z.object({
  id: z.string().uuid('ID de quiz invalido'),
  title: z.string().trim().min(1, 'El titulo es obligatorio').max(120, 'El titulo es demasiado largo'),
  description: z.string().trim().max(500, 'La descripcion es demasiado larga').optional(),
})

export type CreateQuizInput = z.infer<typeof createQuizInputSchema>
export type UpdateQuizInput = z.infer<typeof updateQuizInputSchema>
