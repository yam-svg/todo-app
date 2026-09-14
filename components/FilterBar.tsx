'use client';

export type Filter = 'all' | 'active' | 'done';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '未完成' },
  { value: 'done', label: '已完成' },
];

interface FilterBarProps {
  filter: Filter;
  onFilter: (f: Filter) => void;
  query: string;
  onQuery: (q: string) => void;
  counts: Record<Filter, number>;
}

export default function FilterBar({ filter, onFilter, query, onQuery, counts }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-1 rounded-lg bg-neutral-200/60 p-1">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilter(value)}
            className={`rounded-md px-3 py-1 text-sm transition ${
              filter === value
                ? 'bg-white font-medium text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {label} <span className="text-xs text-neutral-400">{counts[value]}</span>
          </button>
        ))}
      </div>
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="搜索待办…"
        className="w-full max-w-56 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-neutral-400"
      />
    </div>
  );
}
