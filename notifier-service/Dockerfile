FROM python:3.12

# Create and use a non-root user
RUN groupadd -g 123001 dkruser
RUN useradd -u 123001 -g 123001 --create-home --shell /bin/bash dkruser
USER dkruser

WORKDIR /app

# Install dependencies
COPY --chown=dkruser:dkruser requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy service code
COPY --chown=dkruser:dkruser src/ ./

# Run the notification service
CMD ["python", "-m", "fastapi", "run", "main.py", "--port", "8000"]
