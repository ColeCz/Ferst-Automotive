FROM python:3.13-slim-bookworm

WORKDIR /app-home

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY app ./app

EXPOSE 5000

CMD ["gunicorn", "--bind=0.0.0.0:5000", "app:create_app()"]