# PyBlocks — Scratch to Python IDE

A desktop IDE that teaches children (ages 10–16) to transition from visual block programming (Scratch-style) to real Python code.

**Drag a block → Python appears instantly. Click Run → turtle window opens. Export → working `.py` file.**

---

## Features

| Feature | Description |
|---|---|
| Side-by-side editor | Blockly blocks on the left, Monaco Python editor on the right |
| Real-time sync | Every block change regenerates Python code in under 100ms |
| Resizable panels | Drag the divider to resize left/right panels |
| 12 built-in blocks | Motion (move, turn, pen), Control (repeat, if, wait), Output (say), Variables |
| Run button | Executes code via local FastAPI backend; turtle window opens natively |
| Error highlighting | Syntax errors highlighted on the exact line in Monaco |
| Auto-save | Workspace auto-saved to localStorage every second |
| Save / Load | Projects saved as `.pyblocks` (JSON) files |
| Export | Export a standalone, runnable `.py` file |
| 4 starter examples | Draw a square, star, triangle; say hello |
| 3 structured lessons | Loops, If Statements, Variables — each with explanation + challenge |

---

## Quick Start

### Requirements
- Node.js 18+ and npm
- Python 3.9+ (for the backend)

### Run in development

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies (uses the project venv)
.venv/bin/pip install -r backend/requirements.txt
# or: pip install -r backend/requirements.txt

# 3. Start the app (Electron auto-starts the backend)
npm run dev
```

The backend starts automatically when Electron launches. The toolbar shows a green dot when it's ready.

### Run the backend manually (optional)

```bash
python3 backend/app.py
# → Listening on http://127.0.0.1:8000
```

---

## Building for distribution

```bash
# macOS (.dmg — runs on both Intel and Apple Silicon)
npm run dist:mac

# Windows (.exe installer)
npm run dist:win

# Both platforms
npm run dist
```

Output is in `dist-app/`. To add a custom icon, place `build/icon.icns` (macOS) or `build/icon.ico` (Windows) before building.

### Docker (backend only, no turtle/Pygame)

```bash
cd backend
docker build -t pyblocks-backend .
docker run -p 8000:8000 pyblocks-backend
```

---

## Running tests

```bash
npm test                  # run all tests
npm run test:coverage     # with coverage report
```

Tests cover `storage.service` (localStorage round-trips) and `backend.service` (API client with mocked fetch). 16 tests, ~0.7s.

---

## Architecture

```
PyBlocks/
├── src/
│   ├── main/
│   │   └── index.ts          Electron main process: window, menus, file dialogs, backend spawn
│   ├── preload/
│   │   └── index.ts          Context bridge — exposes window.api to React
│   └── renderer/src/
│       ├── App.tsx            Root: state, layout, event wiring
│       ├── components/
│       │   ├── BlockEditor    Blockly workspace (dark/zelos theme)
│       │   ├── CodeEditor     Monaco editor (Python, read-only, error highlighting)
│       │   ├── Toolbar        Buttons + backend status dot + examples dropdown
│       │   ├── OutputPanel    stdout/stderr display + clear/copy
│       │   └── LessonModal    3-lesson browser with challenge + hints
│       └── services/
│           ├── blockly-config.ts     Block definitions + toolbox XML
│           ├── blockly-generator.ts  Custom Blockly→Python code generator
│           ├── sync-manager.ts       Workspace event listener + XML serialization
│           ├── storage.service.ts    localStorage auto-save/restore
│           ├── backend.service.ts    fetch client for /execute, /validate, /health
│           ├── examples.ts           4 starter example block programs
│           └── lessons.ts            3 structured curriculum lessons
├── backend/
│   ├── app.py                FastAPI server: /health, /execute, /validate
│   ├── requirements.txt
│   └── Dockerfile
└── electron-builder.yml      Packaging config (macOS dmg, Windows nsis)
```

### Data flow

```
User drags block
  → Blockly fires 'change' event
  → attachWorkspaceListener() calls generatePython(workspace)
  → generatePython() walks top-level blocks, calls pythonGen.blockToCode()
  → Python string set to React state
  → Monaco re-renders with new code
  → validateCode() called 600ms later → error line highlighted if needed
  
User clicks ▶ Run
  → executeCode(pythonCode) → POST /execute
  → backend: if turtle → Popen (detached window); else subprocess.run
  → stdout/stderr → OutputPanel
```

---

## Block reference

| Block | Python output |
|---|---|
| `move forward N` | `t.forward(N)` |
| `turn right N degrees` | `t.right(N)` |
| `turn left N degrees` | `t.left(N)` |
| `pen down` | `t.pendown()` |
| `pen up` | `t.penup()` |
| `repeat N times` | `for i in range(N):` |
| `if condition then` | `if condition:` |
| `wait X seconds` | `time.sleep(X)` |
| `say "text"` | `print("text")` |
| `set var to value` | `var = value` |
| `number N` | `N` (value input) |
| `A compare B` | `A < B` / `A > B` / `A == B` / `A != B` |

All turtle programs automatically get this header:
```python
import turtle
import time   # only when wait blocks are used

t = turtle.Turtle()
t.speed(3)
screen = turtle.Screen()
screen.bgcolor("white")

# ... your blocks ...

screen.mainloop()
```

---

## Extending with new blocks

1. **Define the block** in `src/renderer/src/services/blockly-config.ts` using `Blockly.defineBlocksWithJsonArray()`
2. **Add it to the toolbox** in the `TOOLBOX_XML` string in the same file
3. **Add a Python generator** in `src/renderer/src/services/blockly-generator.ts`:
   ```typescript
   pythonGen.forBlock['your_block_type'] = function(block) {
     const value = block.getFieldValue('FIELD_NAME')
     return `your_python_code(${value})\n`
   }
   ```
4. No backend changes needed for blocks that generate standard Python.

---

## Teacher's Guide

### Suggested lesson order

1. **Drawing with Loops** (📚 Lessons → "Drawing with Loops")  
   Students see how `repeat` eliminates repeated code. Challenge: draw a square.

2. **Making Decisions** (📚 Lessons → "Making Decisions")  
   Introduce `if` with comparison blocks. Challenge: conditional move.

3. **Storing Information** (📚 Lessons → "Storing Information")  
   Variables as labeled boxes. Challenge: set a score and print it.

4. **Free creation**  
   Students open the app and draw something of their own choice.

5. **Export and run**  
   Use "Export .py" and run the file in a terminal: `python3 my_program.py`  
   This is the moment students realize the blocks *are* Python.

### Classroom tips

- Pair students for the first lesson — one student drags blocks, the other reads the Python
- Challenge fast finishers: can you draw a spiral? A house? A flower?
- The auto-save means students can safely close the lid and return later

---

## Roadmap

- [ ] Python → Blocks (reverse parsing) for Phase 2 two-way sync
- [ ] More block types: lists, functions, colors, random
- [ ] Pygame sprite support (move a character on screen)
- [ ] Cloud save / share project links
- [ ] In-app Python REPL (for typing experiments)
