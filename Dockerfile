FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY manage.py .
COPY pomodoro ./pomodoro
COPY core ./core

# WhiteNoise manifest storage needs the collected files baked into the image.
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Migrate on boot (idempotent), then serve. One worker + threads keeps RAM
# inside the free-tier budget; PORT is provided by the platform.
CMD ["sh", "-c", "python manage.py migrate --noinput && exec gunicorn pomodoro.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 1 --threads 4"]
