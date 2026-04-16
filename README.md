# Gym Workout Tracker

Full-stack gym workout tracker built with FastAPI, SQLAlchemy, PostgreSQL, React, Vite, Tailwind CSS, and JWT authentication.

## Project structure

```text
backend/
  app/
    core/
    db/
    models/
    routes/
    schemas/
    services/
    main.py
frontend/
  src/
    api/
    components/
    context/
    pages/
docker-compose.yml
```

## Backend setup

1. Create a Python virtual environment and activate it.
2. Install dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

3. Copy `backend/.env.example` to `backend/.env` and adjust values if needed.
4. Start PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

5. Run the API from the `backend` directory:

   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Frontend setup

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Copy `frontend/.env.example` to `frontend/.env` if you need a custom API URL.
3. Start the frontend:

   ```bash
   npm run dev
   ```

The app will run at [http://localhost:5173](http://localhost:5173).

## Features

- JWT signup/login with hashed passwords
- Workout CRUD for Push/Pull/Legs style splits
- Exercise management within workouts
- Set logging with reps, weight, and timestamps
- Workout history and progress summaries
