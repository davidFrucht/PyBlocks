FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 8000

CMD ["python", "app.py"]

# Note: turtle and Pygame execution requires a display (DISPLAY env var).
# For non-graphical code execution only, run as-is.
# For turtle/Pygame support, use the app's native desktop backend instead.
