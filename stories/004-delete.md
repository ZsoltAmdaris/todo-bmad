# Story 004 – Delete

## Goal

Clicking the delete icon opens a confirmation; after confirming the item disappears.

## Acceptance Criteria

- Confirmation Dialog → delete → item disappears.
- List revalidates automatically.
- On error → MUI Snackbar.

## API

DELETE `/api/todos/:id`

## UI Notes

MUI Dialog + DeleteIcon; SWR revalidate on success.
