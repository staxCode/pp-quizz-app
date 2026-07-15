'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'
import {
  addQuestionsBatchToQuizAction,
  getQuestionsAction,
  getQuizQuestionsAction,
  getQuizzesAction,
  removeQuestionsBatchFromQuizAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedQuizIds, setSelectedQuizIds] = useState<Set<bigint>>(new Set())
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<Set<bigint>>(new Set())
  const [dirty, setDirty] = useState(false)
  const [addedQuestions, setAddedQuestions] = useState<Question[]>([])
  const [removedQuestionIds, setRemovedQuestionIds] = useState<Set<bigint>>(new Set())
  const [displayLimit, setDisplayLimit] = useState<number>(50)
  const [idRangeMin, setIdRangeMin] = useState<string>('')
  const [idRangeMax, setIdRangeMax] = useState<string>('')

  const displayedQuizQuestions = useMemo(
    () => [
      ...quizQuestions.filter((q) => !removedQuestionIds.has(q.id)),
      ...addedQuestions,
    ],
    [quizQuestions, removedQuestionIds, addedQuestions]
  )

  const limitedFilteredQuestions = useMemo(
    () => filteredQuestions.slice(0, displayLimit),
    [filteredQuestions, displayLimit]
  )

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
    const min = idRangeMin ? Number(idRangeMin) : null
    const max = idRangeMax ? Number(idRangeMax) : null
    const filtered = availableQuestions.filter(
      (q) =>
        !displayedQuizQuestions.find((qq) => qq.id === q.id) &&
        (q.question.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          q.id.toString().includes(debouncedSearch)) &&
        (min === null || Number(q.id) >= min) &&
        (max === null || Number(q.id) <= max)
    )
    setFilteredQuestions(filtered)
  }, [debouncedSearch, availableQuestions, displayedQuizQuestions, idRangeMin, idRangeMax])

  useEffect(() => {
    const hasChanges =
      title !== quiz?.title ||
      description !== (quiz?.description || '') ||
      addedQuestions.length > 0 ||
      removedQuestionIds.size > 0
    if (!dirty && hasChanges) {
      setDirty(true)
    }
  }, [title, description, addedQuestions, removedQuestionIds, quiz])

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

    const finalQuestions = [
      ...quizQuestions.filter((q) => !removedQuestionIds.has(q.id)),
      ...addedQuestions,
    ]

    if (finalQuestions.length === 0) {
      toast.error('Debes agregar al menos una pregunta al quiz')
      return
    }

    setSaving(true)
    try {
      if (removedQuestionIds.size > 0) {
        await removeQuestionsBatchFromQuizAction(quiz.id, Array.from(removedQuestionIds))
      }

      if (addedQuestions.length > 0) {
        const orderStart = quizQuestions.filter((q) => !removedQuestionIds.has(q.id)).length + 1
        await addQuestionsBatchToQuizAction(
          quiz.id,
          addedQuestions.map((q, i) => ({ questionId: q.id, orderNum: orderStart + i }))
        )
      }

      await updateQuizAction({ id: quiz.id, title, description: description || undefined })
      setDirty(false)
      setAddedQuestions([])
      setRemovedQuestionIds(new Set())
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
    const question = availableQuestions.find((q) => q.id === questionId)
    if (!question) return
    setAddedQuestions((prev) => [...prev, question])
  }

  const handleRemoveQuestion = async (questionId: bigint) => {
    if (addedQuestions.find((q) => q.id === questionId)) {
      setAddedQuestions((prev) => prev.filter((q) => q.id !== questionId))
    } else {
      setRemovedQuestionIds((prev) => new Set(prev).add(questionId))
    }
  }

  const handleAddSelected = async () => {
    if (selectedAvailableIds.size === 0) return
    const added = availableQuestions.filter((q) => selectedAvailableIds.has(q.id))
    setAddedQuestions((prev) => [...prev, ...added])
    setSelectedAvailableIds(new Set())
    toast.success(`${added.length} pregunta(s) agregada(s)`)
  }

  const handleRemoveSelected = async () => {
    if (selectedQuizIds.size === 0) return
    const newRemoved = new Set(removedQuestionIds)
    const newAdded = addedQuestions.filter((q) => !selectedQuizIds.has(q.id))
    selectedQuizIds.forEach((id) => {
      if (quizQuestions.find((q) => q.id === id)) {
        newRemoved.add(id)
      }
    })
    setRemovedQuestionIds(newRemoved)
    setAddedQuestions(newAdded)
    setSelectedQuizIds(new Set())
    toast.success(`${selectedQuizIds.size} pregunta(s) eliminada(s)`)
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

  const allQuizSelected = displayedQuizQuestions.length > 0 && selectedQuizIds.size === displayedQuizQuestions.length

  const toggleAllQuiz = () => {
    if (allQuizSelected) {
      setSelectedQuizIds(new Set())
    } else {
      setSelectedQuizIds(new Set(displayedQuizQuestions.map((q) => q.id)))
    }
  }

  const allFilteredSelected = limitedFilteredQuestions.length > 0 && selectedAvailableIds.size === limitedFilteredQuestions.length

  const toggleAllAvailable = () => {
    if (allFilteredSelected) {
      setSelectedAvailableIds(new Set())
    } else {
      setSelectedAvailableIds(new Set(limitedFilteredQuestions.map((q) => q.id)))
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
                    Preguntas del quiz ({displayedQuizQuestions.length})
                  </CardTitle>
                  {displayedQuizQuestions.length > 0 && (
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
                        >
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar ({selectedQuizIds.size})
                          </>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {displayedQuizQuestions.length === 0 ? (
                  <p className="text-muted-foreground mb-4">
                    Aun no hay preguntas agregadas. Agregalas desde el panel derecho.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {displayedQuizQuestions.map((q, idx) => (
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

                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Mostrar:</Label>
                  <Select
                    value={displayLimit.toString()}
                    onValueChange={(v) => setDisplayLimit(Number(v))}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                      <SelectItem value="9999">Todas</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">
                    ({filteredQuestions.length} resultados)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Rango ID:</Label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={idRangeMin}
                    onChange={(e) => setIdRangeMin(e.target.value)}
                    className="w-[80px]"
                    min={0}
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={idRangeMax}
                    onChange={(e) => setIdRangeMax(e.target.value)}
                    className="w-[80px]"
                    min={0}
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
                      >
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Agregar ({selectedAvailableIds.size})
                        </>
                      </Button>
                    )}
                  </div>
                )}

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {limitedFilteredQuestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? 'No se encontraron preguntas' : 'Todas las preguntas fueron agregadas'}
                    </p>
                  ) : (
                    limitedFilteredQuestions.map((q) => (
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
