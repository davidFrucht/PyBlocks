export interface Project {
  version: string
  blocklyXml: string
  pythonCode: string
  createdAt: string
  updatedAt: string
}

export interface ExecuteResult {
  stdout: string
  stderr: string
  success: boolean
}

export interface ValidationResult {
  valid: boolean
  error?: string
  line?: number
}
