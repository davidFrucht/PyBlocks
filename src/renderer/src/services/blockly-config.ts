import * as Blockly from 'blockly'

// ── Custom block definitions ──────────────────────────────────────────────────

Blockly.defineBlocksWithJsonArray([
  // repeat N times
  {
    type: 'py_repeat',
    message0: 'repeat %1 times',
    args0: [{ type: 'field_number', name: 'TIMES', value: 4, min: 1 }],
    message1: 'do %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    nextStatement: null,
    colour: '#F5A623',
    tooltip: 'Repeat the blocks inside a number of times'
  },
  // if condition
  {
    type: 'py_if',
    message0: 'if %1 then',
    args0: [{ type: 'input_value', name: 'CONDITION', check: 'Boolean' }],
    message1: 'do %1',
    args1: [{ type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    nextStatement: null,
    colour: '#E53E3E',
    tooltip: 'Do something only if the condition is true'
  },
  // comparison: number comparison → Boolean
  {
    type: 'py_compare',
    message0: '%1 %2 %3',
    args0: [
      { type: 'input_value', name: 'A', check: 'Number' },
      {
        type: 'field_dropdown',
        name: 'OP',
        options: [['<', 'LT'], ['>', 'GT'], ['=', 'EQ'], ['≠', 'NEQ']]
      },
      { type: 'input_value', name: 'B', check: 'Number' }
    ],
    output: 'Boolean',
    colour: '#805AD5',
    tooltip: 'Compare two numbers'
  },
  // number literal
  {
    type: 'py_number',
    message0: '%1',
    args0: [{ type: 'field_number', name: 'NUM', value: 10 }],
    output: 'Number',
    colour: '#718096',
    tooltip: 'A number'
  },
  // move forward
  {
    type: 'py_move_forward',
    message0: 'move forward %1 steps',
    args0: [{ type: 'field_number', name: 'STEPS', value: 50, min: 1 }],
    previousStatement: null,
    nextStatement: null,
    colour: '#38A169',
    tooltip: 'Move the turtle forward'
  },
  // turn right
  {
    type: 'py_turn_right',
    message0: 'turn right %1 degrees',
    args0: [{ type: 'field_number', name: 'DEGREES', value: 90, min: 0, max: 360 }],
    previousStatement: null,
    nextStatement: null,
    colour: '#38A169',
    tooltip: 'Turn the turtle right'
  },
  // turn left
  {
    type: 'py_turn_left',
    message0: 'turn left %1 degrees',
    args0: [{ type: 'field_number', name: 'DEGREES', value: 90, min: 0, max: 360 }],
    previousStatement: null,
    nextStatement: null,
    colour: '#38A169',
    tooltip: 'Turn the turtle left'
  },
  // say / print
  {
    type: 'py_say',
    message0: 'say %1',
    args0: [{ type: 'field_input', name: 'TEXT', text: 'Hello!' }],
    previousStatement: null,
    nextStatement: null,
    colour: '#3182CE',
    tooltip: 'Print text to the output'
  },
  // wait X seconds
  {
    type: 'py_wait',
    message0: 'wait %1 seconds',
    args0: [{ type: 'field_number', name: 'SECONDS', value: 1, min: 0 }],
    previousStatement: null,
    nextStatement: null,
    colour: '#DD6B20',
    tooltip: 'Pause for a number of seconds'
  },
  // set variable to value
  {
    type: 'py_set_var',
    message0: 'set %1 to %2',
    args0: [
      { type: 'field_input', name: 'VAR', text: 'score' },
      { type: 'field_number', name: 'VALUE', value: 0 }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: '#D69E2E',
    tooltip: 'Set a variable to a value'
  },
  // pen down
  {
    type: 'py_pen_down',
    message0: 'pen down',
    args0: [],
    previousStatement: null,
    nextStatement: null,
    colour: '#38A169',
    tooltip: 'Put the pen down (start drawing)'
  },
  // pen up
  {
    type: 'py_pen_up',
    message0: 'pen up',
    args0: [],
    previousStatement: null,
    nextStatement: null,
    colour: '#38A169',
    tooltip: 'Lift the pen (stop drawing)'
  }
])

// ── Toolbox XML ───────────────────────────────────────────────────────────────

export const TOOLBOX_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="Motion" colour="#38A169">
    <block type="py_move_forward"><field name="STEPS">50</field></block>
    <block type="py_turn_right"><field name="DEGREES">90</field></block>
    <block type="py_turn_left"><field name="DEGREES">90</field></block>
    <block type="py_pen_down"></block>
    <block type="py_pen_up"></block>
  </category>
  <category name="Control" colour="#F5A623">
    <block type="py_repeat"><field name="TIMES">4</field></block>
    <block type="py_if"></block>
    <block type="py_wait"><field name="SECONDS">1</field></block>
  </category>
  <category name="Output" colour="#3182CE">
    <block type="py_say"><field name="TEXT">Hello!</field></block>
  </category>
  <category name="Variables" colour="#D69E2E">
    <block type="py_set_var"></block>
  </category>
  <category name="Values" colour="#718096">
    <block type="py_number"><field name="NUM">10</field></block>
    <block type="py_compare"></block>
  </category>
</xml>
`
