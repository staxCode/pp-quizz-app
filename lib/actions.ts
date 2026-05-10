'use server'

import {
  completeQuizAttemptAction,
  getAttemptResponsesAction,
  getQuizAttemptsAction,
  getUserAttemptsAction,
  recordResponseAction,
  startQuizAttemptAction,
} from '@/features/attempts/actions'
import {
  addQuestionToQuizAction,
  createQuizAction,
  deleteQuizAction,
  getCategoriesAction,
  getQuestionByIdAction,
  getQuestionsAction,
  getQuestionsByCategoryAction,
  getQuizzesAction,
  getQuizQuestionsAction,
  removeQuestionFromQuizAction,
  updateQuizAction,
} from '@/features/quiz/actions'

// Quiz operations
export async function getQuizzes() {
  return getQuizzesAction()
}

export async function createQuiz(title: string, description?: string, categoryId?: bigint) {
  return createQuizAction({ title, description, categoryId })
}

export async function updateQuiz(id: string, title: string, description?: string) {
  return updateQuizAction({ id, title, description })
}

export async function deleteQuiz(id: string) {
  return deleteQuizAction(id)
}

// Questions operations
export async function getQuestions(limit?: number) {
  return getQuestionsAction(limit)
}

export async function getQuestionById(id: bigint) {
  return getQuestionByIdAction(id)
}

export async function getQuestionsByCategory(categoryId: bigint) {
  return getQuestionsByCategoryAction(categoryId)
}

// Quiz questions operations
export async function addQuestionToQuiz(quizId: string, questionId: bigint, orderNum: number) {
  return addQuestionToQuizAction(quizId, questionId, orderNum)
}

export async function removeQuestionFromQuiz(quizId: string, questionId: bigint) {
  return removeQuestionFromQuizAction(quizId, questionId)
}

export async function getQuizQuestions(quizId: string) {
  return getQuizQuestionsAction(quizId)
}

// Quiz attempts operations
export async function startQuizAttempt(quizId: string) {
  return startQuizAttemptAction({ quizId })
}

export async function completeQuizAttempt(
  attemptId: string,
  score: number,
  totalQuestions: number
) {
  return completeQuizAttemptAction({ attemptId, score, totalQuestions })
}

export async function getQuizAttempts(quizId: string) {
  return getQuizAttemptsAction({ quizId })
}

export async function getUserAttempts() {
  return getUserAttemptsAction()
}

// Responses operations
export async function recordResponse(
  attemptId: string,
  questionId: bigint,
  selectedAnswer: string,
  isCorrect: boolean
) {
  return recordResponseAction({ attemptId, questionId, selectedAnswer, isCorrect })
}

export async function getAttemptResponses(attemptId: string) {
  return getAttemptResponsesAction({ attemptId })
}

export async function getCategories() {
  return getCategoriesAction()
}
