import { NextResponse } from 'next/server';
import { asc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { todos } from '@/lib/schema';

// 排序：未完成在前 → 优先级(高>中>低) → 截止日期(空值排最后) → 创建时间倒序
const orderBy = [
  asc(todos.done),
  sql`case todos.priority when 'high' then 0 when 'medium' then 1 else 2 end`,
  asc(todos.dueDate),
  sql`todos.created_at desc`,
];

const createSchema = z.object({
  title: z.string().trim().min(1, '标题不能为空').max(200, '标题不能超过 200 字'),
  note: z.string().trim().max(2000, '备注不能超过 2000 字').nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']).nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const items = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, session.user.id))
    .orderBy(...orderBy);

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体必须是 JSON' }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { title, note, priority, dueDate } = parsed.data;
  const [item] = await db
    .insert(todos)
    .values({
      userId: session.user.id,
      title,
      note: note || null,
      priority: priority ?? 'medium',
      dueDate: dueDate ?? null,
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}
