# Story 001 – Display List

## Goal

Show the list of todos on the homepage.

## Acceptance Criteria

- If there are items, they are shown (newest on top).
- If there are none: show “No todos”.
- While loading show skeletons; on error show MUI Alert.

## API

GET `/api/todos?sort=createdAt:desc`

## UI Notes

MUI List + ListItem + Checkbox; data with SWR.
X
