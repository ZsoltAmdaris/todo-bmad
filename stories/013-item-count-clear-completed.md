# Story 013 – Item Count & Clear Completed

## Goal

Show remaining item count and allow clearing completed items.

## Acceptance Criteria

- Display `x items left` (active todos count).
- Button `Clear completed` deletes all done items with confirmation.
- Optimistic UI; partial failures reported via Snackbar.

## API

- GET `/api/todos` to compute counts.
- DELETE per completed item (or future bulk endpoint).

## UI Notes

- Place count on the left, clear button on the right, above the list.

