export const APP_NAME = 'Quiz Master'
export const APP_DESCRIPTION = 'Pon a prueba tu conocimiento con cuestionarios interactivos'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard',
  QUIZ_CREATE: '/quiz/create',
  QUIZ_EDIT: (id: string) => `/quiz/${id}/edit`,
  QUIZ_TAKE: (id: string) => `/quiz/${id}/take`,
  QUIZ_RESULTS: (id: string, attemptId: string) => `/quiz/${id}/results/${attemptId}`,
  ADMIN_LOAD_DATA: '/admin/load-data',
} as const

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
} as const
