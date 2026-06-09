export function getStudentToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('student_token')
}

export function parseStudentJwt(token: string) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function isStudentAuthenticated(): boolean {
  return !!getStudentToken()
}

export async function studentFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStudentToken()
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message || 'Request failed')
  }

  return res.json()
}
