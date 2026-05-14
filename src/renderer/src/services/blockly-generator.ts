import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

const pythonGen = new Blockly.Generator('Python')

pythonGen.scrub_ = function (block: Blockly.Block, code: string): string {
  const nextBlock = block.nextConnection?.targetBlock()
  const nextCode = nextBlock ? pythonGen.blockToCode(nextBlock) : ''
  return code + nextCode
}

// ── Motion ────────────────────────────────────────────────────────────────────

pythonGen.forBlock['py_move_forward'] = function (block: Blockly.Block) {
  return `t.forward(${block.getFieldValue('STEPS') || '50'})\n`
}
pythonGen.forBlock['py_move_backward'] = function (block: Blockly.Block) {
  return `t.backward(${block.getFieldValue('STEPS') || '50'})\n`
}
pythonGen.forBlock['py_turn_right'] = function (block: Blockly.Block) {
  return `t.right(${block.getFieldValue('DEGREES') || '90'})\n`
}
pythonGen.forBlock['py_turn_left'] = function (block: Blockly.Block) {
  return `t.left(${block.getFieldValue('DEGREES') || '90'})\n`
}
pythonGen.forBlock['py_goto'] = function (block: Blockly.Block) {
  const x = block.getFieldValue('X') || '0'
  const y = block.getFieldValue('Y') || '0'
  return `t.goto(${x}, ${y})\n`
}
pythonGen.forBlock['py_pen_down'] = function () { return `t.pendown()\n` }
pythonGen.forBlock['py_pen_up'] = function () { return `t.penup()\n` }
pythonGen.forBlock['py_set_color'] = function (block: Blockly.Block) {
  const color = block.getFieldValue('COLOR') || '#000000'
  return `t.color("${color}")\n`
}
pythonGen.forBlock['py_pen_size'] = function (block: Blockly.Block) {
  return `t.pensize(${block.getFieldValue('SIZE') || '2'})\n`
}
pythonGen.forBlock['py_begin_fill'] = function () { return `t.begin_fill()\n` }
pythonGen.forBlock['py_end_fill'] = function () { return `t.end_fill()\n` }
pythonGen.forBlock['py_clear'] = function () { return `t.clear()\n` }

// ── Control ───────────────────────────────────────────────────────────────────

pythonGen.forBlock['py_repeat'] = function (block: Blockly.Block) {
  const times = block.getFieldValue('TIMES') || '4'
  const inner = pythonGen.statementToCode(block, 'DO') || '    pass\n'
  return `for i in range(${times}):\n${inner}`
}
pythonGen.forBlock['py_while'] = function (block: Blockly.Block) {
  const cond = (pythonGen.valueToCode(block, 'CONDITION', 0) as string) || 'True'
  const inner = pythonGen.statementToCode(block, 'DO') || '    pass\n'
  return `while ${cond}:\n${inner}`
}
pythonGen.forBlock['py_if'] = function (block: Blockly.Block) {
  const cond = (pythonGen.valueToCode(block, 'CONDITION', 0) as string) || 'True'
  const inner = pythonGen.statementToCode(block, 'DO') || '    pass\n'
  return `if ${cond}:\n${inner}`
}
pythonGen.forBlock['py_if_else'] = function (block: Blockly.Block) {
  const cond = (pythonGen.valueToCode(block, 'CONDITION', 0) as string) || 'True'
  const doBlock = pythonGen.statementToCode(block, 'DO') || '    pass\n'
  const elseBlock = pythonGen.statementToCode(block, 'ELSE') || '    pass\n'
  return `if ${cond}:\n${doBlock}else:\n${elseBlock}`
}
pythonGen.forBlock['py_wait'] = function (block: Blockly.Block) {
  return `time.sleep(${block.getFieldValue('SECONDS') || '1'})\n`
}

// ── Output ────────────────────────────────────────────────────────────────────

