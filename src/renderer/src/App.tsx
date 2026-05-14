import React, { useState, useCallback, useRef, useEffect } from 'react'
import * as Blockly from 'blockly'
import { BlockEditor } from './components/BlockEditor'
import { CodeEditor } from './components/CodeEditor'
import { Toolbar } from './components/Toolbar'
import { workspaceToXml, xmlToWorkspace } from './services/sync-manager'
import type { Project } from './types'

// Import block definitions (side-effect: registers blocks with Blockly)
import './services/blockly-config'

const EMPTY_XML = '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'

export default function App(): JSX.Element {
  const [pythonCode, setPythonCode] = useState<string>('')
  const [isSaved, setIsSaved] = useState(false)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

  const handleCodeChange = useCallback((code: string) => {
    setPythonCode(code)
    setIsSaved(false)
  }, [])

  const handleWorkspaceReady = useCallback((ws: Blockly.WorkspaceSvg) => {
    workspaceRef.current = ws
  }, [])

  const handleNew = useCallback(() => {
    if (!workspaceRef.current) return
    if (confirm('Start a new project? Unsaved changes will be lost.')) {
      workspaceRef.current.clear()
      setPythonCode('')
      setIsSaved(false)
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!workspaceRef.current) return
    const project: Project = {
      version: '1.0',
      blocklyXml: workspaceToXml(workspaceRef.current),
      pythonCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const result = await window.api.saveProject(
      'my_project.pyblocks',
      JSON.stringify(project, null, 2)
    )
    if (result.success) setIsSaved(true)
  }, [pythonCode])

  const handleExport = useCallback(async () => {
    if (!pythonCode) return
    await window.api.exportPython(pythonCode)
  }, [pythonCode])

  const handleRun = useCallback(() => {
    // Phase 2: send to FastAPI backend
    alert('Run feature coming in Phase 2!\n\nFor now, export the .py file and run it in your terminal.')
  }, [])

  const handleOpen = useCallback(
    (_: unknown, data: unknown) => {
      if (!workspaceRef.current) return
      const project = data as Project
      xmlToWorkspace(workspaceRef.current, project.blocklyXml || EMPTY_XML)
      setPythonCode(project.pythonCode || '')
      setIsSaved(true)
    },
    []
  )

  useEffect(() => {
    window.api.onMenuNew(handleNew)
    window.api.onMenuSave(handleSave)
    window.api.onMenuExport(handleExport)
    window.api.onMenuRun(handleRun)
    window.api.onMenuOpen(handleOpen)
  }, [handleNew, handleSave, handleExport, handleRun, handleOpen])

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <Toolbar
        onNew={handleNew}
        onSave={handleSave}
        onExport={handleExport}
        onRun={handleRun}
        isSaved={isSaved}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Blockly */}
        <div className="w-1/2 border-r border-gray-700 overflow-hidden">
          <BlockEditor
            onCodeChange={handleCodeChange}
            onWorkspaceReady={handleWorkspaceReady}
          />
        </div>
        {/* Right: Monaco */}
        <div className="w-1/2 overflow-hidden">
          <CodeEditor
            code={pythonCode}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  )
}
