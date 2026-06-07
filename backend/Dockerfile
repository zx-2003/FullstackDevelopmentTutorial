FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --no-input

EXPOSE 8080

CMD gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2