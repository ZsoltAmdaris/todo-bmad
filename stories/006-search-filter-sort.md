# Story 006 – Search, Filter, Sort

## Goal

Enable quick search and filtering (active/done), with sort by createdAt or priority.

## Acceptance Criteria

- Search input filters client-side by title (debounced).
- Filter tabs: All, Active, Completed.
- Sort dropdown: Created (newest), Created (oldest), Priority (high→low).
- State persists in URL query params.

## API

- Default list: GET `/api/todos?sort=createdAt:desc`
- Optional server sort support: `?sort[0]=priority:desc` (if field exists)

## UI Notes

- Place search input above the list; tabs under it; sort on the right.
- Announce active filters for accessibility.

