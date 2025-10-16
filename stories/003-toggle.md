# Story 003 – Toggle Done

## Goal

Clicking the checkbox toggles a todo between done and not done.

## Acceptance Criteria

- Immediate visual change (optimistic update).
- On error, revert to previous state.

## API

PUT `/api/todos/:id`

```json
{ "data": { "done": true } }
```
