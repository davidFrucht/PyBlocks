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
  workspace.clear()
  const xml = Blockly.Xml.textToDom(xmlText)
  Blockly.Xml.domToWorkspace(xml, workspace)
}

const LS_XML = 'pyblocks_autosave_xml'
const LS_CODE = 'pyblocks_autosave_code'

export function saveToLocalStorage(xml: string, code: string): void {
  try {
    localStorage.setItem(LS_XML, xml)
    localStorage.setItem(LS_CODE, code)
  } catch {
    // Quota exceeded or private browsing — ignore
  }
}

export function loadFromLocalStorage(): { xml: string; code: string } | null {
  try {
    const xml = localStorage.getItem(LS_XML)
    const code = localStorage.getItem(LS_CODE)
    if (xml) return { xml, code: code ?? '' }
  } catch {
    // Ignore
  }
  return null
}

export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(LS_XML)
    localStorage.removeItem(LS_CODE)
  } catch {
    // Ignore
  }
}
