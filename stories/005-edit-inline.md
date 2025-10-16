# Story 005 – Edit Title Inline

## Goal

Allow editing a todo title inline within the list.

## Acceptance Criteria

- Click on title toggles it into an input (TextField).
- Validate non-empty; trim whitespace on save.
- Save on Enter/blur; Escape cancels and reverts.
- Optimistic update; on error revert and show Snackbar.

## API

PUT `/api/todos/:id`

```json
{ "data": { "title": "New title" } }
```

## UI Notes

- Use inline TextField with focus + selection on enter edit.
- Show a subtle saving indicator per item.

