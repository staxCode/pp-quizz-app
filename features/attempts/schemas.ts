import { z } from 'zod'

export const startQuizAttemptInputSchema = z.object({
  quizId: z.string().uuid('ID de quiz invalido'),
})

export const completeQuizAttemptInputSchema = z.object({
  attemptId: z.string().uuid('ID de intento invalido'),
  score: z.number().int().min(0, 'Score invalido').max(100, 'Score invalido'),
  totalQuestions: z.number().int().min(0, 'Total de preguntas invalido'),
})

export const getQuizAttemptsInputSchema = z.object({
  quizId: z.string().uuid('ID de quiz invalido'),
})

export const recordResponseInputSchema = z.object({
  attemptId: z.string().uuid('ID de intento invalido'),
  questionId: z.bigint(),
  selectedAnswer: z.string().max(500, 'Respuesta demasiado larga'),
  isCorrect: z.boolean(),
})

export const getAttemptResponsesInputSchema = z.object({
  attemptId: z.string().uuid('ID de intento invalido'),
})
