'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getQuizzesAction, deleteQuizAction } from '@/features/quiz/actions'
import { getUserAttemptsAction } from '@/features/attempts/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Quiz, QuizAttempt } from '@/lib/types'
import { Navbar } from '@/components/layout/navbar'
import { Plus, BarChart3, BookOpen, CheckCircle, Percent, Play, Pencil, Trash2, ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este quiz?')) return
    try {
      await deleteQuizAction(id)
      setQuizzes(quizzes.filter(q => q.id !== id))
    } catch (error) {
      console.error('Error deleting quiz:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
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
                {quizzes.map((quiz) => (
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
                          <Link href={`/quiz/${quiz.id}/take`}>
                            <Button variant="default" size="sm" className="gap-2">
                              <Play className="w-4 h-4" />
                              Resolver
                            </Button>
                          </Link>
                          <Link href={`/quiz/${quiz.id}/edit`}>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Pencil className="w-4 h-4" />
                              Editar
                            </Button>
                          </Link>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                          onClick={() => handleDeleteQuiz(quiz.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
              <div className="space-y-3">
                {attempts.slice(0, 5).map((attempt) => (
                  <Card key={attempt.id}>
                    <CardContent className="pt-4">
                      <div className="text-sm font-medium mb-1">
                        {quizzes.find((q) => q.id === attempt.quiz_id)?.title || 'Quiz'}
                      </div>
                      {attempt.completed_at ? (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {new Date(attempt.completed_at).toLocaleDateString()}
                          </span>
                          <span className="font-bold text-sm">
                            {attempt.score}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-yellow-600">En progreso</span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
