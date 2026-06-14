'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getQuizzesAction, deleteQuizAction } from '@/features/quiz/actions'
import { getUserAttemptsAction } from '@/features/attempts/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Quiz, QuizAttempt } from '@/lib/types'
import { Navbar } from '@/components/layout/navbar'
import { Plus, BarChart3, BookOpen, CheckCircle, Percent, Play, Pencil, Trash2, ChevronRight } from 'lucide-react'

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar userEmail={undefined} onLogout={() => {}} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="size-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20 rounded-md" />
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-7 w-40 mb-6" />
            <Card>
              <CardContent className="pt-4 space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 space-y-3">
                <Skeleton className="h-4 w-28" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 space-y-3">
                <Skeleton className="h-4 w-36" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        setUser(authUser)

        const [quizzesData, attemptsData] = await Promise.all([getQuizzesAction(), getUserAttemptsAction()])
        setQuizzes(quizzesData)
        setAttempts(attemptsData)
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  const handleDeleteQuiz = async (quizId: string) => {
    setDeletingId(quizId)
    try {
      await deleteQuizAction(quizId)
      setQuizzes(quizzes.filter(q => q.id !== quizId))
      setAttempts(attempts.filter(a => a.quiz_id !== quizId))
    } catch (error) {
      console.error('Error deleting quiz:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  const completedQuizzes = attempts.filter((a) => a.completed_at).length
  const averageScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar userEmail={user?.email} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Bienvenido de nuevo</h1>
          <p className="text-muted-foreground">Sigue tu progreso y mejora tu conocimiento</p>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Total de quizzes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizzes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Intentos completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedQuizzes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Promedio</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quizzes Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Tus quizzes</h2>
              <Link href="/quiz/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear quiz
                </Button>
              </Link>
            </div>

            {quizzes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">Aun no tienes quizzes</p>
                  <Link href="/quiz/create">
                    <Button>Crea tu primer quiz</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {quizzes.map((quiz) => {
                  const hasPerfectScore = attempts.some(
                    (a) => a.quiz_id === quiz.id && a.completed_at && a.score === 100,
                  )
                  return (
                    <Card key={quiz.id} className="hover:border-primary/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{quiz.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                          </div>
                          <div className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
                            {new Date(quiz.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            {hasPerfectScore ? (
                              <Button variant="secondary" size="sm" className="gap-2" disabled>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Completado
                              </Button>
                            ) : (
                              <Link href={`/quiz/${quiz.id}/take`}>
                                <Button variant="default" size="sm" className="gap-2">
                                  <Play className="w-4 h-4" />
                                  Resolver
                                </Button>
                              </Link>
                            )}
                            <Link href={`/quiz/${quiz.id}/edit`}>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Pencil className="w-4 h-4" />
                                Editar
                              </Button>
                            </Link>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar quiz</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta accion no se puede deshacer. Se eliminara &quot;{quiz.title}&quot; y todos sus intentos asociados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                  disabled={deletingId === quiz.id}
                                >
                                  {deletingId === quiz.id ? 'Eliminando...' : 'Eliminar'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent Attempts */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Intentos recientes</h2>
              {attempts.length > 5 && (
                <Link href="/dashboard/attempts" className="text-sm text-primary hover:underline flex items-center gap-1">
                  Ver todos
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
            {attempts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <BarChart3 className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Aun no tienes intentos</p>
                </CardContent>
              </Card>
            ) : (
              <div className={`flex flex-col gap-5 ${attempts.length > 5 ? 'max-h-[680px] overflow-y-auto pr-2' : ''}`}>
                {attempts.slice(0, 5).map((attempt) => {
                  const quizTitle = quizzes.find((q) => q.id === attempt.quiz_id)?.title || 'Quiz'
                  return attempt.completed_at ? (
                    <Link key={attempt.id} href={`/quiz/${attempt.quiz_id}/results/${attempt.id}`}>
                      <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium mb-1 truncate">{quizTitle}</div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(attempt.completed_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold text-lg">{attempt.score}%</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ) : (
                    <Link key={attempt.id} href={`/quiz/${attempt.quiz_id}/take`}>
                      <Card className="hover:border-yellow-500/50 hover:shadow-md transition-all cursor-pointer border-yellow-500/30">
                        <CardContent className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium mb-1 truncate">{quizTitle}</div>
                            <span className="text-xs text-yellow-600 font-medium">En progreso — Continuar</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-yellow-500 shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
