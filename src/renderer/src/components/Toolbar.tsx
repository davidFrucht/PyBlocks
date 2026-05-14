import React, { useState, useRef, useEffect } from 'react'
import type { Example } from '../services/examples'

export type BackendStatus = 'connecting' | 'ready' | 'error'

interface ToolbarProps {
  onNew: () => void
  onSave: () => void
  onExport: () => void
  onRun: () => void
  onLoadExample: (example: Example) => void
  isSaved: boolean
  isRunning: boolean
  backendStatus: BackendStatus
  examples: Example[]
}

const statusLabel: Record<BackendStatus, string> = {
  connecting: 'Connecting…',
  ready: 'Backend ready',
  error: 'Backend offline'
}

const statusDot: Record<BackendStatus, string> = {
  connecting: 'bg-yellow-400 animate-pulse',
  ready: 'bg-green-500',
  error: 'bg-red-500'
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onNew,
  onSave,
  onExport,
  onRun,
  onLoadExample,
  isSaved,
  isRunning,
  backendStatus,
  examples
}) => {
  const [examplesOpen, setExamplesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!examplesOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExamplesOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [examplesOpen])

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-700 flex-shrink-0">
      <span className="text-white font-bold text-sm mr-4">🐢 PyBlocks</span>

      <button
        onClick={onNew}
        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
      >
        New
      </button>
      <button
        onClick={onSave}
        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
      >
        {isSaved ? 'Saved ✓' : 'Save'}
      </button>
      <button
        onClick={onExport}
        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
      >
        Export .py
      </button>

      {/* Examples dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setExamplesOpen((v) => !v)}
          className="px-3 py-1 text-xs bg-indigo-700 hover:bg-indigo-600 text-white rounded transition-colors"
        >
          Examples ▾
        </button>
        {examplesOpen && (
          <div className="absolute left-0 top-full mt-1 w-52 bg-gray-800 border border-gray-600 rounded shadow-lg z-50">
            {examples.map((ex) => (
              <button
                key={ex.name}
                onClick={() => { onLoadExample(ex); setExamplesOpen(false) }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
              >
                <div className="text-xs text-white font-medium">{ex.name}</div>
                <div className="text-xs text-gray-400">{ex.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5 mr-3">
        <span className={`w-2 h-2 rounded-full ${statusDot[backendStatus]}`} />
        <span className="text-xs text-gray-500">{statusLabel[backendStatus]}</span>
      </div>

      <button
        onClick={onRun}
        disabled={isRunning || backendStatus !== 'ready'}
        className={`px-4 py-1 text-xs text-white rounded font-medium transition-colors
          ${isRunning || backendStatus !== 'ready'
            ? 'bg-gray-600 cursor-not-allowed opacity-60'
            : 'bg-green-600 hover:bg-green-500'
          }`}
      >
        {isRunning ? '⏳ Running…' : '▶ Run'}
      </button>
    </div>
  )
}
