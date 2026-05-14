import React, { useRef, useEffect } from 'react'
import Editor, { type OnMount, type Monaco } from '@monaco-editor/react'
import type { editor as IEditor } from 'monaco-editor'

interface CodeEditorProps {
  code: string
  errorLine?: number | null
  onChange?: (value: string) => void
  readOnly?: boolean
  validationError?: string | null
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  errorLine,
  onChange,
  readOnly = false,
  validationError
}) => {
  const editorRef = useRef<IEditor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const decorationsRef = useRef<IEditor.IEditorDecorationsCollection | null>(null)

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
  }

  useEffect(() => {
    const ed = editorRef.current
    const mc = monacoRef.current
    decorationsRef.current?.clear()
    decorationsRef.current = null
    if (!ed || !mc || !errorLine || errorLine < 1) return
    decorationsRef.current = ed.createDecorationsCollection([{
      range: new mc.Range(errorLine, 1, errorLine, Number.MAX_SAFE_INTEGER),
      options: { isWholeLine: true, className: 'monaco-error-line' }
    }])
    ed.revealLineInCenter(errorLine)
  }, [errorLine])

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-900 text-gray-300 text-xs font-medium px-4 py-2 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <span>Python</span>
        {validationError ? (
          <span className="text-xs text-red-400 truncate max-w-xs" title={validationError}>
            ⚠ {validationError}
          </span>
        ) : readOnly ? (
          <span className="text-xs text-gray-500 italic">auto-generated from blocks</span>
        ) : null}
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onMount={handleMount}
          onChange={(val) => onChange?.(val ?? '')}
          options={{
            readOnly,
            fontSize: 14,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            wordWrap: 'on',
            glyphMargin: false,
            folding: false
          }}
        />
      </div>
    </div>
  )
}
