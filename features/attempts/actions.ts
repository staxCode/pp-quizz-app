'use server'

import { createClient } from '@/lib/supabase/server'
import { QuizAttempt, Response } from '@/lib/types'
import {
  completeQuizAttemptInputSchema,
  getAttemptResponsesInputSchema,
  getQuizAttemptsInputSchema,
  recordResponseInputSchema,
  startQuizAttemptInputSchema,
} from '@/features/attempts/schemas'

export async function startQuizAttemptAction(input: { quizId: string }) {
  const parsed = startQuizAttemptInputSchema.parse(input)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: parsed.quizId,
      user_id: user.id,
      total_questions: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data as QuizAttempt
}

export async function completeQuizAttemptAction(input: {
  attemptId: string
  score: number
  totalQuestions: number
}) {
  const parsed = completeQuizAttemptInputSchema.parse(input)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quiz_attempts')
    .update({
      completed_at: new Date().toISOString(),
      score: parsed.score,
      total_questions: parsed.totalQuestions,
    })
    .eq('id', parsed.attemptId)
    .select()
    .single()

  if (error) throw error
  return data as QuizAttempt
}

export async function getQuizAttemptsAction(input: { quizId: string }) {
  const parsed = getQuizAttemptsInputSchema.parse(input)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', parsed.quizId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as QuizAttempt[]
}

export async function getUserAttemptsAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as QuizAttempt[]
}

export async function recordResponseAction(input: {
  attemptId: string
  questionId: bigint
  selectedAnswer: string
  isCorrect: boolean
}) {
  const parsed = recordResponseInputSchema.parse(input)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('responses')
    .insert({
      attempt_id: parsed.attemptId,
      question_id: parsed.questionId,
      selected_answer: parsed.selectedAnswer,
      is_correct: parsed.isCorrect,
    })
    .select()
    .single()

  if (error) throw error
  return data as Response
}

export async function getAttemptResponsesAction(input: { attemptId: string }) {
  const parsed = getAttemptResponsesInputSchema.parse(input)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('attempt_id', parsed.attemptId)

  if (error) throw error
  return data as Response[]
}
