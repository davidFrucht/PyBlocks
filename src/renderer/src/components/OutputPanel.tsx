import React, { useCallback } from 'react'
import type { ExecuteResult } from '../services/backend.service'

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
  onClear
}) => {
  const handleCopy = useCallback(() => {
    if (result?.stdout) navigator.clipboard.writeText(result.stdout)
  }, [result])

  const header = (
    <div className="flex items-center gap-2 px-4 py-1 border-b border-gray-800 flex-shrink-0">
      {result && (
        <span className={`w-2 h-2 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`} />
      )}
      <span className="text-xs text-gray-400 font-medium">Output</span>
      {result?.mode === 'turtle' && (
        <span className="text-xs text-blue-400 ml-1">turtle</span>
      )}
      <div className="flex-1" />
      {result?.stdout && (
        <button
          onClick={handleCopy}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2"
          title="Copy output"
        >
          Copy
        </button>
      )}
      {result && (
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2"
          title="Clear output"
        >
          Clear
        </button>
      )}
    </div>
  )

  if (isRunning) {
    return (
      <div className="h-28 bg-gray-950 border-t border-gray-700 flex flex-col overflow-hidden">
        {header}
        <div className="flex-1 flex items-center px-4">
          <span className="text-gray-400 text-sm animate-pulse">Running…</span>
        </div>
      </div>
    )
  }

  if (!result && validationError) {
    return (
      <div className="h-28 bg-gray-950 border-t border-gray-700 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-1 border-b border-gray-800 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-xs text-yellow-400 font-medium">Syntax problem</span>
        </div>
        <div className="flex-1 overflow-auto px-4 py-2">
          <p className="text-sm text-red-300">{validationError}</p>
          <p className="text-xs text-gray-500 mt-1">Fix this before running.</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="h-28 bg-gray-950 border-t border-gray-700 flex items-center px-4">
        <span className="text-gray-600 text-sm">Press ▶ Run to execute your code</span>
      </div>
    )
  }

  const { stdout, stderr, success, mode, message } = result

  return (
    <div className="h-28 bg-gray-950 border-t border-gray-700 flex flex-col overflow-hidden">
      {header}
      <div className="flex-1 overflow-auto px-4 py-2 font-mono text-sm leading-relaxed">
        {mode === 'turtle' && success ? (
          <span className="text-blue-300">{message ?? '🐢 Turtle window opened!'}</span>
        ) : (
          <>
            {stdout && <pre className="text-green-300 whitespace-pre-wrap">{stdout}</pre>}
            {stderr && <pre className="text-red-400 whitespace-pre-wrap">{stderr}</pre>}
            {!stdout && !stderr && success && (
              <span className="text-gray-500">Program finished with no output.</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
