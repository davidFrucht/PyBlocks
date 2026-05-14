export interface Lesson {
  id: string
  title: string
  emoji: string
  goal: string
  explanation: string
  challenge: string
  hints: string[]
  starterXml: string
}

export const LESSONS: Lesson[] = [
  {
    id: 'loops',
    title: 'Drawing with Loops',
    emoji: '🔁',
    goal: 'Learn how to repeat code instead of writing it over and over.',
    explanation:
      'Imagine you want to draw a square. A square has 4 sides — so you need to move forward and turn, 4 times. ' +
      'You could add 8 blocks (move, turn, move, turn…), or you could use a **repeat** block to do it in just 2! ' +
      'Loops are one of the most powerful ideas in programming.',
    challenge:
      'Use ONE repeat block to draw a square. A square has 4 equal sides and 4 right-angle (90°) corners.',
    hints: [
      'Drag a "repeat" block from the Control section',
      'Set it to repeat 4 times',
      'Inside the repeat, add "move forward 100 steps"',
      'After the move, add "turn right 90 degrees"',
      'Both blocks should be INSIDE the repeat block'
    ],
    starterXml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="py_move_forward" x="20" y="20">
    <field name="STEPS">100</field>
  </block>
</xml>`
  },
  {
    id: 'if-statements',
    title: 'Making Decisions',
    emoji: '🤔',
    goal: 'Learn how to make your program do different things based on conditions.',
    explanation:
      'In real life, you make decisions all the time: IF it is raining, THEN take an umbrella. ' +
      'Programs work the same way! An **if** block runs code only when something is true. ' +
      'You combine it with a **compare** block to check things like "is 10 greater than 5?"',
    challenge:
      'Make the turtle draw only if a condition is true. ' +
      'Set a variable called "steps" to 50, then use an if block to move forward ONLY IF steps is greater than 10.',
    hints: [
      'First, drag a "set variable" block and name it "steps", value 50',
      'Drag an "if" block from Control',
      'Drag a "compare" block from Values into the if\'s condition slot',
      'Connect a "number" block (value 50) on the left of the compare',
      'Connect another "number" block (value 10) on the right',
      'Set the operator to ">"',
      'Inside the if, add a "move forward" block'
    ],
    starterXml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="py_set_var" x="20" y="20">
    <field name="VAR">steps</field>
    <field name="VALUE">50</field>
  </block>
</xml>`
  },
  {
    id: 'variables',
    title: 'Storing Information',
    emoji: '📦',
    goal: 'Learn how variables let you store and reuse values.',
    explanation:
      'A variable is like a labeled box. You put a value inside, give the box a name, and then you can use that name anywhere in your program. ' +
      'For example: set "score" to 0, then later add 10 to score, then print score. ' +
      'Variables let your program remember things!',
    challenge:
      'Create a program that: (1) sets a variable called "score" to 0, ' +
      '(2) says "Starting score: 0", (3) sets score to 100, (4) says "New score: 100". ' +
      'Then export it as a .py file and run it in your terminal!',
    hints: [
      'Use two "set variable" blocks — one with value 0, one with value 100',
      'Use "say" blocks to print messages',
      'The blocks run top to bottom, so order matters',
      'Try the Export .py button and run the file with: python3 my_program.py'
    ],
    starterXml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="py_set_var" x="20" y="20">
    <field name="VAR">score</field>
    <field name="VALUE">0</field>
    <next>
      <block type="py_say">
        <field name="TEXT">Starting score: 0</field>
      </block>
    </next>
  </block>
</xml>`
  }
]
