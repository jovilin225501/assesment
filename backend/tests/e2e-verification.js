/**
 * Comprehensive Live End-to-End Verification Script
 * Directly hits running server on http://localhost:5000
 */
const BASE_URL = 'http://localhost:5000/api';

const runE2E = async () => {
  console.log('--- Starting Comprehensive Live E2E Verification ---');
  let failures = 0;

  const testCase = async (name, fn) => {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
    } catch (err) {
      console.error(`  [FAIL] ${name} ->`, err.message);
      failures++;
    }
  };

  // 1. Health check
  await testCase('Backend Health Check', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const json = await res.json();
    if (!res.ok || !json.success || json.data.database !== 'connected') {
      throw new Error(`Health check failed: ${JSON.stringify(json)}`);
    }
  });

  // 2. Add valid movie & check year-specific code
  let createdMovieId;
  let createdMovieCode;
  await testCase('Add valid movie & auto-generate MV-2025-XXX code', async () => {
    const res = await fetch(`${BASE_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Live E2E Movie Test',
        genre: 'Sci-Fi',
        releaseYear: 2025,
        runtime: 135,
        platform: 'Netflix',
        priority: 5
      })
    });
    const json = await res.json();
    if (res.status !== 201 || !json.data.movieCode.startsWith('MV-2025-')) {
      throw new Error(`Unexpected creation response: status ${res.status}`);
    }
    if (json.data.status !== 'To Watch' || json.data.rating !== null || json.data.watchedDate !== null) {
      throw new Error('Default fields not properly initialized');
    }
    createdMovieId = json.data._id;
    createdMovieCode = json.data.movieCode;
  });

  // 3. Reject duplicate title-year with HTTP 409
  await testCase('Reject duplicate title-year with HTTP 409', async () => {
    const res = await fetch(`${BASE_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '  LIVE E2E MOVIE TEST  ', // case-insensitive & trimmed
        genre: 'Drama',
        releaseYear: 2025,
        runtime: 120,
        platform: 'Theatre',
        priority: 3
      })
    });
    const json = await res.json();
    if (res.status !== 409) {
      throw new Error(`Expected 409 Conflict, received ${res.status}: ${JSON.stringify(json)}`);
    }
  });

  // 4. Reject invalid release year and runtime
  await testCase('Reject invalid year (< 1950) and runtime (< 30)', async () => {
    const resYear = await fetch(`${BASE_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Invalid Year Movie',
        genre: 'Action',
        releaseYear: 1800,
        runtime: 100,
        platform: 'Other',
        priority: 1
      })
    });
    if (resYear.status !== 400) throw new Error('Failed to reject year < 1950');

    const resRuntime = await fetch(`${BASE_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Invalid Runtime Movie',
        genre: 'Action',
        releaseYear: 2024,
        runtime: 20,
        platform: 'Other',
        priority: 1
      })
    });
    if (resRuntime.status !== 400) throw new Error('Failed to reject runtime < 30');
  });

  // 5. Pagination with exactly 6 per page
  await testCase('Verify exactly 6 movies per page in pagination', async () => {
    const res = await fetch(`${BASE_URL}/movies?page=1&limit=6`);
    const json = await res.json();
    if (!res.ok || json.data.length > 6 || json.pagination.pageSize !== 6) {
      throw new Error(`Pagination check failed: count=${json.data.length}`);
    }
  });

  // 6. Search and filter
  await testCase('Search by title case-insensitively and filter by genre', async () => {
    const res = await fetch(`${BASE_URL}/movies?search=chrono&genre=Sci-Fi`);
    const json = await res.json();
    if (!res.ok || json.data.length === 0 || !json.data[0].title.includes('Chrono')) {
      throw new Error('Search & genre filter failed');
    }
  });

  // 7. Transition To Watch -> Watching
  await testCase('Transition To Watch -> Watching', async () => {
    const res = await fetch(`${BASE_URL}/movies/${createdMovieId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Watching' })
    });
    const json = await res.json();
    if (res.status !== 200 || json.data.status !== 'Watching') {
      throw new Error(`Failed to transition to Watching: status=${res.status}`);
    }
  });

  // 8. Reject deletion of Watching movie with HTTP 400
  await testCase('Reject deletion of Watching movie with HTTP 400', async () => {
    const res = await fetch(`${BASE_URL}/movies/${createdMovieId}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (res.status !== 400) {
      throw new Error(`Expected 400 for deleting Watching movie, got ${res.status}`);
    }
  });

  // 9. Transition Watching -> To Watch
  await testCase('Transition Watching -> To Watch', async () => {
    const res = await fetch(`${BASE_URL}/movies/${createdMovieId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'To Watch' })
    });
    const json = await res.json();
    if (res.status !== 200 || json.data.status !== 'To Watch') {
      throw new Error('Failed to transition Watching -> To Watch');
    }
  });

  // 10. Transition To Watch -> Watched (requires rating)
  await testCase('Transition To Watch -> Watched with mandatory rating', async () => {
    // Missing rating should fail
    const failRes = await fetch(`${BASE_URL}/movies/${createdMovieId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Watched' })
    });
    if (failRes.status !== 400) throw new Error('Failed to require rating for Watched');

    // Valid rating should succeed
    const okRes = await fetch(`${BASE_URL}/movies/${createdMovieId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Watched', rating: 9.2 })
    });
    const json = await okRes.json();
    if (okRes.status !== 200 || json.data.status !== 'Watched' || json.data.rating !== 9.2 || !json.data.watchedDate) {
      throw new Error('Failed to properly set Watched status and rating');
    }
  });

  // 11. Reject status transition from Watched (terminal status)
  await testCase('Reject status transition from Watched with HTTP 400', async () => {
    const res = await fetch(`${BASE_URL}/movies/${createdMovieId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Watching' })
    });
    if (res.status !== 400) throw new Error('Failed to prevent transition out of Watched status');
  });

  // 12. Update rating of Watched movie
  await testCase('Update rating of existing Watched movie', async () => {
    const res = await fetch(`${BASE_URL}/movies/${createdMovieId}/rating`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 8.7 })
    });
    const json = await res.json();
    if (res.status !== 200 || json.data.rating !== 8.7) {
      throw new Error('Failed to update rating');
    }
  });

  // 13. Edit allowed fields only
  await testCase('Edit allowed fields (title, priority, platform)', async () => {
    const res = await fetch(`${BASE_URL}/movies/${createdMovieId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Live E2E Movie Test - Edited',
        genre: 'Sci-Fi',
        runtime: 140,
        platform: 'Prime Video',
        priority: 4,
        // Attempt to maliciously edit protected fields
        movieCode: 'MV-9999-999',
        releaseYear: 1990,
        status: 'To Watch'
      })
    });
    const json = await res.json();
    if (res.status !== 200 || json.data.title !== 'Live E2E Movie Test - Edited') {
      throw new Error('Failed to update allowed fields');
    }
    // Verify protected fields were NOT modified
    if (json.data.movieCode === 'MV-9999-999' || json.data.releaseYear === 1990 || json.data.status === 'To Watch') {
      throw new Error('Security failure: Protected fields were altered by PUT request');
    }
  });

  // 14. Watch Next recommendation
  await testCase('Watch Next recommendation endpoint returns optimal To Watch movie', async () => {
    const res = await fetch(`${BASE_URL}/movies/watch-next`);
    const json = await res.json();
    if (res.status !== 200 || !json.data || json.data.status !== 'To Watch') {
      throw new Error('Watch Next failed');
    }
  });

  // 15. Statistics calculation
  await testCase('Statistics endpoint calculation', async () => {
    const res = await fetch(`${BASE_URL}/stats`);
    const json = await res.json();
    if (res.status !== 200 || !json.success || typeof json.data.totalHoursWatched !== 'number') {
      throw new Error('Statistics calculation failed');
    }
  });

  // 16. Delete movie (now in Watched status, so deletion is permitted)
  await testCase('Delete Watched movie', async () => {
    const res = await fetch(`${BASE_URL}/movies/${createdMovieId}`, {
      method: 'DELETE'
    });
    if (res.status !== 200) throw new Error('Failed to delete Watched movie');
  });

  console.log(`\n--- Verification Completed with ${failures} failure(s) ---`);
  if (failures > 0) process.exit(1);
};

runE2E();
