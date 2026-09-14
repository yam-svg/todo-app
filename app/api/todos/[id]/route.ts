import { NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { todos } from '@/lib/schema';

const idSchema = z.string().uuid('无效的待办 ID');

const updateSchema = z.object({
  title: z.string().trim().min(1, '标题不能为空').max(200, '标题不能超过 200 字').optional(),
  note: z.string().trim().max(2000, '备注不能超过 2000 字').nullable().optional(),
  done: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: '无效的待办 ID' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体必须是 JSON' }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const [item] = await db
    .update(todos)
    .set({ ...parsed.data, updatedAt: sql`now()` })
    .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)))
    .returning();

  if (!item) {
    return NextResponse.json({ error: '待办不存在或无权操作' }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: '无效的待办 ID' }, { status: 400 });
  }

  const [item] = await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)))
    .returning();

  if (!item) {
    return NextResponse.json({ error: '待办不存在或无权操作' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
