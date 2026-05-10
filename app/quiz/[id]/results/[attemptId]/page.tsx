'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAttemptResponsesAction } from '@/features/attempts/actions'
import { getQuizQuestionsAction } from '@/features/quiz/actions'
import { Question, Response } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, BarChart3 } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function QuizResults() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  const attemptId = params.attemptId as string

  const [responses, setResponses] = useState<Response[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadResults = async () => {
      try {
        const [responsesData, questionsData] = await Promise.all([
          getAttemptResponsesAction({ attemptId }),
          getQuizQuestionsAction(quizId),
        ])
        setResponses(responsesData)
        setQuestions(questionsData)
      } catch (error) {
        console.error('Error loading results:', error)
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [quizId, attemptId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const correctCount = responses.filter((r) => r.is_correct).length
  const percentage = Math.round((correctCount / responses.length) * 100)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50'
    if (score >= 60) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  useEffect(() => {
    if (!loading && responses.length > 0 && percentage === 100) {
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.6 },
      })
    }
  }, [loading, percentage, responses.length])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Score Card */}
        <div className={`rounded-lg p-8 mb-8 ${getScoreBgColor(percentage)}`}>
          <div className="flex flex-col items-center justify-center">
            <BarChart3 className={`w-16 h-16 mb-4 ${getScoreColor(percentage)}`} />
            <h1 className="text-4xl font-bold mb-2">Quiz completado</h1>
            <p className={`text-5xl font-bold mb-4 ${getScoreColor(percentage)}`}>
              {percentage}%
            </p>
            <p className="text-lg text-muted-foreground">
              Acertaste {correctCount} de {responses.length} preguntas
            </p>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Revisa tus respuestas</h2>
          <div className="space-y-4">
            {responses.map((response, idx) => {
              const question = questions.find((q) => q.id === response.question_id)
              if (!question) return null

              return (
                <Card key={response.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          Pregunta {idx + 1}: {question.question}
                        </CardTitle>
                      </div>
                      {response.is_correct ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 ml-2" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Tu respuesta:</p>
                        <div
                          className={`p-3 rounded text-sm ${
                            response.is_correct ? 'bg-green-50' : 'bg-red-50'
                          }`}
                        >
                          {response.selected_answer || '(Sin respuesta)'}
                        </div>
                      </div>
                      {!response.is_correct && (
                        <div>
                          <p className="text-sm font-medium mb-2">Respuesta correcta:</p>
                          <div className="p-3 rounded text-sm bg-green-50">
                            {question.correct_answer}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Volver al dashboard
          </Button>
          <Button onClick={() => router.push(`/quiz/${quizId}/take`)}>
            Reintentar quiz
          </Button>
        </div>
      </div>
    </div>
  )
}
