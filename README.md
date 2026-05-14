# PyBlocks — Scratch to Python IDE

A desktop IDE that teaches kids (ages 10–16) to transition from visual block programming to Python.

## Features (Phase 1)
- Side-by-side Blockly blocks + Monaco Python editor
- Real-time sync: drag a block → Python code appears instantly
- Motion blocks: move forward, turn left/right, pen up/down
- Control blocks: repeat N times, if/then, wait
- Save/load projects (`.pyblocks` JSON format)
- Export standalone `.py` files

## Running in development

### Frontend (Electron)
```bash
npm install
npm run dev
```

### Backend (FastAPI) — optional for Phase 1
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Tech Stack
- Electron + Vite + React 18 + TypeScript
- Blockly v11 (block editor)
- Monaco Editor (Python code editor)
- FastAPI + Pygame-ce (Phase 2)
