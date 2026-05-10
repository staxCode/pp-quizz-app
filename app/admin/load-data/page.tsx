'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'

export default function LoadDataPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLoadQuestions = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/load-questions', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'No se pudieron cargar las preguntas')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Cargar datos de ejemplo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Carga las preguntas de ejemplo desde el archivo JSON en la base de datos. Esto poblara la tabla `questions` con preguntas del examen SIECOPOL.
            </p>

            <Button
              onClick={handleLoadQuestions}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                'Cargar preguntas desde JSON'
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Exito</AlertTitle>
                <AlertDescription className="mt-2 space-y-1">
                  <p>{result.message}</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>✓ Cargadas: {result.loaded}</li>
                    <li>⊘ Omitidas: {result.skipped}</li>
                    <li>✗ Fallidas: {result.failed}</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Instrucciones</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                Esta pagina te permite cargar preguntas de ejemplo desde JSON a tu base de datos de Supabase. Es util para pruebas y desarrollo.
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Asegurate de tener `questions.json` en la carpeta `data`</li>
                <li>Haz clic en el boton &quot;Cargar preguntas desde JSON&quot;</li>
                <li>Espera a que termine el proceso</li>
                <li>Revisa el resumen para ver cuantas preguntas se cargaron</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
