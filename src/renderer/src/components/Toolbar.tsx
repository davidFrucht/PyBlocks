import React from 'react'

interface ToolbarProps {
  onNew: () => void
  onSave: () => void
  onExport: () => void
  onRun: () => void
  isSaved: boolean
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onNew,
  onSave,
  onExport,
  onRun,
  isSaved
}) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-700">
      <span className="text-white font-bold text-sm mr-4">PyBlocks</span>
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
        {isSaved ? 'Saved' : 'Save'}
      </button>
      <button
        onClick={onExport}
        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
      >
        Export .py
      </button>
      <div className="flex-1" />
      <button
        onClick={onRun}
        className="px-4 py-1 text-xs bg-green-600 hover:bg-green-500 text-white rounded font-medium transition-colors"
      >
        Run
      </button>
    </div>
  )
}
