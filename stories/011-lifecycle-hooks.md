# Story 011 – Lifecycle Hooks

## Goal

Sanitize and normalize data using Strapi lifecycle hooks.

## Acceptance Criteria

- Trim title and coalesce multiple spaces before create/update.
- Default `priority` to `low` and `done` to `false` when missing.
- Optionally normalize tags (lowercase, unique).

## Backend Notes (Strapi)

- Implement `beforeCreate`/`beforeUpdate` for the todo content type.
- Add unit tests for sanitization logic if applicable.

