'use client';

import { useState } from 'react';
import type { TodoDTO, TodoPriority } from '@/lib/types';

const PRIORITY_META: Record<TodoPriority, { label: string; className: string }> = {
  high: { label: '高', className: 'border-red-200 bg-red-50 text-red-600' },
  medium: { label: '中', className: 'border-amber-200 bg-amber-50 text-amber-600' },
  low: { label: '低', className: 'border-neutral-200 bg-neutral-50 text-neutral-500' },
};

interface TodoItemProps {
  todo: TodoDTO;
  onToggle: (todo: TodoDTO) => Promise<void>;
  onDelete: (todo: TodoDTO) => Promise<void>;
  onUpdate: (
    todo: TodoDTO,
    patch: Partial<Pick<TodoDTO, 'title' | 'note' | 'priority' | 'dueDate'>>,
  ) => Promise<void>;
  onError?: (message: string) => void;
}

function formatDue(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

export default function TodoItem({ todo, onToggle, onDelete, onUpdate, onError }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [note, setNote] = useState(todo.note ?? '');
  const [priority, setPriority] = useState<TodoPriority>(todo.priority);
  const [dueDate, setDueDate] = useState(todo.dueDate ? todo.dueDate.slice(0, 10) : '');
  const [saving, setSaving] = useState(false);

  const overdue = !todo.done && todo.dueDate !== null && new Date(todo.dueDate) < new Date();

  function startEdit() {
    setTitle(todo.title);
    setNote(todo.note ?? '');
    setPriority(todo.priority);
    setDueDate(todo.dueDate ? todo.dueDate.slice(0, 10) : '');
    setEditing(true);
  }

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onUpdate(todo, {
        title: title.trim(),
        note: note.trim() || null,
        priority,
        dueDate: dueDate || null,
      });
      setEditing(false);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : '保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <li className="rounded-lg border border-neutral-300 bg-white p-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          autoFocus
          className="w-full rounded-md border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-neutral-400"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TodoPriority)}
            className="rounded-md border border-neutral-200 px-2 py-1 text-xs"
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-md border border-neutral-200 px-2 py-1 text-xs"
          />
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="备注"
          className="mt-2 w-full rounded-md border border-neutral-200 px-2 py-1.5 text-sm"
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={() => setEditing(false)}
            className="rounded-md px-3 py-1 text-xs text-neutral-500 hover:bg-neutral-100"
          >
            取消
          </button>
          <button
            onClick={save}
            disabled={saving || !title.trim()}
            className="rounded-md bg-neutral-900 px-3 py-1 text-xs text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="group flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition hover:border-neutral-300">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo)}
        className="mt-0.5 size-4 accent-neutral-900"
        aria-label="切换完成状态"
      />
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${todo.done ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
          {todo.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full border px-2 py-0.5 ${PRIORITY_META[todo.priority].className}`}>
            {PRIORITY_META[todo.priority].label}
          </span>
          {todo.dueDate && (
            <span className={overdue ? 'font-medium text-red-600' : 'text-neutral-400'}>
              {overdue ? '已逾期 ' : '截止 '}
              {formatDue(todo.dueDate)}
            </span>
          )}
        </div>
        {todo.note && (
          <p className={`mt-1 whitespace-pre-wrap break-words text-xs ${todo.done ? 'text-neutral-300' : 'text-neutral-500'}`}>
            {todo.note}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={startEdit}
          className="rounded-md px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        >
          编辑
        </button>
        <button
          onClick={() => {
            if (window.confirm('确定删除这条待办？')) void onDelete(todo);
          }}
          className="rounded-md px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-600"
        >
          删除
        </button>
      </div>
    </li>
  );
}
