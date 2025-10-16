# Story 010 – Audit Fields

## Goal

Track createdBy and updatedBy using Strapi users-permissions.

## Acceptance Criteria

- When authenticated, createdBy/updatedBy are set automatically by Strapi.
- List view can optionally show author (e.g., tooltip or secondary text).
- Access control: non-authenticated users cannot mutate.

## Data Model (Strapi)

- Enable users-permissions and link collection type to user.
- Configure Public role: read-only; Authenticated role: create/update/delete.

## UI Notes

- Show lock/disabled states for mutation actions when not authenticated.

