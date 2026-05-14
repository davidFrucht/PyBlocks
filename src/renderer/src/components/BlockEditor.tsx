import React, { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import { TOOLBOX_XML } from '../services/blockly-config'
import { attachWorkspaceListener } from '../services/sync-manager'

interface BlockEditorProps {
  onCodeChange: (code: string) => void
  onWorkspaceReady: (workspace: Blockly.WorkspaceSvg) => void
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  onCodeChange,
  onWorkspaceReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)

  useEffect(() => {
    if (!containerRef.current || workspaceRef.current) return

    const workspace = Blockly.inject(containerRef.current, {
      toolbox: TOOLBOX_XML,
      grid: { spacing: 20, length: 3, colour: '#374151', snap: true },
      zoom: { controls: true, wheel: true, startScale: 1.0 },
      theme: Blockly.Themes.Dark,
      renderer: 'zelos',
      scrollbars: true,
      trashcan: true
    })

    workspaceRef.current = workspace
    onWorkspaceReady(workspace)

    const detach = attachWorkspaceListener(workspace, onCodeChange)
    return () => {
      detach()
      workspace.dispose()
      workspaceRef.current = null
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-900 text-gray-300 text-xs font-medium px-4 py-2 border-b border-gray-700">
        Blocks
      </div>
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  )
}
