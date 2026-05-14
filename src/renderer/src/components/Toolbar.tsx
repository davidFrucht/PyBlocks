import React from 'react'

export type BackendStatus = 'connecting' | 'ready' | 'error'

interface ToolbarProps {
  onNew: () => void
  onSave: () => void
  onExport: () => void
  onRun: () => void
  isSaved: boolean
  isRunning: boolean
  backendStatus: BackendStatus
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
  isSaved,
  isRunning,
  backendStatus
}) => {
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
