'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  completeQuizAttemptAction,
  recordResponseAction,
  startQuizAttemptAction,
} from '@/features/attempts/actions'
import { getQuizQuestionsAction } from '@/features/quiz/actions'
import { Question, QuizAttempt } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/loader'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { buildScoredResponses, calculateScorePercentage } from '@/features/attempts/services/scoring'

export default function TakeQuiz() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const initializeQuiz = async () => {
      if (attempt) return // No iniciar si ya hay un intento
      try {
        const questionsData = await getQuizQuestionsAction(quizId)
        setQuestions(questionsData)

        const attemptData = await startQuizAttemptAction({ quizId })
        setAttempt(attemptData)
      } catch (error) {
        console.error('Error loading quiz:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeQuiz()
  }, [quizId])

  const currentQuestion = questions[currentIndex]

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id.toString()]: answer,
    }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!attempt || attempt.completed_at) return

    setSubmitting(true)
    try {
      const scoredResponses = buildScoredResponses(questions, selectedAnswers)
      for (const response of scoredResponses) {
        await recordResponseAction({
          attemptId: attempt.id,
          questionId: response.questionId,
          selectedAnswer: response.selectedAnswer,
          isCorrect: response.isCorrect,
        })
      }

      const percentage = calculateScorePercentage(scoredResponses)
      await completeQuizAttemptAction({
        attemptId: attempt.id,
        score: percentage,
        totalQuestions: questions.length,
      })

      router.push(`/quiz/${quizId}/results/${attempt.id}`)
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loader message="Preparando quiz..." />
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-4">Este quiz no tiene preguntas</p>
            <Button onClick={() => router.back()}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = Math.round(((currentIndex + 1) / questions.length) * 100)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">
              Pregunta {currentIndex + 1} de {questions.length}
            </h1>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswers[currentQuestion.id.toString()] || ''}
              onValueChange={handleSelectAnswer}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`} className="cursor-pointer font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentIndex < questions.length - 1 ? (
              <Button onClick={handleNext}>
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? 'Enviando...' : 'Enviar quiz'}
              </Button>
            )}
          </div>
        </div>

        {/* Question Indicator */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`p-2 rounded text-sm font-medium transition-colors ${
                idx === currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : selectedAnswers[questions[idx].id.toString()]
                    ? 'bg-secondary'
                    : 'bg-muted hover:bg-secondary'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
