import React from 'react'
import MonacoEditor from '@monaco-editor/react'

interface CodeEditorProps {
  code: string
  highlightLine?: number | null
  onChange?: (value: string) => void
  readOnly?: boolean
  validationError?: string | null
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  highlightLine,
  onChange,
  readOnly = false,
  validationError
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-900 text-gray-300 text-xs font-medium px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <span>Python</span>
        {validationError ? (
          <span className="text-xs text-red-400 truncate max-w-xs">{validationError}</span>
        ) : readOnly ? (
          <span className="text-xs text-gray-500 italic">auto-generated from blocks</span>
        ) : null}
      </div>
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(val) => onChange?.(val ?? '')}
          options={{
            readOnly,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            wordWrap: 'on'
          }}
        />
      </div>
    </div>
  )
}
