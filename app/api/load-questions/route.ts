import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Deshabilitado. Usa el script scripts/load-questions.ts en su lugar.' },
    { status: 403 }
  )
}
