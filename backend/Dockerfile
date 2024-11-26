FROM python:3.12

RUN groupadd -g 123000 dkruser
RUN useradd -u 123000 -g 123000 --create-home --shell /bin/bash dkruser
USER dkruser

RUN pip install --no-cache-dir --upgrade fastapi[standard]~=0.113.0 pydantic~=2.7.0

WORKDIR /app
COPY --chown=dkruser:dkruser src/ ./
CMD ["python", "-m", "fastapi", "run", "main.py", "--port", "8080"]
