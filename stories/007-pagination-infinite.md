# Story 007 – Pagination / Infinite Scroll

## Goal

Handle long lists with either paginated navigation or infinite scroll.

## Acceptance Criteria

- Option A: Pagination controls with page size selector (e.g., 10/25/50).
- Option B: Infinite scroll loads next page when near bottom.
- Avoid duplicate items; show loading placeholders for appended items.
- Maintain scroll position on mutations.

## API

GET `/api/todos?pagination[page]=1&pagination[pageSize]=25&sort=createdAt:desc`

## UI Notes

- Reuse skeleton list items for loading more.
- Expose total count if available via meta.pagination.

