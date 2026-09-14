'use client';

import { useState } from 'react';
import type { TodoPriority } from '@/lib/types';

export interface NewTodoInput {
  title: string;
  note: string | null;
  priority: TodoPriority;
  dueDate: string | null; // 'YYYY-MM-DD'
}

interface TodoFormProps {
  onAdd: (input: NewTodoInput) => Promise<void>;
  disabled?: boolean;
}

export default function TodoForm({ onAdd, disabled }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('请输入待办标题');
      return;
    }
    setError(null);
    try {
      await onAdd({
        title: title.trim(),
        note: note.trim() || null,
        priority,
        dueDate: dueDate || null,
      });
      setTitle('');
      setNote('');
      setPriority('medium');
      setDueDate('');
      setExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="要做什么？"
          maxLength={200}
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          添加
        </button>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-xs text-neutral-400 hover:text-neutral-600"
      >
        {expanded ? '收起细节 ▲' : '优先级 / 截止日期 / 备注 ▼'}
      </button>

      {expanded && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-neutral-500">
            优先级
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TodoPriority)}
              className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1.5 text-sm text-neutral-800"
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </label>
          <label className="text-xs text-neutral-500">
            截止日期
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1.5 text-sm text-neutral-800"
            />
          </label>
          <label className="text-xs text-neutral-500 sm:col-span-2">
            备注
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="可选"
              className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1.5 text-sm text-neutral-800"
            />
          </label>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </form>
  );
}
