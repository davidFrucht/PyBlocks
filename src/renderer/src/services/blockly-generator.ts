import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

// We use Blockly's code generation infrastructure but produce Python strings.
// We register our own generator under the name 'Python'.

const pythonGen = new Blockly.Generator('Python')

// Scrub: join this block's code with next block's code
pythonGen.scrub_ = function (block: Blockly.Block, code: string): string {
  const nextBlock = block.nextConnection?.targetBlock()
  const nextCode = nextBlock ? pythonGen.blockToCode(nextBlock) : ''
  return code + nextCode
}

// Block generators
pythonGen.forBlock['py_repeat'] = function (block: Blockly.Block) {
  const times = block.getFieldValue('TIMES') || '4'
  const inner = pythonGen.statementToCode(block, 'DO') || '    pass\n'
  return `for i in range(${times}):\n${inner}`
}

pythonGen.forBlock['py_if'] = function (block: Blockly.Block) {
  const condition =
    (pythonGen.valueToCode(block, 'CONDITION', 0) as string) || 'True'
  const inner = pythonGen.statementToCode(block, 'DO') || '    pass\n'
  return `if ${condition}:\n${inner}`
}

pythonGen.forBlock['py_compare'] = function (block: Blockly.Block) {
  const a = (pythonGen.valueToCode(block, 'A', 0) as string) || '0'
  const b = (pythonGen.valueToCode(block, 'B', 0) as string) || '0'
  const opMap: Record<string, string> = { LT: '<', GT: '>', EQ: '==', NEQ: '!=' }
  const op = opMap[block.getFieldValue('OP')] || '=='
  return [`${a} ${op} ${b}`, 0]
}

pythonGen.forBlock['py_number'] = function (block: Blockly.Block) {
  const num = block.getFieldValue('NUM') || '0'
  return [num, 0]
}

pythonGen.forBlock['py_move_forward'] = function (block: Blockly.Block) {
  const steps = block.getFieldValue('STEPS') || '50'
  return `t.forward(${steps})\n`
}

pythonGen.forBlock['py_turn_right'] = function (block: Blockly.Block) {
  const deg = block.getFieldValue('DEGREES') || '90'
  return `t.right(${deg})\n`
}

pythonGen.forBlock['py_turn_left'] = function (block: Blockly.Block) {
  const deg = block.getFieldValue('DEGREES') || '90'
  return `t.left(${deg})\n`
}

pythonGen.forBlock['py_say'] = function (block: Blockly.Block) {
  const text = block.getFieldValue('TEXT') || ''
  return `print("${text.replace(/"/g, '\\"')}")\n`
}

pythonGen.forBlock['py_wait'] = function (block: Blockly.Block) {
  const secs = block.getFieldValue('SECONDS') || '1'
  return `time.sleep(${secs})\n`
}

pythonGen.forBlock['py_set_var'] = function (block: Blockly.Block) {
  const varName = block.getFieldValue('VAR') || 'x'
  const value = block.getFieldValue('VALUE') || '0'
  return `${varName} = ${value}\n`
}

pythonGen.forBlock['py_pen_down'] = function () {
  return `t.pendown()\n`
}

pythonGen.forBlock['py_pen_up'] = function () {
  return `t.penup()\n`
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Generate Python code from a Blockly workspace. */
export function generatePython(workspace: Blockly.WorkspaceSvg): string {
  const topBlocks = workspace.getTopBlocks(true)
  if (topBlocks.length === 0) {
    return `import turtle\n\nt = turtle.Turtle()\nt.speed(3)\nscreen = turtle.Screen()\nscreen.bgcolor("white")\n\n\nscreen.mainloop()\n`
  }

  let bodyLines = ''
  for (const block of topBlocks) {
    bodyLines += pythonGen.blockToCode(block) as string
  }

  const needsTime = bodyLines.includes('time.sleep')
  const imports = needsTime
    ? `import turtle\nimport time\n`
    : `import turtle\n`

  return `${imports}\nt = turtle.Turtle()\nt.speed(3)\nscreen = turtle.Screen()\nscreen.bgcolor("white")\n\n${bodyLines}\nscreen.mainloop()\n`
}

// Suppress unused import warning — javascriptGenerator is imported so Blockly
// initialises its built-in generator infrastructure.
void javascriptGenerator
