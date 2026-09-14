'use client';

import { signOut } from 'next-auth/react';

export default function UserActions({ name }: { name?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-neutral-500">
      {name ? <span className="max-w-48 truncate">{name}</span> : null}
      <button
        onClick={() => signOut({ redirectTo: '/' })}
        className="rounded-md border border-neutral-200 px-3 py-1.5 text-neutral-600 transition hover:bg-neutral-100"
      >
        退出登录
      </button>
    </div>
  );
}
