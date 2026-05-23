# Build from repository root: docker build -f backend/Dockerfile .
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ml-model/requirements.txt /tmp/ml-requirements.txt
RUN pip install --no-cache-dir -r /tmp/ml-requirements.txt

COPY backend/ .
COPY ml-model/ /ml-model/

RUN python /ml-model/train.py

ENV MODEL_PATH=/ml-model/models/gingivitis_rf_model.joblib

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
