'use server'

import { createClient } from '@/lib/supabase/server'
import { Question, Quiz, Category } from '@/lib/types'
import { createQuizInputSchema, updateQuizInputSchema } from '@/features/quiz/schemas'

export async function getQuizzesAction() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('quizzes').select('*')

  if (error) throw error
  return data as Quiz[]
}

export async function createQuizAction(input: { title: string; description?: string; categoryId?: bigint }) {
  const parsed = createQuizInputSchema.parse({
    title: input.title,
    description: input.description,
  })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      user_id: user.id,
      title: parsed.title,
      description: parsed.description,
      category_id: input.categoryId,
    })
    .select()
    .single()

  if (error) throw error
  return data as Quiz
}

export async function updateQuizAction(input: { id: string; title: string; description?: string }) {
  const parsed = updateQuizInputSchema.parse(input)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quizzes')
    .update({ title: parsed.title, description: parsed.description, updated_at: new Date().toISOString() })
    .eq('id', parsed.id)
    .select()
    .single()

  if (error) throw error
  return data as Quiz
}

export async function getQuestionsAction(limit?: number) {
  const supabase = await createClient()
  let query = supabase.from('questions').select('*')

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data as Question[]
}

export async function getQuizQuestionsAction(quizId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('question_id, order_num')
    .eq('quiz_id', quizId)
    .order('order_num')

  if (error) throw error

  const questionIds = (data || []).map((q) => q.question_id)
  if (questionIds.length === 0) return []

  const { data: questions, error: questionsError } = await supabase.from('questions').select('*').in('id', questionIds)
  if (questionsError) throw questionsError

  return questions as Question[]
}

export async function addQuestionToQuizAction(quizId: string, questionId: bigint, orderNum: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert({ quiz_id: quizId, question_id: questionId, order_num: orderNum })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeQuestionFromQuizAction(quizId: string, questionId: bigint) {
  const supabase = await createClient()
  const { error } = await supabase.from('quiz_questions').delete().eq('quiz_id', quizId).eq('question_id', questionId)

  if (error) throw error
}

export async function deleteQuizAction(quizId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('quizzes').delete().eq('id', quizId)

  if (error) throw error
}

export async function getQuestionByIdAction(id: bigint) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('questions').select('*').eq('id', id).single()

  if (error) throw error
  return data as Question
}

export async function getQuestionsByCategoryAction(categoryId: bigint) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category_id', categoryId)

  if (error) throw error
  return data as Question[]
}

export async function getCategoriesAction() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*')

  if (error) throw error
  return data as Category[]
}
