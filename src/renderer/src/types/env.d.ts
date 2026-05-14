export {}
declare global {
  interface Window {
    api: {
      saveProject: (name: string, content: string) => Promise<{ success: boolean; path?: string }>
      exportPython: (content: string) => Promise<{ success: boolean; path?: string }>
      onMenuNew: (cb: () => void) => void
      onMenuOpen: (cb: (_: unknown, data: unknown) => void) => void
      onMenuSave: (cb: () => void) => void
      onMenuExport: (cb: () => void) => void
      onMenuRun: (cb: () => void) => void
    }
  }
}
