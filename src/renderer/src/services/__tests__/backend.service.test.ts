import { executeCode, validateCode, isBackendReady } from '../backend.service'

const mockFetch = (response: { ok: boolean; status?: number; body?: unknown }) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? 200,
    json: () => Promise.resolve(response.body)
  }) as jest.Mock
}

describe('backend.service', () => {
  afterEach(() => jest.restoreAllMocks())

  describe('executeCode', () => {
    it('returns stdout and success on a passing run', async () => {
      mockFetch({ ok: true, body: { stdout: 'hello\n', stderr: '', success: true } })
      const result = await executeCode('print("hello")')
      expect(result.stdout).toBe('hello\n')
      expect(result.success).toBe(true)
      expect(result.stderr).toBe('')
    })

    it('includes turtle mode flag when backend returns it', async () => {
      mockFetch({ ok: true, body: { stdout: '', stderr: '', success: true, mode: 'turtle', message: '🐢 Turtle window opened!' } })
      const result = await executeCode('import turtle\nt = turtle.Turtle()')
      expect(result.mode).toBe('turtle')
      expect(result.message).toContain('Turtle')
    })

    it('throws when the backend returns a non-ok status', async () => {
      mockFetch({ ok: false, status: 500 })
      await expect(executeCode('bad')).rejects.toThrow('Backend error: 500')
    })

    it('sends the code in the POST body', async () => {
      mockFetch({ ok: true, body: { stdout: '', stderr: '', success: true } })
      await executeCode('x = 42')
      const call = (global.fetch as jest.Mock).mock.calls[0]
      const body = JSON.parse(call[1].body)
      expect(body.code).toBe('x = 42')
    })
  })

  describe('validateCode', () => {
    it('returns valid: true for correct Python', async () => {
      mockFetch({ ok: true, body: { valid: true } })
      const result = await validateCode('x = 1\nprint(x)')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('returns valid: false with error and line number', async () => {
      mockFetch({ ok: true, body: { valid: false, error: 'Missing colon', line: 2 } })
      const result = await validateCode('def foo()\n  pass')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Missing colon')
      expect(result.line).toBe(2)
    })

    it('throws on non-ok response', async () => {
      mockFetch({ ok: false, status: 422 })
      await expect(validateCode('')).rejects.toThrow('Backend error: 422')
    })
  })

  describe('isBackendReady', () => {
    it('returns true when /health responds ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true }) as jest.Mock
      expect(await isBackendReady()).toBe(true)
    })

    it('returns false when fetch throws (connection refused)', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED')) as jest.Mock
      expect(await isBackendReady()).toBe(false)
    })

    it('returns false when /health returns non-ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false }) as jest.Mock
      expect(await isBackendReady()).toBe(false)
    })
  })
})
