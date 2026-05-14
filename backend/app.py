"""FastAPI backend: code execution and validation."""
import ast
import subprocess
import sys
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="PyBlocks Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeRequest(BaseModel):
    code: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/validate")
def validate_code(req: CodeRequest):
    try:
        ast.parse(req.code)
        return {"valid": True}
    except SyntaxError as e:
        return {"valid": False, "error": _friendly_error(str(e)), "line": e.lineno}


@app.post("/execute")
def execute_code(req: CodeRequest):
    is_turtle = "import turtle" in req.code or "from turtle" in req.code

    if is_turtle:
        return _execute_turtle(req.code)
    else:
        return _execute_plain(req.code)


def _execute_plain(code: str) -> dict:
    try:
        result = subprocess.run(
            [sys.executable, "-c", code],
            capture_output=True,
            text=True,
            timeout=10,
        )
        return {
            "stdout": result.stdout,
            "stderr": _friendly_error(result.stderr) if result.stderr else "",
            "success": result.returncode == 0,
            "mode": "output",
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Your code took too long to run (10 second limit). Check for infinite loops!",
            "success": False,
            "mode": "output",
        }
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "success": False, "mode": "output"}


def _execute_turtle(code: str) -> dict:
    """Run turtle code in a detached subprocess so the window stays open."""
    try:
        proc = subprocess.Popen(
            [sys.executable, "-c", code],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        # Give it 0.8s to crash on import or syntax errors
        time.sleep(0.8)
        if proc.poll() is not None:
            stdout, stderr = proc.communicate()
            return {
                "stdout": stdout,
                "stderr": _friendly_error(stderr) if stderr else "",
                "success": proc.returncode == 0,
                "mode": "turtle",
            }
        # Still running — turtle window is open
        return {
            "stdout": "",
            "stderr": "",
            "success": True,
            "mode": "turtle",
            "message": "🐢 Turtle window opened! Watch your drawing appear.",
        }
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "success": False, "mode": "turtle"}


def _friendly_error(msg: str) -> str:
    replacements = {
        "SyntaxError: ": "",
        "unexpected EOF while parsing": "Something looks incomplete — are you missing a colon?",
        "invalid syntax": "Something looks wrong here — check for typos or missing colons",
        "NameError": "Name error",
        "IndentationError": "Indentation error — check your spaces or tabs",
        "ZeroDivisionError": "You tried to divide by zero!",
        "TypeError": "Type error",
    }
    for k, v in replacements.items():
        msg = msg.replace(k, v)
    return msg.strip()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")
