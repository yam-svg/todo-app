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
  /** 有请求进行中时禁用操作，避免重复提交 */
  busy?: boolean;
  onError?: (message: string) => void;
}

function formatDue(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

export default function TodoItem({ todo, onToggle, onDelete, onUpdate, busy, onError }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [note, setNote] = useState(todo.note ?? '');
  const [priority, setPriority] = useState<TodoPriority>(todo.priority);
  const [dueDate, setDueDate] = useState(todo.dueDate ? todo.dueDate.slice(0, 10) : '');
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleToggle() {
    setToggling(true);
    try {
      await onToggle(todo);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : '操作失败，请稍后重试');
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('确定删除这条待办？')) return;
    setDeleting(true);
    try {
      await onDelete(todo);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : '删除失败，请稍后重试');
    } finally {
      setDeleting(false);
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
    <li
      className={`group flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm transition ${
        todo.done ? 'border-neutral-200' : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
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

      <div className="flex shrink-0 items-center gap-1.5">
        {/* 明显的完成/撤销操作项，替代原有复选框 */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={busy || toggling}
          className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
            todo.done
              ? 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'
              : 'bg-neutral-900 text-white hover:bg-neutral-700'
          }`}
        >
          {toggling ? (
            todo.done ? '撤销中…' : '完成中…'
          ) : todo.done ? (
            '撤销完成'
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.3a1 1 0 0 1-1.42.004L3.29 9.2a1 1 0 1 1 1.42-1.408l2.087 2.1 6.493-6.587a1 1 0 0 1 1.414-.006Z"
                  clipRule="evenodd"
                />
              </svg>
              完成
            </>
          )}
        </button>
        <button
          type="button"
          onClick={startEdit}
          disabled={busy}
          className="rounded-md px-2 py-1.5 text-xs text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          编辑
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy || deleting}
          className="rounded-md px-2 py-1.5 text-xs text-red-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? '删除中…' : '删除'}
        </button>
      </div>
    </li>
  );
}
