import React from 'react'
import type { ExecuteResult } from '../services/backend.service'

interface OutputPanelProps {
  result: ExecuteResult | null
  isRunning: boolean
  validationError: string | null
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  result,
  isRunning,
  validationError
}) => {
  if (isRunning) {
    return (
      <div className="h-28 bg-gray-950 border-t border-gray-700 flex items-center px-4">
        <span className="text-gray-400 text-sm animate-pulse">Running...</span>
      </div>
    )
  }

  if (validationError && !result) {
    return (
      <div className="h-28 bg-gray-950 border-t border-gray-700 px-4 py-3 overflow-auto">
        <div className="text-xs text-red-400 font-medium mb-1">Syntax problem</div>
        <div className="text-sm text-red-300">{validationError}</div>
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
      <div className="flex items-center gap-2 px-4 py-1 border-b border-gray-800 flex-shrink-0">
        <span
          className={`w-2 h-2 rounded-full ${success ? 'bg-green-500' : 'bg-red-500'}`}
        />
        <span className="text-xs text-gray-400 font-medium">Output</span>
        {mode === 'turtle' && (
          <span className="text-xs text-blue-400 ml-2">turtle mode</span>
        )}
      </div>

      <div className="flex-1 overflow-auto px-4 py-2 font-mono text-sm leading-relaxed">
        {mode === 'turtle' && success ? (
          <span className="text-blue-300">
            {message ?? 'Turtle window opened! Watch your drawing appear.'}
          </span>
        ) : (
          <>
            {stdout && (
              <pre className="text-green-300 whitespace-pre-wrap">{stdout}</pre>
            )}
            {stderr && (
              <pre className="text-red-400 whitespace-pre-wrap">{stderr}</pre>
            )}
            {!stdout && !stderr && success && (
              <span className="text-gray-500">Program finished with no output.</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
