'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth';

export default function SignInCard({ configured }: { configured: boolean }) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-neutral-900">工作待办</h1>
      <p className="mt-2 text-sm text-neutral-500">使用 GitHub 账号登录，查看和管理你的待办事项</p>
      {!configured && (
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-left text-xs leading-relaxed text-amber-700">
          GitHub OAuth 尚未配置：请在环境变量中设置 <code>GITHUB_ID</code> 与 <code>GITHUB_SECRET</code>
          （申请步骤见 README）。
        </p>
      )}
      <button
        onClick={() => {
          setLoading(true);
          signIn('github', { redirectTo: '/' });
        }}
        disabled={loading || !configured}
        className="mt-6 w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? '正在跳转 GitHub…' : '使用 GitHub 登录'}
      </button>
    </div>
  );
}
