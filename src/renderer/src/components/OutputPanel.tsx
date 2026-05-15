import React, { useCallback } from 'react'
import type { ExecuteResult } from '../services/backend.service'
import type { TurtleCommand } from '../types'
import { TurtleCanvas } from './TurtleCanvas'

interface OutputPanelProps {
  result: ExecuteResult | null
  isRunning: boolean
  validationError: string | null
  onClear: () => void
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  result,
  isRunning,
  validationError,
  onClear,
}) => {
  const handleCopy = useCallback(() => {
    if (result?.stdout) navigator.clipboard.writeText(result.stdout)
  }, [result])

  const commands: TurtleCommand[] = result?.commands ?? []
  const hasCanvas = commands.length > 0
  const hasText = !!(result?.stdout || result?.stderr)

  // ── Running ────────────────────────────────────────────────────────────────
  if (isRunning) {
    return (
      <div className="h-10 bg-gray-950 border-t border-gray-700 flex items-center px-4">
        <span className="text-gray-400 text-sm animate-pulse">Running…</span>
      </div>
    )
  }

  // ── Validation error (no run result yet) ──────────────────────────────────
  if (!result && validationError) {
    return (
      <div className="h-16 bg-gray-950 border-t border-gray-700 px-4 py-2 overflow-auto">
        <span className="text-xs text-yellow-400 font-semibold">Syntax problem: </span>
        <span className="text-sm text-red-300">{validationError}</span>
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!result) {
    return (
      <div className="h-10 bg-gray-950 border-t border-gray-700 flex items-center px-4">
        <span className="text-gray-600 text-sm">Press ▶ Run to execute your code</span>
      </div>
    )
  }

  // ── Console-only output (no canvas) ───────────────────────────────────────
  if (!hasCanvas) {
    return (
      <div className="h-28 bg-gray-950 border-t border-gray-700 flex flex-col overflow-hidden">
        <ConsoleHeader result={result} onCopy={handleCopy} onClear={onClear} />
        <div className="flex-1 overflow-auto px-4 py-2 font-mono text-sm leading-relaxed">
          {result.stdout && <pre className="text-green-300 whitespace-pre-wrap">{result.stdout}</pre>}
          {result.stderr && <pre className="text-red-400 whitespace-pre-wrap">{result.stderr}</pre>}
          {!result.stdout && !result.stderr && result.success && (
            <span className="text-gray-500">Program finished with no output.</span>
          )}
        </div>
      </div>
    )
  }

  // ── Canvas + optional console ─────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-gray-950 border-t border-gray-700 overflow-hidden"
      style={{ maxHeight: '480px' }}>
      <TurtleCanvas commands={commands} />
      {hasText && (
        <div className="flex flex-col" style={{ maxHeight: '96px', minHeight: '40px' }}>
          <ConsoleHeader result={result} onCopy={handleCopy} onClear={onClear} />
          <div className="flex-1 overflow-auto px-4 py-1 font-mono text-sm">
            {result.stdout && <pre className="text-green-300 whitespace-pre-wrap">{result.stdout}</pre>}
            {result.stderr && <pre className="text-red-400 whitespace-pre-wrap">{result.stderr}</pre>}
          </div>
        </div>
      )}
      {!hasText && (
        <div className="flex justify-end px-3 py-1">
          <button onClick={onClear} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

// ── Shared console header ──────────────────────────────────────────────────────
const ConsoleHeader: React.FC<{
  result: ExecuteResult
  onCopy: () => void
  onClear: () => void
}> = ({ result, onCopy, onClear }) => (
  <div className="flex items-center gap-2 px-4 py-1 border-b border-gray-800 flex-shrink-0">
    <span className={`w-2 h-2 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="text-xs text-gray-400 font-medium">Console</span>
    <div className="flex-1" />
    {result.stdout && (
      <button onClick={onCopy} className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2">
        Copy
      </button>
    )}
    <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2">
      Clear
    </button>
  </div>
)
