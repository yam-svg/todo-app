'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TodoDTO } from '@/lib/types';
import FilterBar, { type Filter } from './FilterBar';
import TodoForm, { type NewTodoInput } from './TodoForm';
import TodoItem from './TodoItem';

interface TodoListProps {
  /** 服务端渲染下来的最新数据；操作完成后通过 router.refresh() 更新 */
  todos: TodoDTO[];
}

export default function TodoList({ todos }: TodoListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('active');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const counts: Record<Filter, number> = {
    all: todos.length,
    active: todos.filter((t) => !t.done).length,
    done: todos.filter((t) => t.done).length,
  };

  const q = query.trim().toLowerCase();
  const visible = todos.filter((t) => {
    if (filter === 'active' && t.done) return false;
    if (filter === 'done' && !t.done) return false;
    if (q && !t.title.toLowerCase().includes(q) && !(t.note ?? '').toLowerCase().includes(q)) return false;
    return true;
  });

  async function mutate(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请稍后重试');
    }
  }

  async function api(path: string, options?: RequestInit) {
    const res = await fetch(path, options);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? `请求失败（${res.status}）`);
    }
    return res.json();
  }

  const jsonOptions = (method: string, body: unknown): RequestInit => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const handleAdd = (input: NewTodoInput) => mutate(() => api('/api/todos', jsonOptions('POST', input)));

  const handleToggle = (t: TodoDTO) =>
    mutate(() => api(`/api/todos/${t.id}`, jsonOptions('PATCH', { done: !t.done })));

  const handleUpdate = (
    t: TodoDTO,
    patch: Partial<Pick<TodoDTO, 'title' | 'note' | 'priority' | 'dueDate'>>,
  ) => mutate(() => api(`/api/todos/${t.id}`, jsonOptions('PATCH', patch)));

  const handleDelete = (t: TodoDTO) => mutate(() => api(`/api/todos/${t.id}`, { method: 'DELETE' }));

  return (
    <div>
      <TodoForm onAdd={handleAdd} disabled={pending} />

      <div className="mt-4">
        <FilterBar filter={filter} onFilter={setFilter} query={query} onQuery={setQuery} counts={counts} />
      </div>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      {pending && (
        <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400" aria-live="polite">
          <span className="size-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-500" />
          正在更新…
        </div>
      )}

      <div className={`transition-opacity duration-200 ${pending ? 'pointer-events-none opacity-50' : 'opacity-100'}`}>
        {visible.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {visible.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onError={setError}
                busy={pending}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-center text-sm text-neutral-400">
            {todos.length === 0 ? '还没有待办，先在上方添加一条吧' : '没有符合条件的待办'}
          </p>
        )}
      </div>
    </div>
  );
}
