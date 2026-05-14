import * as Blockly from 'blockly'

// ── Block definitions ─────────────────────────────────────────────────────────

Blockly.defineBlocksWithJsonArray([
  // ── Motion ──────────────────────────────────────────────────────────────────
  {
    type: 'py_move_forward',
    message0: 'move forward %1 steps',
    args0: [{ type: 'field_number', name: 'STEPS', value: 50, min: 1 }],
    previousStatement: null, nextStatement: null,
    colour: '#38A169', tooltip: 'Move the turtle forward'
  },
  {
    type: 'py_move_backward',
    message0: 'move backward %1 steps',
    args0: [{ type: 'field_number', name: 'STEPS', value: 50, min: 1 }],
    previousStatement: null, nextStatement: null,
    colour: '#38A169', tooltip: 'Move the turtle backward'
  },
  {
    type: 'py_turn_right',
    message0: 'turn right %1 degrees',
    args0: [{ type: 'field_number', name: 'DEGREES', value: 90, min: 0, max: 360 }],
    previousStatement: null, nextStatement: null,
    colour: '#38A169', tooltip: 'Turn the turtle clockwise'
  },
  {
    type: 'py_turn_left',
    message0: 'turn left %1 degrees',
    args0: [{ type: 'field_number', name: 'DEGREES', value: 90, min: 0, max: 360 }],
    previousStatement: null, nextStatement: null,
    colour: '#38A169', tooltip: 'Turn the turtle counter-clockwise'
  },
  {
    type: 'py_goto',
    message0: 'go to x %1 y %2',
    args0: [
      { type: 'field_number', name: 'X', value: 0 },
      { type: 'field_number', name: 'Y', value: 0 }
    ],
    previousStatement: null, nextStatement: null,
    colour: '#38A169', tooltip: 'Jump the turtle to exact coordinates (0,0 is centre)'
  },
  {
    type: 'py_pen_down',
    message0: 'pen down',
    args0: [],
    previousStatement: null, nextStatement: null,
    colour: '#38A169', tooltip: 'Start drawing'
  },
  {
    type: 'py_pen_up',
    message0: 'pen up',
    args0: [],
    previousStatement: null, nextStatement: null,
    colour: '#38A169', tooltip: 'Stop drawing (move without leaving a line)'
  },
  {
    type: 'py_set_color',
    message0: 'set color to %1',
    args0: [{ type: 'field_colour', name: 'COLOR', colour: '#ff0000' }],
    previousStatement: null, nextStatement: null,
    colour: '#38A169', tooltip: 'Change the pen and fill color'
  },
  {
    type: 'py_pen_size',
    message0: 'set pen size to %1',
    args0: [{ type: 'field_number', name: 'SIZE', value: 2, min: 1, max: 30 }],
    previousStatement: null, nextStatement: null,
    colour: '#38A169', tooltip: 'Make the line thicker or thinner'
  },
  {
    type: 'py_begin_fill',
    message0: 'begin fill',
    args0: [],
    previousStatement: null, nextStatement: null,
    colour: '#38A169', tooltip: 'Start filling a shape with the current color'
  },
  {
    type: 'py_end_fill',
    message0: 'end fill',
    args0: [],
    previousStatement: null, nextStatement: null,
    colour: '#38A169', tooltip: 'Finish filling the shape'
  },
  {
    type: 'py_clear',
    message0: 'clear drawing',
    args0: [],
    previousStatement: null, nextStatement: null,
    colour: '#38A169', tooltip: 'Erase everything on the canvas'
  },

  // ── Control ──────────────────────────────────────────────────────────────────
  {
    type: 'py_repeat',
    message0: 'repeat %1 times',
    args0: [{ type: 'field_number', name: 'TIMES', value: 4, min: 1 }],
    message1: 'do %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null, nextStatement: null,
    colour: '#F5A623', tooltip: 'Repeat the blocks inside a fixed number of times'
  },
  {
    type: 'py_while',
    message0: 'while %1',
    args0: [{ type: 'input_value', name: 'CONDITION', check: 'Boolean' }],
    message1: 'do %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null, nextStatement: null,
    colour: '#F5A623', tooltip: 'Keep repeating as long as the condition is true'
  },
  {
    type: 'py_if',
    message0: 'if %1 then',
    args0: [{ type: 'input_value', name: 'CONDITION', check: 'Boolean' }],
    message1: 'do %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null, nextStatement: null,
    colour: '#E53E3E', tooltip: 'Do something only if the condition is true'
  },
  {
    type: 'py_if_else',
    message0: 'if %1 then',
    args0: [{ type: 'input_value', name: 'CONDITION', check: 'Boolean' }],
    message1: 'do %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    message2: 'else %1',
    args2: [{ type: 'input_statement', name: 'ELSE' }],
    previousStatement: null, nextStatement: null,
    colour: '#E53E3E', tooltip: 'Do one thing if true, another if false'
  },
  {
    type: 'py_wait',
    message0: 'wait %1 seconds',
    args0: [{ type: 'field_number', name: 'SECONDS', value: 1, min: 0 }],
    previousStatement: null, nextStatement: null,
    colour: '#DD6B20', tooltip: 'Pause the program for a set time'
  },

  // ── Output ───────────────────────────────────────────────────────────────────
  {
    type: 'py_say',
    message0: 'say %1',
    args0: [{ type: 'field_input', name: 'TEXT', text: 'Hello!' }],
    previousStatement: null, nextStatement: null,
    colour: '#3182CE', tooltip: 'Print text to the output panel'
  },
  {
    type: 'py_print_var',
    message0: 'print variable %1',
    args0: [{ type: 'field_input', name: 'VAR', text: 'score' }],
    previousStatement: null, nextStatement: null,
    colour: '#3182CE', tooltip: 'Print the value of a variable'
  },

  // ── Variables ────────────────────────────────────────────────────────────────
  {
    type: 'py_set_var',
    message0: 'set %1 to %2',
    args0: [
      { type: 'field_input', name: 'VAR', text: 'score' },
      { type: 'field_number', name: 'VALUE', value: 0 }
    ],
    previousStatement: null, nextStatement: null,
    colour: '#D69E2E', tooltip: 'Create a variable and give it a value'
  },
  {
    type: 'py_change_var',
    message0: 'change %1 by %2',
    args0: [
      { type: 'field_input', name: 'VAR', text: 'score' },
      { type: 'field_number', name: 'AMOUNT', value: 1 }
    ],
    previousStatement: null, nextStatement: null,
    colour: '#D69E2E', tooltip: 'Add a number to a variable (use negative to subtract)'
  },
  {
    type: 'py_var_get',
    message0: 'variable %1',
    args0: [{ type: 'field_input', name: 'VAR', text: 'score' }],
    output: null,
    colour: '#D69E2E', tooltip: 'Use a variable\'s value in another block'
  },

  // ── Math ─────────────────────────────────────────────────────────────────────
  {
    type: 'py_math',
    message0: '%1 %2 %3',
    args0: [
      { type: 'input_value', name: 'A', check: 'Number' },
      {
        type: 'field_dropdown', name: 'OP',
        options: [['+', 'ADD'], ['-', 'SUB'], ['×', 'MUL'], ['÷', 'DIV'], ['mod', 'MOD']]
      },
      { type: 'input_value', name: 'B', check: 'Number' }
    ],
    output: 'Number',
    colour: '#4299E1', tooltip: 'Do arithmetic with two numbers'
  },
  {
    type: 'py_random',
    message0: 'random number from %1 to %2',
    args0: [
      { type: 'field_number', name: 'FROM', value: 1 },
      { type: 'field_number', name: 'TO', value: 10 }
    ],
    output: 'Number',
    colour: '#4299E1', tooltip: 'Pick a random whole number between two values'
  },
  {
    type: 'py_number',
    message0: '%1',
    args0: [{ type: 'field_number', name: 'NUM', value: 10 }],
    output: 'Number',
    colour: '#718096', tooltip: 'A number value'
  },

  // ── Logic ────────────────────────────────────────────────────────────────────
  {
    type: 'py_compare',
    message0: '%1 %2 %3',
    args0: [
      { type: 'input_value', name: 'A' },
      {
        type: 'field_dropdown', name: 'OP',
        options: [['<', 'LT'], ['>', 'GT'], ['=', 'EQ'], ['≠', 'NEQ'], ['≤', 'LTE'], ['≥', 'GTE']]
      },
      { type: 'input_value', name: 'B' }
    ],
    output: 'Boolean',
    colour: '#805AD5', tooltip: 'Compare two values'
  },
  {
    type: 'py_logic_and',
    message0: '%1 and %2',
    args0: [
      { type: 'input_value', name: 'A', check: 'Boolean' },
      { type: 'input_value', name: 'B', check: 'Boolean' }
    ],
    output: 'Boolean',
    colour: '#805AD5', tooltip: 'True only when BOTH conditions are true'
  },
  {
    type: 'py_logic_or',
    message0: '%1 or %2',
    args0: [
      { type: 'input_value', name: 'A', check: 'Boolean' },
      { type: 'input_value', name: 'B', check: 'Boolean' }
    ],
    output: 'Boolean',
    colour: '#805AD5', tooltip: 'True when AT LEAST ONE condition is true'
  },
  {
    type: 'py_logic_not',
    message0: 'not %1',
    args0: [{ type: 'input_value', name: 'A', check: 'Boolean' }],
    output: 'Boolean',
    colour: '#805AD5', tooltip: 'Flip true to false and false to true'
  }
])

