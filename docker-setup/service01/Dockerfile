FROM python:3.12

RUN groupadd -g 123000 dkruser
RUN useradd -u 123000 -g 123000 --create-home --shell /bin/bash dkruser
USER dkruser

COPY --chown=dkruser:dkruser src/ /app/

WORKDIR /app
CMD ["python", "server.py"]
