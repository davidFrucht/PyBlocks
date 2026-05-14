import React, { useState, useCallback, useRef, useEffect } from 'react'
import * as Blockly from 'blockly'
import { BlockEditor } from './components/BlockEditor'
import { CodeEditor } from './components/CodeEditor'
import { Toolbar, type BackendStatus } from './components/Toolbar'
import { OutputPanel } from './components/OutputPanel'
import { workspaceToXml, xmlToWorkspace } from './services/sync-manager'
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage
} from './services/storage.service'
import {
  executeCode,
  validateCode,
  isBackendReady,
  type ExecuteResult
} from './services/backend.service'
import { EXAMPLES, type Example } from './services/examples'
import { LESSONS, type Lesson } from './services/lessons'
import { LessonModal } from './components/LessonModal'
import type { Project } from './types'

// Side-effect: registers custom blocks with Blockly
import './services/blockly-config'

const EMPTY_XML = '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'

export default function App(): JSX.Element {
  const [pythonCode, setPythonCode] = useState<string>('')
  const [isSaved, setIsSaved] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('connecting')
  const [runResult, setRunResult] = useState<ExecuteResult | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [validationLine, setValidationLine] = useState<number | null>(null)
  const [splitPercent, setSplitPercent] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [lessonsOpen, setLessonsOpen] = useState(false)

  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const validateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mainAreaRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  // ── Backend readiness poll ─────────────────────────────────────────────────
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
    const giveUp = setTimeout(() => {
      if (!cancelled) setBackendStatus('error')
    }, 30000)
    return () => { cancelled = true; clearTimeout(giveUp) }
  }, [])

  // ── Resizable divider ──────────────────────────────────────────────────────
  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    setIsDragging(true)
    e.preventDefault()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !mainAreaRef.current) return
      const rect = mainAreaRef.current.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      setSplitPercent(Math.max(25, Math.min(75, pct)))
    }
    const handleMouseUp = () => {
      isDraggingRef.current = false
      setIsDragging(false)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // ── Validation (debounced 600ms) ───────────────────────────────────────────
  const scheduleValidation = useCallback((code: string) => {
    if (validateTimerRef.current) clearTimeout(validateTimerRef.current)
    if (!code.trim()) { setValidationError(null); setValidationLine(null); return }
    validateTimerRef.current = setTimeout(async () => {
      if (backendStatus !== 'ready') return
      try {
        const result = await validateCode(code)
        setValidationError(result.valid ? null : (result.error ?? 'Syntax error'))
        setValidationLine(result.valid ? null : (result.line ?? null))
      } catch {
        // Backend unreachable — ignore
      }
    }, 600)
  }, [backendStatus])

  // ── Auto-save to localStorage (debounced 1s) ───────────────────────────────
  const scheduleAutosave = useCallback((code: string) => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(() => {
      if (workspaceRef.current) {
        saveToLocalStorage(workspaceToXml(workspaceRef.current), code)
      }
    }, 1000)
  }, [])

  const handleCodeChange = useCallback((code: string) => {
    setPythonCode(code)
    setIsSaved(false)
    scheduleValidation(code)
    scheduleAutosave(code)
  }, [scheduleValidation, scheduleAutosave])

  const handleWorkspaceReady = useCallback((ws: Blockly.WorkspaceSvg) => {
    workspaceRef.current = ws
    // Restore last autosave silently
    const saved = loadFromLocalStorage()
    if (saved && saved.xml && saved.xml !== EMPTY_XML) {
      try {
        xmlToWorkspace(ws, saved.xml)
        setPythonCode(saved.code)
      } catch {
        // Corrupted autosave — ignore
      }
    }
  }, [])

  // ── File operations ────────────────────────────────────────────────────────
  const handleNew = useCallback(() => {
    if (!workspaceRef.current) return
    if (confirm('Start a new project? Unsaved changes will be lost.')) {
      workspaceRef.current.clear()
      setPythonCode('')
      setIsSaved(false)
      setRunResult(null)
      setValidationError(null)
      setValidationLine(null)
      clearLocalStorage()
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

  // ── Run ────────────────────────────────────────────────────────────────────
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

  // ── Open project ───────────────────────────────────────────────────────────
  const handleOpen = useCallback((_: unknown, data: unknown) => {
    if (!workspaceRef.current) return
    const project = data as Project
    xmlToWorkspace(workspaceRef.current, project.blocklyXml || EMPTY_XML)
    setPythonCode(project.pythonCode || '')
    setIsSaved(true)
    setRunResult(null)
    setValidationError(null)
    setValidationLine(null)
  }, [])

  // ── Load example ───────────────────────────────────────────────────────────
  const handleLoadExample = useCallback((example: Example) => {
    if (!workspaceRef.current) return
    if (pythonCode && !confirm(`Load "${example.name}"? Current blocks will be replaced.`)) return
    xmlToWorkspace(workspaceRef.current, example.xml)
    setIsSaved(false)
    setRunResult(null)
  }, [pythonCode])

  // ── Load lesson starter ────────────────────────────────────────────────────
  const handleLoadLesson = useCallback((lesson: Lesson) => {
    if (!workspaceRef.current) return
    xmlToWorkspace(workspaceRef.current, lesson.starterXml)
    setIsSaved(false)
    setRunResult(null)
  }, [])

  // ── Menu IPC listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    window.api.onMenuNew(handleNew)
    window.api.onMenuSave(handleSave)
    window.api.onMenuExport(handleExport)
    window.api.onMenuRun(handleRun)
    window.api.onMenuOpen(handleOpen)
  }, [handleNew, handleSave, handleExport, handleRun, handleOpen])

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white select-none">
      <Toolbar
        onNew={handleNew}
        onSave={handleSave}
        onExport={handleExport}
        onRun={handleRun}
        onLoadExample={handleLoadExample}
        onOpenLessons={() => setLessonsOpen(true)}
        isSaved={isSaved}
        isRunning={isRunning}
        backendStatus={backendStatus}
        examples={EXAMPLES}
      />

      <div
        ref={mainAreaRef}
        className="flex flex-1 overflow-hidden"
        style={{ cursor: isDragging ? 'col-resize' : undefined }}
      >
        {/* Left: Blockly */}
        <div
          className="overflow-hidden flex-shrink-0"
          style={{
            width: `${splitPercent}%`,
            pointerEvents: isDragging ? 'none' : undefined
          }}
        >
          <BlockEditor
            onCodeChange={handleCodeChange}
            onWorkspaceReady={handleWorkspaceReady}
          />
        </div>

        {/* Drag divider */}
        <div
          className={`panel-divider border-x border-gray-700${isDragging ? ' dragging' : ''}`}
          onMouseDown={handleDividerMouseDown}
        />

        {/* Right: Monaco */}
        <div
          className="overflow-hidden flex-1"
          style={{ pointerEvents: isDragging ? 'none' : undefined }}
        >
          <CodeEditor
            code={pythonCode}
            readOnly={true}
            validationError={validationError}
            errorLine={validationLine}
          />
        </div>
      </div>

      {lessonsOpen && (
        <LessonModal
          lessons={LESSONS}
          onLoadStarter={handleLoadLesson}
          onClose={() => setLessonsOpen(false)}
        />
      )}

      <OutputPanel
        result={runResult}
        isRunning={isRunning}
        validationError={validationError}
        onClear={() => setRunResult(null)}
      />
    </div>
  )
}
