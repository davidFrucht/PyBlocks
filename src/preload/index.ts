import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  saveProject: (defaultName: string, content: string) =>
    ipcRenderer.invoke('dialog:save', { defaultName, content }),
  exportPython: (content: string) =>
    ipcRenderer.invoke('dialog:export', { content }),
  onMenuNew: (cb: () => void) => ipcRenderer.on('menu:new', cb),
  onMenuOpen: (cb: (_: unknown, data: unknown) => void) =>
    ipcRenderer.on('menu:open', cb),
  onMenuSave: (cb: () => void) => ipcRenderer.on('menu:save', cb),
  onMenuExport: (cb: () => void) => ipcRenderer.on('menu:export', cb),
  onMenuRun: (cb: () => void) => ipcRenderer.on('menu:run', cb)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
}