pythonGen.forBlock['py_say'] = function (block: Blockly.Block) {
  const text = (block.getFieldValue('TEXT') || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `print("${text}")\n`
}
pythonGen.forBlock['py_print_var'] = function (block: Blockly.Block) {
  const varName = block.getFieldValue('VAR') || 'score'
  return `print(${varName})\n`
}

// ── Variables ─────────────────────────────────────────────────────────────────

pythonGen.forBlock['py_set_var'] = function (block: Blockly.Block) {
  const varName = block.getFieldValue('VAR') || 'x'
  const value = block.getFieldValue('VALUE') || '0'
  return `${varName} = ${value}\n`
}
pythonGen.forBlock['py_change_var'] = function (block: Blockly.Block) {
  const varName = block.getFieldValue('VAR') || 'x'
  const amount = block.getFieldValue('AMOUNT') || '1'
  return `${varName} += ${amount}\n`
}
pythonGen.forBlock['py_var_get'] = function (block: Blockly.Block) {
  return [block.getFieldValue('VAR') || 'x', 0]
}

// ── Math ──────────────────────────────────────────────────────────────────────

pythonGen.forBlock['py_math'] = function (block: Blockly.Block) {
  const a = (pythonGen.valueToCode(block, 'A', 0) as string) || '0'
  const b = (pythonGen.valueToCode(block, 'B', 0) as string) || '0'
  const opMap: Record<string, string> = {
    ADD: '+', SUB: '-', MUL: '*', DIV: '/', MOD: '%'
  }
  const op = opMap[block.getFieldValue('OP')] || '+'
  return [`(${a} ${op} ${b})`, 0]
}
pythonGen.forBlock['py_random'] = function (block: Blockly.Block) {
  const from = block.getFieldValue('FROM') || '1'
  const to = block.getFieldValue('TO') || '10'
  return [`random.randint(${from}, ${to})`, 0]
}
pythonGen.forBlock['py_number'] = function (block: Blockly.Block) {
  return [block.getFieldValue('NUM') || '0', 0]
}

// ── Logic ─────────────────────────────────────────────────────────────────────

pythonGen.forBlock['py_compare'] = function (block: Blockly.Block) {
  const a = (pythonGen.valueToCode(block, 'A', 0) as string) || '0'
  const b = (pythonGen.valueToCode(block, 'B', 0) as string) || '0'
  const opMap: Record<string, string> = {
    LT: '<', GT: '>', EQ: '==', NEQ: '!=', LTE: '<=', GTE: '>='
  }
  return [`${a} ${opMap[block.getFieldValue('OP')] ?? '=='}  ${b}`, 0]
}
pythonGen.forBlock['py_logic_and'] = function (block: Blockly.Block) {
  const a = (pythonGen.valueToCode(block, 'A', 0) as string) || 'True'
  const b = (pythonGen.valueToCode(block, 'B', 0) as string) || 'True'
  return [`(${a} and ${b})`, 0]
}
pythonGen.forBlock['py_logic_or'] = function (block: Blockly.Block) {
  const a = (pythonGen.valueToCode(block, 'A', 0) as string) || 'True'
  const b = (pythonGen.valueToCode(block, 'B', 0) as string) || 'True'
  return [`(${a} or ${b})`, 0]
}
pythonGen.forBlock['py_logic_not'] = function (block: Blockly.Block) {
  const a = (pythonGen.valueToCode(block, 'A', 0) as string) || 'True'
  return [`(not ${a})`, 0]
}

// ── Code generation ───────────────────────────────────────────────────────────

/** Generate Python from the Blockly workspace. Imports are inferred from usage. */
export function generatePython(workspace: Blockly.WorkspaceSvg): string {
  const topBlocks = workspace.getTopBlocks(true)
  if (topBlocks.length === 0) {
    return '# Drag blocks from the left panel to start!\n'
  }

  let body = ''
  for (const block of topBlocks) {
    body += pythonGen.blockToCode(block) as string
  }

  const needsTurtle = body.includes('t.')
  const needsTime = body.includes('time.sleep')
  const needsRandom = body.includes('random.randint')

  const imports: string[] = []
  if (needsTurtle) imports.push('import turtle')
  if (needsTime) imports.push('import time')
  if (needsRandom) imports.push('import random')

  const turtleSetup = needsTurtle
    ? '\nt = turtle.Turtle()\nt.speed(3)\nscreen = turtle.Screen()\nscreen.bgcolor("white")\n'
    : ''

  const turtleFooter = needsTurtle ? '\nscreen.mainloop()\n' : ''
  const importBlock = imports.length ? imports.join('\n') : ''

  return `${importBlock}${turtleSetup}\n${body}${turtleFooter}`
}

void javascriptGenerator
