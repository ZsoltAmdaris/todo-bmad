# Story 008 – Bulk Actions

## Goal

Allow selecting multiple todos to toggle done or delete in bulk.

## Acceptance Criteria

- Multi-select mode with checkboxes; Select All on current view.
- Bulk toggle done/undone applies optimistically; partial failure reverts only failed items.
- Bulk delete requires confirmation; on success items disappear; on error show consolidated report.

## API

- PUT `/api/todos/:id` per item (batched client-side), or custom bulk endpoint (future).
- DELETE `/api/todos/:id` per item.

## UI Notes

- Show bulk action bar when at least one item is selected.
- Display progress (e.g., x/y completed) during operations.

