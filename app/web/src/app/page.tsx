'use client';

import useSWR, { mutate } from 'swr';
import {
  Alert,
  Box,
  Checkbox,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Skeleton,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Todo,
  TodoAttrs,
  StrapiResponse,
  StrapiListItem,
  endpoints,
  mapTodo,
  updateTodo,
  createTodo,
  deleteTodo,
} from '../lib/api';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type ListResponse = StrapiResponse<StrapiListItem<TodoAttrs>[]>;

export default function Home() {
  const [page, setPage] = useState(1);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const todos = allTodos;

  const [title, setTitle] = useState('');
  const [confirmId, setConfirmId] = useState<string | number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | number | null>(null);

  // search, filter, sort (Story 006)
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState<string>(searchParams.get('q') || '');
  const [search, setSearch] = useState<string>(searchParams.get('q') || '');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>(
    (searchParams.get('f') as any) || 'all'
  );
  const [sort, setSort] = useState<'created_desc' | 'created_asc'>(
    (searchParams.get('s') as any as 'created_desc' | 'created_asc') || 'created_desc'
  );

  // Debounce search input (500ms delay)
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // debounce sync to URL and reset pagination
  useEffect(() => {
    // Reset pagination when filters change
    setPage(1);
    setAllTodos([]);
    setHasMore(true);

    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (filter !== 'all') params.set('f', filter);
      if (sort !== 'created_desc') params.set('s', sort);
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : '/', { scroll: false });
    }, 250);
    return () => clearTimeout(t);
  }, [search, filter, sort, router]);

  // Fetch with server-side filter/sort/search; place after state init
  const { data, error, isLoading } = useSWR<ListResponse>(
    endpoints.list(page, 10, { search, filter, sort })
  );

  // Merge new todos when data changes
  useEffect(() => {
    if (data) {
      const newTodos = data.data.map(mapTodo);
      if (page === 1) {
        setAllTodos(newTodos);
      } else {
        setAllTodos((prev) => [...prev, ...newTodos]);
      }
      setHasMore(data.meta?.pagination?.page < (data.meta?.pagination?.pageCount || 0));
      setLoadingMore(false);
    }
  }, [data, page]);

  // Intersection Observer for infinite scroll (after isLoading exists)
  const observerRef = useRef<IntersectionObserver | undefined>(undefined);
  const lastTodoRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          setPage((p) => p + 1);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, loadingMore]
  );

  const visibleTodos = useMemo(() => {
    let list = todos;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (filter === 'active') list = list.filter((t) => !t.done);
    if (filter === 'completed') list = list.filter((t) => t.done);
    const byCreated = (a?: string, b?: string) => {
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    };
    if (sort === 'created_desc')
      list = [...list].sort((a, b) => byCreated(b.createdAt, a.createdAt));
    if (sort === 'created_asc')
      list = [...list].sort((a, b) => byCreated(a.createdAt, b.createdAt));
    return list;
  }, [todos, search, filter, sort]);

  const onAdd = async () => {
    const t = title.trim();
    if (!t) {
      setSnack('Title cannot be empty');
      return;
    }
    try {
      await createTodo(t);
      setTitle('');
      mutate(endpoints.list(page, 10, { search, filter, sort }));
    } catch (e) {
      setSnack('Failed to create');
    }
  };

  const onToggle = async (todo: Todo) => {
    const key = endpoints.list(page, 10, { search, filter, sort });
    const optimistic = todos.map((x) =>
      x.id === todo.id ? { ...x, done: !todo.done } : x
    );
    mutate(key, { data: optimistic } as unknown, { revalidate: false });
    try {
      await updateTodo(todo.documentId ?? todo.id, { done: !todo.done });
      mutate(key);
    } catch (e) {
      mutate(key); // rollback by refetch
      setSnack('Failed to update');
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.documentId ?? todo.id);
    setEditValue(todo.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const commitEdit = async (todo: Todo) => {
    const newTitle = editValue.trim();
    const idOrDoc = todo.documentId ?? todo.id;
    if (!newTitle) {
      setSnack('Title cannot be empty');
      return;
    }
    if (newTitle === todo.title) {
      cancelEdit();
      return;
    }
    const key = endpoints.list(page, 10, { search, filter, sort });
    // optimistic update
    const optimistic = todos.map((x) =>
      x.id === todo.id ? { ...x, title: newTitle } : x
    );
    mutate(key, { data: optimistic } as unknown, { revalidate: false });
    setSavingId(idOrDoc);
    try {
      await updateTodo(idOrDoc, { title: newTitle });
      mutate(key);
      cancelEdit();
    } catch (e) {
      mutate(key); // rollback by refetch
      setSnack('Failed to save title');
    } finally {
      setSavingId(null);
    }
  };

  const onConfirmDelete = async () => {
    if (confirmId == null) return;
    try {
      setDeleting(true);
      await deleteTodo(confirmId);
      setConfirmId(null);
      mutate(endpoints.list(page, 10, { search, filter, sort }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setSnack(`Failed to delete: ${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth='sm' sx={{ py: 4 }}>
      <Typography variant='h4' gutterBottom>
        Todos
      </Typography>

      <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder='New item...'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAdd();
          }}
        />
        <Button variant='contained' onClick={onAdd}>
          Add
        </Button>
      </Stack>

      {/* Search / Filter / Sort */}
      <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder='Search...'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          fullWidth
        />
      </Stack>
      <Stack direction='row' spacing={2} sx={{ mb: 2 }} alignItems='center'>
        <Stack direction='row' spacing={1}>
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'contained' : 'outlined'}
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'completed' ? 'contained' : 'outlined'}
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
        </Stack>
        <Box sx={{ flex: 1 }} />
        <TextField
          select
          label='Sort'
          size='small'
          value={sort}
          onChange={(e) => setSort(e.target.value as 'created_desc' | 'created_asc')}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value='created_desc'>Created (newest)</MenuItem>
          <MenuItem value='created_asc'>Created (oldest)</MenuItem>
        </TextField>
      </Stack>

      {isLoading && (
        <List>
          {[...Array(5)].map((_, i) => (
            <ListItem key={`skeleton-${i}`} divider disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <Skeleton variant='circular' width={24} height={24} />
                </ListItemIcon>
                <ListItemText primary={<Skeleton variant='text' width='70%' />} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
      {error && <Alert severity='error'>Error while loading</Alert>}
      {!isLoading && !error && visibleTodos.length === 0 && <Alert>No todos</Alert>}

      {!error && visibleTodos.length > 0 && (
        <Box>
          <List>
            {visibleTodos.map((todo) => (
              <ListItem
                key={todo.id}
                divider
                secondaryAction={
                  <IconButton
                    edge='end'
                    aria-label='delete'
                    onClick={() => setConfirmId(todo.documentId ?? todo.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                disablePadding
              >
                <ListItemButton>
                  <ListItemIcon>
                    <Checkbox
                      edge='start'
                      checked={todo.done}
                      tabIndex={-1}
                      onChange={() => onToggle(todo)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </ListItemIcon>
                  {editingId === (todo.documentId ?? todo.id) ? (
                    <TextField
                      fullWidth
                      size='small'
                      value={editValue}
                      autoFocus
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitEdit(todo)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit(todo);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      disabled={savingId === (todo.documentId ?? todo.id)}
                    />
                  ) : (
                    <ListItemText
                      primary={todo.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(todo);
                      }}
                      sx={{
                        cursor: 'text',
                        textDecoration: todo.done ? 'line-through' : 'none',
                        color: todo.done ? 'text.secondary' : 'text.primary',
                        opacity: savingId === (todo.documentId ?? todo.id) ? 0.6 : 1,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {loadingMore && (
            <List>
              {[...Array(3)].map((_, i) => (
                <ListItem key={`loading-${i}`} divider disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <Skeleton variant='circular' width={24} height={24} />
                    </ListItemIcon>
                    <ListItemText primary={<Skeleton variant='text' width='70%' />} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
          {!loadingMore && hasMore && <div ref={lastTodoRef} style={{ height: 20 }} />}
        </Box>
      )}

      <Dialog open={confirmId != null} onClose={() => setConfirmId(null)}>
        <DialogTitle>Confirm deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmId(null)}>Cancel</Button>
          <Button color='error' onClick={onConfirmDelete} autoFocus disabled={deleting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        message={snack || ''}
      />
    </Container>
  );
}
