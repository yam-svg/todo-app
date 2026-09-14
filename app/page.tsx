import { asc, eq, sql } from 'drizzle-orm';
import type { Session } from 'next-auth';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { todos, type Todo } from '@/lib/schema';
import type { TodoDTO } from '@/lib/types';
import SignInCard from '@/components/SignInCard';
import UserActions from '@/components/UserActions';
import TodoList from '@/components/TodoList';

// 每次请求实时读取（依赖登录态与数据库），不参与构建期预渲染
export const dynamic = 'force-dynamic';

function toDTO(t: Todo): TodoDTO {
  return {
    id: t.id,
    title: t.title,
    note: t.note,
    done: t.done,
    priority: t.priority,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
  };
}

export default async function Home() {
  // 环境变量未配置完整（如缺 GITHUB_ID）时 auth() 会抛错，按未登录处理
  let session: Session | null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session?.user?.id) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
        <SignInCard configured={Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET)} />
      </main>
    );
  }

  let items: Todo[] = [];
  let dbError = false;
  try {
    items = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, session.user.id))
      .orderBy(
        asc(todos.done),
        sql`case todos.priority when 'high' then 0 when 'medium' then 1 else 2 end`,
        asc(todos.dueDate),
        sql`todos.created_at desc`,
      );
  } catch {
    dbError = true;
  }
  
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">工作待办</h1>
          <UserActions name={session.user.name ?? session.user.email ?? undefined} />
        </header>
        {dbError ? <DbNotice /> : <TodoList todos={items.map(toDTO)} />}
      </div>
    </main>
  );
}

function DbNotice() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
      <p className="font-medium">数据库连接失败</p>
      <p className="mt-2 leading-relaxed">
        请确认已配置 <code className="rounded bg-amber-100 px-1">DATABASE_URL</code>（Vercel 控制台 → 项目 → Storage →
        创建 Postgres 实例），并已在本地执行 <code className="rounded bg-amber-100 px-1">npm run db:push</code>{' '}
        建表。详见 README。
      </p>
    </div>
  );
}
