export interface Question {
  id: bigint;
  category_id: bigint;
  question: string;
  options: string[];
  correct_answer: string;
  location?: string;
  code_question?: string;
  difficulty_level?: string;
  created_at: string;
}

export interface Category {
  id: bigint;
  name: string;
  description?: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category_id?: bigint;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_id: bigint;
  order_num: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  total_questions: number;
  created_at: string;
}

export interface Response {
  id: string;
  attempt_id: string;
  question_id: bigint;
  selected_answer: string;
  is_correct: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}
