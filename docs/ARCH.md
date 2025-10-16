# Architecture Documentation

## Project Structure

```
/ (repo root)
docs/
  PRD.md              # Product Requirements Document
  ARCH.md             # Architecture Documentation (this file)
stories/
  001-list.md         # Story 001: List todos
  002-new.md          # Story 002: Create new todo
  003-toggle.md       # Story 003: Toggle done status
  004-delete.md       # Story 004: Delete todo
  005-edit-inline.md  # Story 005: Inline edit
  006-search-filter-sort.md  # Story 006: Search, Filter, Sort
  007-pagination-infinite.md # Story 007: Pagination/Infinite Scroll
  008-bulk-actions.md        # Story 008: Bulk actions
  ...
app/
  api/                # Strapi Backend
    config/           # Strapi configuration
    database/         # Database migrations
    public/           # Public assets
    src/              # Source code
      api/            # API routes and controllers
      admin/          # Admin panel customizations
      extensions/     # Strapi extensions
    package.json
  web/                # Next.js Frontend
    src/
      app/            # Next.js App Router pages
        page.tsx      # Main todo list page
      lib/
        api.ts        # API client and types
    public/           # Static assets
    package.json
.bmad-core/           # BMAD framework core
```

## Technology Stack

### Backend (Strapi)

- **Framework**: Strapi v5
- **Database**: SQLite (development) / PostgreSQL (production)
- **API Style**: REST API with query parameters
- **Features**:
  - Content type: Todo (title, done, createdAt, updatedAt)
  - Pagination support
  - Filtering support (by title, done status)
  - Sorting support (by createdAt)

### Frontend (Next.js)

- **Framework**: Next.js 14+ with App Router
- **UI Library**: Material-UI (MUI)
- **Data Fetching**: SWR (stale-while-revalidate)
- **State Management**: React hooks (useState, useEffect, useMemo)
- **Routing**: Next.js App Router with query params

## Key Features

### 1. Search, Filter, and Sort (Story 006)

- **Search**: Server-side text search with 500ms debounce
  - State: `searchInput` (immediate) → `search` (debounced)
  - API: `filters[title][$containsi]=query`
- **Filter**: Server-side filtering by done status
  - Options: All, Active, Completed
  - API: `filters[done][$eq]=true/false`
- **Sort**: Server-side sorting
  - Options: Created (newest), Created (oldest)
  - API: `sort=createdAt:desc/asc`
- **URL Persistence**: Query params with 250ms debounce
  - `q` = search query
  - `f` = filter (all/active/completed)
  - `s` = sort (created_desc/created_asc)

### 2. Pagination and Infinite Scroll (Story 007)

- **Page Size**: 10 items per page
- **Method**: Infinite scroll using Intersection Observer
- **API**: `pagination[page]=N&pagination[pageSize]=10`
- **Behavior**:
  - Loads next page when scrolling near bottom
  - Shows loading skeleton for new items
  - Resets to page 1 when filters change
  - Tracks `hasMore` based on pagination metadata

### 3. Optimistic Updates

All mutations (create, update, delete) use optimistic updates:

1. Update local state immediately
2. Send API request
3. Revalidate on success
4. Rollback on error

### 4. Inline Editing (Story 005)

- Click on todo title to edit
- Enter to save, Escape to cancel
- Auto-save on blur
- Visual feedback during save

## Data Flow

```
User Input
    ↓
Local State (searchInput, filter, sort)
    ↓
Debounce (500ms for search, 250ms for URL)
    ↓
API Request (search, filter, sort)
    ↓
SWR Cache
    ↓
UI Render (visibleTodos)
```

## API Endpoints

### List Todos

```
GET /api/todos?pagination[page]=1&pagination[pageSize]=10&sort=createdAt:desc&filters[title][$containsi]=search&filters[done][$eq]=false
```

### Create Todo

```
POST /api/todos
Body: { data: { title: "Todo title" } }
```

### Update Todo

```
PUT /api/todos/:documentId
Body: { data: { done: true, title: "Updated title" } }
```

### Delete Todo

```
DELETE /api/todos/:documentId
```

## Performance Optimizations

1. **Debouncing**:
   - Search input: 500ms
   - URL updates: 250ms
2. **Infinite Scroll**: Reduces initial load, loads data on demand

3. **SWR Caching**: Automatic caching and revalidation

4. **Optimistic Updates**: Immediate UI feedback

5. **Server-side Filtering**: Reduces client-side processing

6. **Pagination**: Only 10 items per request

## Future Enhancements

- User authentication and multi-tenancy
- Real-time updates (WebSockets)
- Offline support (PWA)
- Bulk actions (Story 008)
- Extended fields (Story 009)
- Keyboard shortcuts (Story 012)
- Dark mode (Story 015)
