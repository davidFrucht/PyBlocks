#!/usr/bin/env python3
"""Start the PyBlocks IDE: FastAPI backend + Electron frontend."""
import os
import subprocess
import sys
import signal
import time
from pathlib import Path

ROOT = Path(__file__).parent
BACKEND_DIR = ROOT / "backend"

# Use the project venv if it exists, otherwise fall back to system python
VENV_PYTHON = ROOT / ".venv" / "bin" / "python3"
PYTHON = str(VENV_PYTHON) if VENV_PYTHON.exists() else sys.executable


def check_dependencies():
    missing = []

    # Check Node / npm
    if subprocess.run(["npm", "--version"], capture_output=True).returncode != 0:
        missing.append("npm  →  install Node.js from https://nodejs.org")

    # Check node_modules
    if not (ROOT / "node_modules").exists():
        missing.append("node_modules  →  run:  npm install")

    # Check FastAPI
    result = subprocess.run(
        [PYTHON, "-c", "import fastapi, uvicorn"],
        capture_output=True,
    )
    if result.returncode != 0:
        missing.append("fastapi/uvicorn  →  run:  pip install -r backend/requirements.txt")

    if missing:
        print("Missing dependencies:")
        for m in missing:
            print(f"  • {m}")
        sys.exit(1)


def main():
    check_dependencies()

    processes = []

    def shutdown(sig=None, frame=None):
        print("\nShutting down…")
        for p in processes:
            try:
                p.terminate()
            except Exception:
                pass
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    # Start backend
    print("Starting backend  →  http://127.0.0.1:8000")
    backend = subprocess.Popen(
        [PYTHON, "app.py"],
        cwd=BACKEND_DIR,
    )
    processes.append(backend)
    time.sleep(1)  # give uvicorn a moment before Electron tries to connect

    # Start Electron
    print("Starting Electron IDE…")
    frontend = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=ROOT,
    )
    processes.append(frontend)

    # Wait for either process to exit
    while True:
        if backend.poll() is not None:
            print("Backend exited unexpectedly.")
            shutdown()
        if frontend.poll() is not None:
            print("Electron closed.")
            shutdown()
        time.sleep(1)


if __name__ == "__main__":
    main()
