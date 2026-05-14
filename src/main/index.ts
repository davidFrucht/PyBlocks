import { app, BrowserWindow, shell, ipcMain, dialog, Menu } from 'electron'
import { join } from 'path'
import { spawn, type ChildProcess } from 'child_process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFileSync, writeFileSync } from 'fs'

let backendProcess: ChildProcess | null = null

function startBackend(): void {
  const backendDir = join(app.getAppPath(), 'backend')
  const python = process.platform === 'win32' ? 'python' : 'python3'
  backendProcess = spawn(python, ['app.py'], {
    cwd: backendDir,
    stdio: 'pipe'
  })
  backendProcess.on('error', (err) => {
    console.warn('Backend failed to start:', err.message)
  })
}

function stopBackend(): void {
  if (backendProcess) {
    backendProcess.kill()
    backendProcess = null
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu:new')
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              filters: [{ name: 'PyBlocks Project', extensions: ['pyblocks'] }]
            })
            if (!result.canceled && result.filePaths[0]) {
              const content = readFileSync(result.filePaths[0], 'utf-8')
              mainWindow.webContents.send('menu:open', JSON.parse(content))
            }
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu:save')
        },
        {
          label: 'Export as Python...',
          accelerator: 'CmdOrCtrl+E',
          click: () => mainWindow.webContents.send('menu:export')
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }] },
    {
      label: 'Run',
      submenu: [
        {
          label: 'Run Code',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.webContents.send('menu:run')
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.davidfrucht.pyblocks')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  startBackend()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  stopBackend()
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', stopBackend)

// IPC: save file dialog
ipcMain.handle('dialog:save', async (_, { defaultName, content }) => {
  const result = await dialog.showSaveDialog({
    defaultPath: defaultName,
    filters: [{ name: 'PyBlocks Project', extensions: ['pyblocks'] }]
  })
  if (!result.canceled && result.filePath) {
    writeFileSync(result.filePath, content, 'utf-8')
    return { success: true, path: result.filePath }
  }
  return { success: false }
})

// IPC: export .py file
ipcMain.handle('dialog:export', async (_, { content }) => {
  const result = await dialog.showSaveDialog({
    defaultPath: 'my_program.py',
    filters: [{ name: 'Python File', extensions: ['py'] }]
  })
  if (!result.canceled && result.filePath) {
    writeFileSync(result.filePath, content, 'utf-8')
    return { success: true, path: result.filePath }
  }
  return { success: false }
})
