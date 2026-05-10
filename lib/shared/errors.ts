export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'UnauthorizedError'
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Datos invalidos') {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Accion no permitida') {
    super(message, 'FORBIDDEN', 403)
    this.name = 'ForbiddenError'
  }
}
