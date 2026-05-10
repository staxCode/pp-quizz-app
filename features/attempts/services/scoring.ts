import { Question } from '@/lib/types'

export interface ScoredResponse {
  questionId: bigint
  selectedAnswer: string
  isCorrect: boolean
}

export function buildScoredResponses(
  questions: Question[],
  selectedAnswers: Record<string, string>,
): ScoredResponse[] {
  return questions.map((question) => {
    const selectedAnswer = selectedAnswers[question.id.toString()] || ''
    return {
      questionId: question.id,
      selectedAnswer,
      isCorrect: selectedAnswer === question.correct_answer,
    }
  })
}

export function calculateScorePercentage(responses: ScoredResponse[]): number {
  if (responses.length === 0) return 0
  const correctCount = responses.filter((response) => response.isCorrect).length
  return Math.round((correctCount / responses.length) * 100)
}
