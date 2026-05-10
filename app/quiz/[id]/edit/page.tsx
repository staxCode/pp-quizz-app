'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  addQuestionToQuizAction,
  getQuestionsAction,
  getQuizQuestionsAction,
  getQuizzesAction,
  removeQuestionFromQuizAction,
  updateQuizAction,
} from '@/features/quiz/actions'
import { Quiz, Question } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function EditQuiz() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const quizzesData = await getQuizzesAction()
        const currentQuiz = quizzesData.find((q) => q.id === quizId)
        setQuiz(currentQuiz || null)
        setTitle(currentQuiz?.title || '')
        setDescription(currentQuiz?.description || '')

        const [questionsData, quizQuestionsData] = await Promise.all([
          getQuestionsAction(500),
          getQuizQuestionsAction(quizId),
        ])

        setQuizQuestions(quizQuestionsData)
        setAvailableQuestions(questionsData)
        setFilteredQuestions(questionsData)
      } catch (error) {
        console.error('Error loading quiz:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [quizId])

  useEffect(() => {
    const filtered = availableQuestions.filter(
      (q) =>
        !quizQuestions.find((qq) => qq.id === q.id) &&
        (q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.id.toString().includes(searchTerm))
    )
    setFilteredQuestions(filtered)
  }, [searchTerm, availableQuestions, quizQuestions])

  const handleSaveQuiz = async () => {
    if (!quiz) return

    setSaving(true)
    try {
      await updateQuizAction({ id: quiz.id, title, description: description || undefined })
      toast.success('Quiz actualizado')
    } catch (error) {
      console.error('Error saving quiz:', error)
      toast.error('No se pudo guardar el quiz')
    } finally {
      setSaving(false)
    }
  }

  const handleAddQuestion = async (questionId: bigint) => {
    try {
      const orderNum = quizQuestions.length + 1
      await addQuestionToQuizAction(quizId, questionId, orderNum)
      const question = availableQuestions.find((q) => q.id === questionId)
      if (question) {
        setQuizQuestions((prev) => [...prev, question])
      }
    } catch (error) {
      console.error('Error adding question:', error)
      toast.error('No se pudo agregar la pregunta')
    }
  }

  const handleRemoveQuestion = async (questionId: bigint) => {
    try {
      await removeQuestionFromQuizAction(quizId, questionId)
      setQuizQuestions((prev) => prev.filter((q) => q.id !== questionId))
    } catch (error) {
      console.error('Error removing question:', error)
      toast.error('No se pudo eliminar la pregunta')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-4">Quiz no encontrado</p>
            <Button onClick={() => router.back()}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Settings */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Configuracion del quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Titulo del quiz</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripcion</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button onClick={handleSaveQuiz} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </CardContent>
            </Card>

            {/* Quiz Questions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Preguntas del quiz ({quizQuestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quizQuestions.length === 0 ? (
                  <p className="text-muted-foreground mb-4">
                    Aun no hay preguntas agregadas. Agregalas desde el panel derecho.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {quizQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="flex items-start justify-between p-3 border rounded"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {idx + 1}. {q.question}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {q.id}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(q.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Available Questions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Agregar preguntas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar preguntas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredQuestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? 'No se encontraron preguntas' : 'Todas las preguntas fueron agregadas'}
                    </p>
                  ) : (
                    filteredQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="flex items-start justify-between gap-2 p-2 border rounded hover:bg-secondary text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs line-clamp-2">{q.question}</p>
                          <p className="text-xs text-muted-foreground">ID: {q.id}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddQuestion(q.id)}
                          className="flex-shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
