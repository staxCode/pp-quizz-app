export type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E }

export function success<T>(data: T): Result<T, never> {
  return { ok: true, data }
}

export function failure<E>(error: E): Result<never, E> {
  return { ok: false, error }
}