// ── Toolbox XML ───────────────────────────────────────────────────────────────

export const TOOLBOX_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="Motion" colour="#38A169">
    <block type="py_move_forward"><field name="STEPS">50</field></block>
    <block type="py_move_backward"><field name="STEPS">50</field></block>
    <block type="py_turn_right"><field name="DEGREES">90</field></block>
    <block type="py_turn_left"><field name="DEGREES">90</field></block>
    <block type="py_goto"><field name="X">0</field><field name="Y">0</field></block>
    <sep gap="8"></sep>
    <block type="py_pen_down"></block>
    <block type="py_pen_up"></block>
    <block type="py_set_color"></block>
    <block type="py_pen_size"><field name="SIZE">2</field></block>
    <sep gap="8"></sep>
    <block type="py_begin_fill"></block>
    <block type="py_end_fill"></block>
    <block type="py_clear"></block>
  </category>
  <category name="Control" colour="#F5A623">
    <block type="py_repeat"><field name="TIMES">4</field></block>
    <block type="py_while"></block>
    <block type="py_if"></block>
    <block type="py_if_else"></block>
    <block type="py_wait"><field name="SECONDS">1</field></block>
  </category>
  <category name="Output" colour="#3182CE">
    <block type="py_say"><field name="TEXT">Hello!</field></block>
    <block type="py_print_var"><field name="VAR">score</field></block>
  </category>
  <category name="Variables" colour="#D69E2E">
    <block type="py_set_var"><field name="VAR">score</field><field name="VALUE">0</field></block>
    <block type="py_change_var"><field name="VAR">score</field><field name="AMOUNT">1</field></block>
    <block type="py_var_get"><field name="VAR">score</field></block>
  </category>
  <category name="Math" colour="#4299E1">
    <block type="py_math"></block>
    <block type="py_random"><field name="FROM">1</field><field name="TO">10</field></block>
    <block type="py_number"><field name="NUM">10</field></block>
  </category>
  <category name="Logic" colour="#805AD5">
    <block type="py_compare"></block>
    <block type="py_logic_and"></block>
    <block type="py_logic_or"></block>
    <block type="py_logic_not"></block>
  </category>
</xml>
`
