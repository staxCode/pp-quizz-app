import type { QuizAttempt, Response } from '@/lib/types'

export type { QuizAttempt, Response }

export interface AttemptSummary {
  id: string
  quizId: string
  quizTitle: string
  score: number | null
  totalQuestions: number
  startedAt: string
  completedAt: string | null
}

export interface AttemptResult {
  attempt: QuizAttempt
  responses: Response[]
  scorePercentage: number
  correctCount: number
  incorrectCount: number
}
