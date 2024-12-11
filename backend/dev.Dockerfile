FROM python:3.12

ARG DKR_UID=123000
ARG DKR_GID=123999

RUN groupadd -g ${DKR_GID} dkruser
RUN useradd -l -u ${DKR_UID} -g ${DKR_GID} --create-home --shell /bin/bash dkruser
USER dkruser

WORKDIR /app
COPY --chown=dkruser:dkruser requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

CMD ["python", "-m", "fastapi", "dev", "main.py", "--host", "0.0.0.0", "--port", "8080"]
