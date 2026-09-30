import { config } from '../config'
import type { ProblemDetail } from './types'

const BASE_URL = config.apiUrl

export class ApiError extends Error {
  readonly status: number
  readonly title: string
  readonly detail: string | undefined

  constructor(status: number, title: string, detail?: string) {
    super(`${status}: ${title}`)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.detail = detail
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (!response.ok) {
    let problem: ProblemDetail | null = null
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/problem+json') || contentType.includes('application/json')) {
      try {
        problem = (await response.json()) as ProblemDetail
      } catch {
        // ignoruj błąd parsowania — fallback poniżej
      }
    }
    throw new ApiError(
      response.status,
      problem?.title ?? response.statusText,
      problem?.detail,
    )
  }

  return response.json() as Promise<T>
}
