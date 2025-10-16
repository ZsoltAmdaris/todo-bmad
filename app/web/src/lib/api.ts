export type StrapiMeta = {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
};

export type StrapiResponse<T> = {
  data: T;
  meta?: StrapiMeta;
};

// Strapi v5 can return either { id, attributes: {...} } (v4-like)
// or a flattened shape { id, ...fields }. Support both.
export type StrapiListItem<T> =
  | { id: number; attributes: T }
  | ({ id: number } & T & { documentId?: string });

export type TodoAttrs = {
  title: string;
  done: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
};

export type Todo = {
  id: number;
  documentId?: string;
  title: string;
  done: boolean;
  createdAt?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export type ListSort = 'created_desc' | 'created_asc';
export type ListFilter = 'all' | 'active' | 'completed';

function buildListQuery(
  page: number,
  pageSize: number,
  search?: string,
  filter?: ListFilter,
  sort?: ListSort
) {
  const params = new URLSearchParams();
  params.set('pagination[page]', String(page));
  params.set('pagination[pageSize]', String(pageSize));
  // sort
  const sortVal = sort === 'created_asc' ? 'createdAt:asc' : 'createdAt:desc';
  params.set('sort', sortVal);
  // search
  if (search && search.trim()) {
    params.set('filters[title][$containsi]', search.trim());
  }
  // done filter
  if (filter === 'active') params.set('filters[done][$eq]', 'false');
  if (filter === 'completed') params.set('filters[done][$eq]', 'true');
  return params.toString();
}

export const endpoints = {
  list: (
    page: number = 1,
    pageSize: number = 10,
    opts?: { search?: string; filter?: ListFilter; sort?: ListSort }
  ) =>
    `${API_URL}/api/todos?${buildListQuery(
      page,
      pageSize,
      opts?.search,
      opts?.filter,
      opts?.sort
    )}`,
  create: `${API_URL}/api/todos`,
  item: (idOrDoc: string | number) => `${API_URL}/api/todos/${idOrDoc}`,
};

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function mapTodo(item: StrapiListItem<TodoAttrs>): Todo {
  const toBool = (v: any) => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
    return Boolean(v);
  };
  // flattened v5 shape
  if ('title' in item) {
    const anyItem = item as any;
    return {
      id: anyItem.id,
      documentId: anyItem.documentId,
      title: anyItem.title,
      done: toBool(anyItem.done),
      createdAt: anyItem.createdAt,
    };
  }
  // v4-like shape with attributes
  const withAttr = item as { id: number; attributes: TodoAttrs };
  return {
    id: withAttr.id,
    documentId: undefined,
    title: withAttr.attributes.title,
    done: toBool((withAttr as any).attributes?.done),
    createdAt: withAttr.attributes.createdAt,
  };
}

export async function createTodo(title: string) {
  const res = await fetch(endpoints.create, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { title } }),
  });
  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(`Failed to create todo: ${msg}`);
  }
  return (await res.json()) as StrapiResponse<StrapiListItem<TodoAttrs>>;
}

export async function updateTodo(idOrDoc: string | number, patch: Partial<TodoAttrs>) {
  const res = await fetch(endpoints.item(idOrDoc), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: patch }),
  });
  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(`Failed to update todo: ${msg}`);
  }
  return (await res.json()) as StrapiResponse<StrapiListItem<TodoAttrs>>;
}

export async function deleteTodo(idOrDoc: string | number): Promise<void> {
  const res = await fetch(endpoints.item(idOrDoc), { method: 'DELETE' });
  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(`Failed to delete todo: ${msg}`);
  }
  // Strapi v5 returns 204 No Content on successful DELETE
  if (res.status === 204) return;
  // Some setups may still return JSON; safely consume it but ignore
  try {
    await res.json();
  } catch {
    /* ignore */
  }
}

async function safeError(res: Response) {
  try {
    const text = await res.text();
    return `${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}
