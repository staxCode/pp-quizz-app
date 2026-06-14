'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Loader } from '@/components/loader'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageBreadcrumbs } from '@/components/page-breadcrumbs'

export default function EditQuiz() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addingBatch, setAddingBatch] = useState(false)
  const [removingBatch, setRemovingBatch] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedQuizIds, setSelectedQuizIds] = useState<Set<bigint>>(new Set())
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<Set<bigint>>(new Set())
  const [dirty, setDirty] = useState(false)

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
        (q.question.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          q.id.toString().includes(debouncedSearch))
    )
    setFilteredQuestions(filtered)
  }, [debouncedSearch, availableQuestions, quizQuestions])

  useEffect(() => {
    if (!dirty && (title !== quiz?.title || description !== (quiz?.description || ''))) {
      setDirty(true)
    }
  }, [title, description])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  const handleSaveQuiz = async () => {
    if (!quiz) return

    if (!title.trim()) {
      toast.error('El titulo del quiz no puede estar vacio')
      return
    }

    if (quizQuestions.length === 0) {
      toast.error('Debes agregar al menos una pregunta al quiz')
      return
    }

    setSaving(true)
    try {
      await updateQuizAction({ id: quiz.id, title, description: description || undefined })
      setDirty(false)
      toast.success('Quiz guardado. Redirigiendo al dashboard...')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving quiz:', error)
      toast.error('No se pudo guardar el quiz')
    } finally {
      setSaving(false)
    }
  }

  const handleBackToDashboard = () => {
    if (dirty) {
      const confirmed = window.confirm('Tienes cambios sin guardar. ¿Estas seguro de que quieres salir?')
      if (!confirmed) return
    }
    router.push('/dashboard')
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

  const handleAddSelected = async () => {
    if (selectedAvailableIds.size === 0) return
    setAddingBatch(true)
    try {
      const ids = Array.from(selectedAvailableIds)
      await Promise.all(
        ids.map((id, i) => addQuestionToQuizAction(quizId, id, quizQuestions.length + i + 1))
      )
      const added = availableQuestions.filter((q) => selectedAvailableIds.has(q.id))
      setQuizQuestions((prev) => [...prev, ...added])
      setSelectedAvailableIds(new Set())
      toast.success(`${ids.length} pregunta(s) agregada(s)`)
    } catch (error) {
      console.error('Error adding questions:', error)
      toast.error('No se pudieron agregar las preguntas')
    } finally {
      setAddingBatch(false)
    }
  }

  const handleRemoveSelected = async () => {
    if (selectedQuizIds.size === 0) return
    setRemovingBatch(true)
    try {
      const ids = Array.from(selectedQuizIds)
      await Promise.all(ids.map((id) => removeQuestionFromQuizAction(quizId, id)))
      setQuizQuestions((prev) => prev.filter((q) => !selectedQuizIds.has(q.id)))
      setSelectedQuizIds(new Set())
      toast.success(`${ids.length} pregunta(s) eliminada(s)`)
    } catch (error) {
      console.error('Error removing questions:', error)
      toast.error('No se pudieron eliminar las preguntas')
    } finally {
      setRemovingBatch(false)
    }
  }

  const toggleQuizSelection = (id: bigint) => {
    setSelectedQuizIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleAvailableSelection = (id: bigint) => {
    setSelectedAvailableIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const allQuizSelected = quizQuestions.length > 0 && selectedQuizIds.size === quizQuestions.length

  const toggleAllQuiz = () => {
    if (allQuizSelected) {
      setSelectedQuizIds(new Set())
    } else {
      setSelectedQuizIds(new Set(quizQuestions.map((q) => q.id)))
    }
  }

  const allFilteredSelected = filteredQuestions.length > 0 && selectedAvailableIds.size === filteredQuestions.length

  const toggleAllAvailable = () => {
    if (allFilteredSelected) {
      setSelectedAvailableIds(new Set())
    } else {
      setSelectedAvailableIds(new Set(filteredQuestions.map((q) => q.id)))
    }
  }

  if (loading) {
    return <Loader message="Cargando editor..." />
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
        <PageBreadcrumbs items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: quiz?.title || 'Editar quiz' },
        ]} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Settings */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Configuracion del quiz</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
                    Volver al dashboard
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="mb-2 block">Titulo del quiz</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="mb-2 block">Descripcion</Label>
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
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Preguntas del quiz ({quizQuestions.length})
                  </CardTitle>
                  {quizQuestions.length > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="select-all-quiz"
                          checked={allQuizSelected}
                          onCheckedChange={toggleAllQuiz}
                        />
                        <Label htmlFor="select-all-quiz" className="text-sm cursor-pointer">
                          Seleccionar todo
                        </Label>
                      </div>
                      {selectedQuizIds.size > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveSelected}
                          disabled={removingBatch}
                        >
                          {removingBatch ? (
                            'Eliminando...'
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminar ({selectedQuizIds.size})
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {quizQuestions.length === 0 ? (
                  <p className="text-muted-foreground mb-4">
                    Aun no hay preguntas agregadas. Agregalas desde el panel derecho.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {quizQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="flex items-start gap-3 p-3 border rounded"
                      >
                        <Checkbox
                          checked={selectedQuizIds.has(q.id)}
                          onCheckedChange={() => toggleQuizSelection(q.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {idx + 1}. {q.question}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {q.id}
                          </p>
                        </div>
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

                {filteredQuestions.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="select-all-available"
                        checked={allFilteredSelected}
                        onCheckedChange={toggleAllAvailable}
                      />
                      <Label htmlFor="select-all-available" className="text-sm cursor-pointer">
                        Seleccionar todo
                      </Label>
                    </div>
                    {selectedAvailableIds.size > 0 && (
                      <Button
                        size="sm"
                        onClick={handleAddSelected}
                        disabled={addingBatch}
                      >
                        {addingBatch ? (
                          'Agregando...'
                        ) : (
                          <>
                            <Plus className="w-3 h-3 mr-1" />
                            Agregar ({selectedAvailableIds.size})
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredQuestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? 'No se encontraron preguntas' : 'Todas las preguntas fueron agregadas'}
                    </p>
                  ) : (
                    filteredQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="flex items-start gap-2 p-2 border rounded hover:bg-secondary text-sm"
                      >
                        <Checkbox
                          checked={selectedAvailableIds.has(q.id)}
                          onCheckedChange={() => toggleAvailableSelection(q.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="font-medium text-xs line-clamp-2 cursor-default">{q.question}</p>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-md">
                              <p>{q.question}</p>
                            </TooltipContent>
                          </Tooltip>
                          <p className="text-xs text-muted-foreground">ID: {q.id}</p>
                        </div>
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
