"""FastAPI backend: code execution and validation."""
import ast
import subprocess
import sys
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


@app.post("/validate")
def validate_code(req: CodeRequest):
    try:
        ast.parse(req.code)
        return {"valid": True}
    except SyntaxError as e:
        return {"valid": False, "error": _friendly_error(str(e)), "line": e.lineno}


@app.post("/execute")
def execute_code(req: CodeRequest):
    try:
        result = subprocess.run(
            [sys.executable, "-c", req.code],
            capture_output=True,
            text=True,
            timeout=10,
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "success": result.returncode == 0,
        }
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "Code took too long to run (10s limit).", "success": False}
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "success": False}


def _friendly_error(msg: str) -> str:
    replacements = {
        "SyntaxError": "Syntax error",
        "unexpected EOF": "You might be missing a colon or closing bracket",
        "invalid syntax": "Something looks wrong here — check for typos or missing colons",
    }
    for k, v in replacements.items():
        msg = msg.replace(k, v)
    return msg


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
