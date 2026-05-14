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
