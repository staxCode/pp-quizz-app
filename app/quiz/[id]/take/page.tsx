'use client'

import { useEffect, useRef, useState } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader } from '@/components/loader'
import { PageBreadcrumbs } from '@/components/page-breadcrumbs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Info, CheckCircle } from 'lucide-react'
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
  const [showInstructions, setShowInstructions] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initializeQuiz = async () => {
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

  useEffect(() => {
    if (!loading && questions.length > 0 && !showInstructions) {
      setShowInstructions(true)
    }
  }, [loading, questions.length])

  const currentQuestion = questions[currentIndex]

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id.toString()]: answer,
    }))
  }

  const handleNext = () => {
    const currentId = currentQuestion.id.toString()
    if (!selectedAnswers[currentId]) {
      return
    }
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

    const unanswered = questions.filter((q) => !selectedAnswers[q.id.toString()])
    if (unanswered.length > 0) {
      return
    }

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

  const getLastAnsweredIndex = () => {
    for (let i = questions.length - 1; i >= 0; i--) {
      if (selectedAnswers[questions[i].id.toString()]) return i
    }
    return -1
  }

  const maxReachable = Math.max(getLastAnsweredIndex() + 1, currentIndex)

  const handleJumpToQuestion = (idx: number) => {
    if (idx === currentIndex) return
    if (idx > maxReachable) return
    setCurrentIndex(idx)
  }

  const allAnswered = questions.every((q) => selectedAnswers[q.id.toString()])
  const currentAnswered = currentQuestion && !!selectedAnswers[currentQuestion.id.toString()]
  const unansweredCount = questions.filter((q) => !selectedAnswers[q.id.toString()]).length
  const answeredCount = questions.length - unansweredCount

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
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="size-5 text-primary" />
              Instrucciones del quiz
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                Este cuestionario tiene <strong>{questions.length} preguntas</strong>. Lee cada una
                con atencion antes de responder.
              </p>
              <div className="space-y-3 bg-muted rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Responde todas las preguntas</p>
                    <p className="text-xs text-muted-foreground">
                      No puedes pasar a la siguiente pregunta sin responder la actual.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">No puedes saltar preguntas</p>
                    <p className="text-xs text-muted-foreground">
                      Debes responder en orden. Los numeros de pregunta solo te permiten volver atras.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Envio del quiz</p>
                    <p className="text-xs text-muted-foreground">
                      Solo puedes enviar cuando todas las preguntas esten respondidas.
                    </p>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowInstructions(false)} className="w-full">
              ¡Entendido!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        <PageBreadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Resolver quiz' }]} />

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">
              Pregunta {currentIndex + 1} de {questions.length}
            </h1>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {answeredCount}/{questions.length}
            </span>
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
              <Button onClick={handleNext} disabled={!currentAnswered}>
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || !allAnswered}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? 'Enviando...' : 'Enviar quiz'}
              </Button>
            )}
          </div>
        </div>

        {/* Question Indicator */}
        <div className="mt-8 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {questions.map((_, idx) => {
              const isAnswered = !!selectedAnswers[questions[idx].id.toString()]
              const isCurrent = idx === currentIndex
              const isLocked = idx > maxReachable && !isAnswered
              return (
                <button
                  key={idx}
                  onClick={() => handleJumpToQuestion(idx)}
                  disabled={isLocked}
                  className={`size-9 rounded text-sm font-medium transition-colors flex-shrink-0 ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isAnswered
                        ? 'bg-secondary'
                        : isLocked
                          ? 'bg-muted opacity-40 cursor-not-allowed'
                          : 'bg-muted hover:bg-secondary'
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
