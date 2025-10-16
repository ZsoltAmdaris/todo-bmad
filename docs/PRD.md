# PRD – Todo (v1)

## Goal

Simple Todo app with Next.js + Strapi + MUI. v1: list, create, toggle done, delete. Auth later.

## User Stories (v1)

1. Display list
2. Add new item
3. Toggle done/undone (optimistic)
4. Delete with confirmation

## Acceptance Criteria (global)

- Handle Empty/Loading/Error states (Loading: skeleton list items).
- API: Strapi v5 REST `/api/todos`.
  - v5 responses include a `documentId`; use this for update/delete resource targeting.
- Performance: list is fast (<200ms with FE caching).
