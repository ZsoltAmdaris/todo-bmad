# Story 007 – Pagination / Infinite Scroll

## Goal

Handle long lists with infinite scroll to improve performance and user experience.

## Acceptance Criteria

- ✅ Infinite scroll loads next page when user scrolls near bottom
- ✅ Page size: 10 items per page
- ✅ Avoid duplicate items through proper state management
- ✅ Show loading placeholders (skeleton) for appended items
- ✅ Maintain scroll position on mutations
- ✅ Reset to page 1 when filters/search/sort change
- ✅ Track `hasMore` based on pagination metadata from API

## API

GET `/api/todos?pagination[page]=1&pagination[pageSize]=10&sort=createdAt:desc`

Response includes pagination metadata:

```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 5,
      "total": 47
    }
  }
}
```

## UI Notes

- Use Intersection Observer to detect when user scrolls near bottom
- Show skeleton list items (3 items) while loading more
- Expose total count if available via `meta.pagination.total`
- Maintain existing items when loading more (append, don't replace)
- Clear list and reset to page 1 when search/filter/sort changes

## Implementation Details

### State Management

- `page`: Current page number (starts at 1)
- `allTodos`: Accumulated array of all loaded todos
- `loadingMore`: Boolean flag for loading indicator
- `hasMore`: Boolean based on `page < pageCount`

### Infinite Scroll Logic

1. Use Intersection Observer on last todo element
2. When last element is visible AND `hasMore` AND not already loading:
   - Set `loadingMore = true`
   - Increment page
3. When data loads:
   - If page === 1: Replace all todos
   - If page > 1: Append to existing todos
   - Update `hasMore` flag

### Integration with Filters

- When search, filter, or sort changes:
  - Reset `page = 1`
  - Clear `allTodos = []`
  - Set `hasMore = true`
- This triggers a fresh data load with new parameters
