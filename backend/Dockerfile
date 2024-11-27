FROM python:3.12

RUN groupadd -g 123000 dkruser
RUN useradd -u 123000 -g 123000 --create-home --shell /bin/bash dkruser
USER dkruser

WORKDIR /app
COPY --chown=dkruser:dkruser requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY --chown=dkruser:dkruser src/ ./
CMD ["python", "-m", "fastapi", "run", "main.py", "--port", "8080"]
