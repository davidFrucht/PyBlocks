"""FastAPI backend: code execution, validation, and in-app canvas rendering."""
import ast
import io
import random as _random
import subprocess
import sys
import time
import types
from contextlib import contextmanager, redirect_stdout
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


# ── Endpoints ─────────────────────────────────────────────────────────────────

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
    """Execute code. Turtle programs are rendered to an in-app canvas."""
    is_turtle = "import turtle" in req.code or "from turtle" in req.code
    return _execute_canvas(req.code) if is_turtle else _execute_plain(req.code)


# ── Plain execution ───────────────────────────────────────────────────────────

def _execute_plain(code: str) -> dict:
    try:
        result = subprocess.run(
            [sys.executable, "-c", code],
            capture_output=True, text=True, timeout=10,
        )
        return {
            "stdout": result.stdout,
            "stderr": _friendly_error(result.stderr) if result.stderr else "",
            "success": result.returncode == 0,
            "mode": "output",
            "commands": [],
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Your code took too long (10 s limit). Check for infinite loops!",
            "success": False, "mode": "output", "commands": [],
        }
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "success": False, "mode": "output", "commands": []}


# ── Canvas execution (mock turtle) ────────────────────────────────────────────

def _execute_canvas(code: str) -> dict:
    """Run turtle code with a mock turtle and return drawing commands + stdout."""
    commands: list[dict] = []
    stdout_buf = io.StringIO()
    success = True
    stderr = ""

    # ── Mock turtle objects ────────────────────────────────────────────────────

    class MockTurtle:
        def forward(self, n):    commands.append({"cmd": "forward",  "n": float(n)})
        def backward(self, n):   commands.append({"cmd": "backward", "n": float(n)})
        def right(self, n):      commands.append({"cmd": "right",    "n": float(n)})
        def left(self, n):       commands.append({"cmd": "left",     "n": float(n)})
        def pendown(self):       commands.append({"cmd": "pendown"})
        def penup(self):         commands.append({"cmd": "penup"})
        def begin_fill(self):    commands.append({"cmd": "begin_fill"})
        def end_fill(self):      commands.append({"cmd": "end_fill"})
        def clear(self):         commands.append({"cmd": "clear"})
        def speed(self, n):      pass
        def home(self):          commands.append({"cmd": "goto", "x": 0.0, "y": 0.0})
        def setheading(self, a): commands.append({"cmd": "setheading", "n": float(a)})
        def color(self, *args):
            c = args[0] if args else "#000000"
            commands.append({"cmd": "color", "c": str(c)})
        def pensize(self, n):
            commands.append({"cmd": "pensize", "n": float(n)})
        def goto(self, x, y=None):
            if y is None:
                x, y = x  # handle tuple argument
            commands.append({"cmd": "goto", "x": float(x), "y": float(y)})
        # aliases
        fd = forward; bk = backward; rt = right; lt = left
        pu = penup;   pd = pendown;  width = pensize; seth = setheading

    class MockScreen:
        def bgcolor(self, c): commands.append({"cmd": "bgcolor", "c": str(c)})
        def mainloop(self):   pass
        def title(self, t):   pass
        def setup(self, *a, **k): pass
        def exitonclick(self): pass

    _t = MockTurtle()
    _screen = MockScreen()

    # Build mock `turtle` module so `import turtle` resolves to our mock
    mock_turtle_mod = types.ModuleType("turtle")
    mock_turtle_mod.Turtle = MockTurtle
    mock_turtle_mod.Screen = MockScreen
    mock_turtle_mod.done = lambda: None
    mock_turtle_mod.bye = lambda: None
    mock_turtle_mod.mainloop = lambda: None

    # Build mock `time` module (sleep is a no-op — we don't want real delays)
    mock_time_mod = types.ModuleType("time")
    mock_time_mod.sleep = lambda n: None  # type: ignore[attr-defined]

    with _patched_modules(turtle=mock_turtle_mod, time=mock_time_mod):
        # Inject pre-constructed t / screen so the generated setup lines work
        namespace: dict = {
            "__builtins__": __builtins__,
            "t": _t,
            "screen": _screen,
            "random": _random,
        }
        try:
            with redirect_stdout(stdout_buf):
                exec(compile(code, "<blocks>", "exec"), namespace)  # nosec
        except Exception as e:
            success = False
            stderr = _friendly_error(repr(e))

    return {
        "commands": commands,
        "stdout": stdout_buf.getvalue(),
        "stderr": stderr,
        "success": success,
        "mode": "canvas",
    }


@contextmanager
def _patched_modules(**mocks):
    """Temporarily override entries in sys.modules."""
    saved = {name: sys.modules.get(name) for name in mocks}
    sys.modules.update(mocks)
    try:
        yield
    finally:
        for name, old in saved.items():
            if old is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = old


# ── Helpers ───────────────────────────────────────────────────────────────────

def _friendly_error(msg: str) -> str:
    table = {
        "SyntaxError: ": "",
        "unexpected EOF while parsing": "Something looks incomplete — missing colon?",
        "invalid syntax": "Check for typos or missing colons",
        "NameError": "Name error — did you set the variable first?",
        "IndentationError": "Indentation problem — check your spaces",
        "ZeroDivisionError": "You tried to divide by zero!",
        "TypeError": "Type error — are you mixing numbers and text?",
        "ValueError": "Value error — unexpected value",
    }
    for k, v in table.items():
        msg = msg.replace(k, v)
    return msg.strip()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")
