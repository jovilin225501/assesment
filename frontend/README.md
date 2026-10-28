# CineTrack - Frontend Client

Modern cinematic React + Vite client for the Movie Watchlist Manager examination project.

## Features

- **Cinematic Dark Theme**: Deep dark backgrounds, purple and cyan glows, glassmorphism cards, and micro-animations.
- **Workflow State Management**: Permitted status transitions (`To Watch` -> `Watching`, `Watched`; `Watching` -> `Watched`, `To Watch`; `Watched` is final).
- **Mandatory Ratings**: Prompts for 1-10 rating and logs `watchedDate` on transition to `Watched`.
- **Live Aggregated Analytics**: Total movies, queue counts, total hours watched, average rating, and top genre.
- **Intelligent Decision Engine**: "What Should I Watch Next?" algorithm with priority and shortest-runtime tie-breaker.
- **Guarded Deletions**: Deletion of movies in `Watching` status is disabled with clear explanations.
- **Strict Pagination**: Exactly 6 movies per page, combined with full search and genre/status filters.
- **Responsive Layout**: Sidebar navigation for desktop and compact layout for mobile devices.

## Setup & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```
