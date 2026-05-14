import React, { useState, useCallback, useRef, useEffect } from 'react'
import * as Blockly from 'blockly'
import { BlockEditor } from './components/BlockEditor'
import { CodeEditor } from './components/CodeEditor'
import { Toolbar, type BackendStatus } from './components/Toolbar'
import { OutputPanel } from './components/OutputPanel'
import { workspaceToXml, xmlToWorkspace } from './services/sync-manager'
import {
  executeCode,
  validateCode,
  isBackendReady,
  type ExecuteResult
} from './services/backend.service'
import type { Project } from './types'

// Side-effect import: registers custom blocks with Blockly
import './services/blockly-config'

const EMPTY_XML = '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'

export default function App(): JSX.Element {
  const [pythonCode, setPythonCode] = useState<string>('')
  const [isSaved, setIsSaved] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('connecting')
  const [runResult, setRunResult] = useState<ExecuteResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const validateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Poll for backend readiness
  useEffect(() => {
    let cancelled = false
    const poll = async (): Promise<void> => {
      const ready = await isBackendReady()
      if (cancelled) return
      if (ready) {
        setBackendStatus('ready')
      } else {
        setTimeout(poll, 2000)
      }
    }
    poll()
    // After 30s without success, mark as error
    const giveUp = setTimeout(() => {
      if (!cancelled) setBackendStatus('error')
    }, 30000)
    return () => {
      cancelled = true
      clearTimeout(giveUp)
    }
  }, [])

  // Validate code 600ms after it changes
  const scheduleValidation = useCallback((code: string) => {
    if (validateTimerRef.current) clearTimeout(validateTimerRef.current)
    if (!code.trim() || backendStatus !== 'ready') {
      setValidationError(null)
      return
    }
    validateTimerRef.current = setTimeout(async () => {
      try {
        const result = await validateCode(code)
        setValidationError(result.valid ? null : (result.error ?? 'Syntax error'))
      } catch {
        // backend not reachable — ignore silently
      }
    }, 600)
  }, [backendStatus])

  const handleCodeChange = useCallback((code: string) => {
    setPythonCode(code)
    setIsSaved(false)
    scheduleValidation(code)
  }, [scheduleValidation])

  const handleWorkspaceReady = useCallback((ws: Blockly.WorkspaceSvg) => {
    workspaceRef.current = ws
  }, [])

  const handleNew = useCallback(() => {
    if (!workspaceRef.current) return
    if (confirm('Start a new project? Unsaved changes will be lost.')) {
      workspaceRef.current.clear()
      setPythonCode('')
      setIsSaved(false)
      setRunResult(null)
      setValidationError(null)
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

  const handleRun = useCallback(async () => {
    if (!pythonCode || isRunning || backendStatus !== 'ready') return
    setIsRunning(true)
    setRunResult(null)
    try {
      const result = await executeCode(pythonCode)
      setRunResult(result)
    } catch (err) {
      setRunResult({
        stdout: '',
        stderr: err instanceof Error ? err.message : 'Could not reach backend.',
        success: false
      })
    } finally {
      setIsRunning(false)
    }
  }, [pythonCode, isRunning, backendStatus])

  const handleOpen = useCallback((_: unknown, data: unknown) => {
    if (!workspaceRef.current) return
    const project = data as Project
    xmlToWorkspace(workspaceRef.current, project.blocklyXml || EMPTY_XML)
    setPythonCode(project.pythonCode || '')
    setIsSaved(true)
    setRunResult(null)
  }, [])

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
        isRunning={isRunning}
        backendStatus={backendStatus}
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
            validationError={validationError}
          />
        </div>
      </div>

      <OutputPanel
        result={runResult}
        isRunning={isRunning}
        validationError={validationError}
      />
    </div>
  )
}
