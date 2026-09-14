import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { Sql } from 'postgres';
import * as schema from './schema';

// 开发模式热更新会重复构建连接，缓存到 globalThis 避免连接泄漏
const globalForPg = globalThis as unknown as { pg?: Sql };
const client = globalForPg.pg ?? postgres(process.env.DATABASE_URL ?? '', { max: 1 });

if (process.env.NODE_ENV !== 'production') globalForPg.pg = client;

export const db = drizzle(client, { schema });
