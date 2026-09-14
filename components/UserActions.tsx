'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function UserActions({ name }: { name?: string }) {
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className="flex items-center gap-3 text-sm text-neutral-500">
      {name ? <span className="max-w-48 truncate">{name}</span> : null}
      <button
        onClick={() => {
          setSigningOut(true);
          void signOut({ redirectTo: '/' });
        }}
        disabled={signingOut}
        className="rounded-md border border-neutral-200 px-3 py-1.5 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {signingOut ? '退出中…' : '退出登录'}
      </button>
    </div>
  );
}
