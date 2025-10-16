# Story 006 – Search, Filter, Sort

## Goal

Enable quick search and filtering (active/done), with sort by createdAt or priority.

## Acceptance Criteria

- Search input filters server-side by title with debounce (500ms delay).
- Filter tabs: All, Active, Completed (server-side filtering).
- Sort dropdown: Created (newest), Created (oldest).
- State persists in URL query params with debounce (250ms).
- Search, filter, and sort reset pagination to page 1.

## API

- Default list: GET `/api/todos?pagination[page]=1&pagination[pageSize]=10&sort=createdAt:desc`
- With search: `?filters[title][$containsi]=search_term`
- With filter (active): `?filters[done][$eq]=false`
- With filter (completed): `?filters[done][$eq]=true`
- Example full query: `/api/todos?pagination[page]=1&pagination[pageSize]=10&sort=createdAt:asc&filters[title][$containsi]=hello&filters[done][$eq]=false`

## UI Notes

- Place search input above the list; tabs under it; sort on the right.
- Search has 500ms debounce to reduce API calls.
- URL updates have 250ms debounce.
- When any filter changes, pagination resets to page 1.
- Announce active filters for accessibility.

## Implementation Details

- **Search Debounce**: Uses two state variables - `searchInput` for immediate UI updates and `search` for the debounced API call (500ms).
- **URL Debounce**: URL query params update with 250ms delay after any filter change.
- **Server-side**: All filtering, sorting, and searching happens on the server (Strapi API).
- **Pagination Reset**: Changing search, filter, or sort clears current todos and resets to page 1.
- **Page Size**: 10 items per page for optimal performance.
