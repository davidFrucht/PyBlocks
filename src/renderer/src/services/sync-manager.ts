import * as Blockly from 'blockly'
import { generatePython } from './blockly-generator'

export type OnCodeChange = (code: string) => void
export type OnHighlight = (lineNumber: number | null) => void

/** Attach a listener to the workspace that regenerates Python on every change. */
export function attachWorkspaceListener(
  workspace: Blockly.WorkspaceSvg,
  onCodeChange: OnCodeChange
): () => void {
  const handler = () => {
    const code = generatePython(workspace)
    onCodeChange(code)
  }

  workspace.addChangeListener(handler)
  return () => workspace.removeChangeListener(handler)
}

/** Serialize workspace to XML string. */
export function workspaceToXml(workspace: Blockly.WorkspaceSvg): string {
  const xml = Blockly.Xml.workspaceToDom(workspace)
  return Blockly.Xml.domToText(xml)
}

/** Load XML string into workspace (clears existing blocks). */
export function xmlToWorkspace(
  workspace: Blockly.WorkspaceSvg,
  xmlText: string
): void {
  // Blockly v11 removed Xml.textToDom — use utils.xml.textToDom instead
  const xml = Blockly.utils.xml.textToDom(xmlText)
  workspace.clear()
  Blockly.Xml.domToWorkspace(xml, workspace)
}

