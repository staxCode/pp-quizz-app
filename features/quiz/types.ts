import type { Question, Quiz, QuizQuestion } from '@/lib/types'

export type { Question, Quiz, QuizQuestion }

export interface QuizWithQuestions extends Quiz {
  questions: Question[]
}

export interface QuizListItem {
  id: string
  title: string
  description: string | null
  questionCount: number
  createdAt: string
}
