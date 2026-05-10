import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

interface QuestionData {
  id: number
  question: string
  options: string[]
  correct_answer: string
  location?: string
  code_question?: string
}

async function loadQuestions() {
  try {
    // Read the JSON file
    const jsonPath = path.join(process.cwd(), 'data', 'questions.json')
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const questions: QuestionData[] = JSON.parse(jsonData)

    console.log(`Loading ${questions.length} questions...`)

    for (const q of questions) {
      const { error } = await supabase.from('questions').insert({
        id: q.id,
        category_id: 1, // Default category
        question: q.question,
        options: q.options, // JSONB array
        correct_answer: q.correct_answer,
        location: q.location,
        code_question: q.code_question,
      })

      if (error) {
        console.error(`Error loading question ${q.id}:`, error)
      } else {
        console.log(`Loaded question ${q.id}`)
      }
    }

    console.log('Done!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

loadQuestions()
