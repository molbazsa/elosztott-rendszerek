FROM python:3.12

RUN groupadd -g 123000 dkruser
RUN useradd -u 123000 -g 123000 --create-home --shell /bin/bash dkruser
USER dkruser

WORKDIR /app
COPY --chown=dkruser:dkruser requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

CMD ["python", "-m", "fastapi", "dev", "main.py", "--host", "0.0.0.0", "--port", "8080"]
