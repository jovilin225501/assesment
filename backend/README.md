# Movie Watchlist Manager - Backend API

Production-ready Node.js and Express REST API for the Movie Watchlist Manager, backed by MongoDB Atlas and Mongoose.

## Architecture

- **Runtime & Framework**: Node.js, Express.js
- **Database & ODM**: MongoDB Atlas, Mongoose
- **Security & Headers**: Helmet, CORS
- **Validation**: express-validator & Mongoose Schema constraints
- **Pattern**: MVC Service-Repository architecture (Controllers, Services, Models, Routes, Middleware)

## Environment Variables

Configure `.env` in `backend/` (or copy from `.env.example`):

```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/movie_watchlist?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
```

## Running Locally

```bash
# Install dependencies
npm install

# Seed initial test data
npm run seed

# Run in development mode with auto-reload
npm run dev

# Run automated integration tests
npm test

# Run in production mode
npm start
```

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and database connectivity |
| `GET` | `/api/movies` | List movies with search, status & genre filter, pagination (6 per page) |
| `POST` | `/api/movies` | Add new movie (generates `MV-YYYY-XXX` code, sets status to `To Watch`) |
| `GET` | `/api/movies/watch-next` | Recommends highest priority To Watch movie (runtime tie-breaker) |
| `GET` | `/api/movies/:id` | Fetch single movie details |
| `PUT` | `/api/movies/:id` | Edit allowed fields (title, genre, runtime, platform, priority) |
| `PATCH` | `/api/movies/:id/status` | Transition status (`To Watch` -> `Watching`, `Watched`; `Watching` -> `Watched`, `To Watch`; `Watched` is final) |
| `PATCH` | `/api/movies/:id/rating` | Update rating (1-10) for movies in `Watched` status |
| `DELETE` | `/api/movies/:id` | Delete movie (strictly forbidden for `Watching` status) |
| `GET` | `/api/stats` | Dashboard statistics via MongoDB aggregation pipeline |

## Business Rules Enforced

1. **Movie Code**: Auto-generated in format `MV-YYYY-NNN`, tracked per release year via atomic MongoDB counter. Sequence never decrements or reuses numbers upon deletion.
2. **Duplicate Prevention**: Compound unique index on `{ titleNormalized: 1, releaseYear: 1 }` prevents duplicates case-insensitively. Returns HTTP 409 Conflict.
3. **Workflow Rules**:
   - Permitted transitions:
     - `To Watch` → `Watching` | `Watched`
     - `Watching` → `Watched` | `To Watch`
     - `Watched` → Terminal status (HTTP 400 if attempted transition)
   - When marking `Watched`, a rating between 1 and 10 is mandatory and `watchedDate` is automatically populated.
   - Non-Watched movies cannot hold ratings.
4. **Delete Restriction**: Deletion of movies in `Watching` status is blocked by the server with HTTP 400.
