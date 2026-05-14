const BASE = 'http://127.0.0.1:8000'

export interface ExecuteResult {
  stdout: string
  stderr: string
  success: boolean
  mode?: 'output' | 'turtle'
  message?: string
}

export interface ValidationResult {
  valid: boolean
  error?: string
  line?: number
}

export async function executeCode(code: string): Promise<ExecuteResult> {
  const res = await fetch(`${BASE}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  if (!res.ok) throw new Error(`Backend error: ${res.status}`)
  return res.json()
}

export async function validateCode(code: string): Promise<ValidationResult> {
  const res = await fetch(`${BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  if (!res.ok) throw new Error(`Backend error: ${res.status}`)
  return res.json()
}

export async function isBackendReady(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`, {
      signal: AbortSignal.timeout(1500)
    })
    return res.ok
  } catch {
    return false
  }
}
