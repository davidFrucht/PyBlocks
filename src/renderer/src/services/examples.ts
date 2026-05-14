export interface Example {
  name: string
  description: string
  xml: string
}

export const EXAMPLES: Example[] = [
  {
    name: 'Draw a square',
    description: 'Use a loop to draw a square',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="py_repeat" x="20" y="20">
    <field name="TIMES">4</field>
    <statement name="DO">
      <block type="py_move_forward">
        <field name="STEPS">100</field>
        <next>
          <block type="py_turn_right">
            <field name="DEGREES">90</field>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`
  },
  {
    name: 'Draw a star',
    description: 'Repeat 5 times with 144° turns',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="py_repeat" x="20" y="20">
    <field name="TIMES">5</field>
    <statement name="DO">
      <block type="py_move_forward">
        <field name="STEPS">120</field>
        <next>
          <block type="py_turn_right">
            <field name="DEGREES">144</field>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`
  },
  {
    name: 'Draw a triangle',
    description: 'Three sides with 120° turns',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="py_repeat" x="20" y="20">
    <field name="TIMES">3</field>
    <statement name="DO">
      <block type="py_move_forward">
        <field name="STEPS">150</field>
        <next>
          <block type="py_turn_right">
            <field name="DEGREES">120</field>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`
  },
  {
    name: 'Say hello',
    description: 'Print a few messages',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="py_say" x="20" y="20">
    <field name="TEXT">Hello, World!</field>
    <next>
      <block type="py_say">
        <field name="TEXT">I am learning Python!</field>
        <next>
          <block type="py_say">
            <field name="TEXT">This is awesome 🎉</field>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>`
  }
]
