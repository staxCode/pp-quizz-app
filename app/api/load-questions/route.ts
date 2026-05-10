import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Check if this is a development environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
    }

    const supabase = await createClient()

    // Read the JSON file
    const jsonPath = path.join(process.cwd(), 'data', 'questions.json')
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const questions = JSON.parse(jsonData)

    console.log(`[v0] Loading ${questions.length} questions...`)

    let loaded = 0
    let skipped = 0
    let failed = 0

    // First, ensure category exists
    await supabase.from('categories').upsert({
      id: 1,
      name: 'General Knowledge',
      description: 'General knowledge questions',
    })

    for (const q of questions) {
      try {
        // Check if question already exists
        const { data: existing } = await supabase
          .from('questions')
          .select('id')
          .eq('id', q.id)
          .single()

        if (existing) {
          console.log(`[v0] Question ${q.id} already exists, skipping`)
          skipped++
          continue
        }

        const { error } = await supabase.from('questions').insert({
          id: q.id,
          category_id: 1,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          location: q.location || null,
          code_question: q.code_question || null,
        })

        if (error) {
          console.error(`[v0] Error loading question ${q.id}:`, error)
          failed++
        } else {
          loaded++
          if (loaded % 10 === 0) {
            console.log(`[v0] Loaded ${loaded} questions...`)
          }
        }
      } catch (err) {
        console.error(`[v0] Exception for question ${q.id}:`, err)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      loaded,
      skipped,
      failed,
      total: questions.length,
      message: `Successfully loaded ${loaded} questions (${skipped} skipped, ${failed} failed)`,
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: 'Failed to load questions', details: String(error) },
      { status: 500 }
    )
  }
}
