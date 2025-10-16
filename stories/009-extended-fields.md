# Story 009 – Extended Fields

## Goal

Add fields to todos: description, priority (low/medium/high), dueDate, tags.

## Acceptance Criteria

- Data model updated in Strapi; existing items unaffected (default values applied).
- Create/Edit forms include new fields with validation (e.g., dueDate in the future optional).
- Sort by priority available when the field exists.

## Data Model (Strapi)

- `description: text`
- `priority: enumeration(low, medium, high)` default `low`
- `dueDate: datetime` nullable
- `tags: JSON` array of strings or relation if tags as separate type

## UI Notes

- Use Select for priority, date picker for dueDate, chips for tags.

