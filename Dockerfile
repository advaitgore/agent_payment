FROM python:3.11-slim AS builder
WORKDIR /app
COPY apps/api/requirements.txt /app/requirements.txt
RUN pip install --user --no-cache-dir -r /app/requirements.txt

FROM python:3.11-slim
WORKDIR /app
ENV PATH="/root/.local/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
COPY --from=builder /root/.local /root/.local
COPY apps /app/apps
CMD ["uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
