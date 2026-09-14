# 工作待办（todo-app）

基于 **Next.js 15 + Vercel Postgres** 的简洁工作待办记录工具，可一键部署到 Vercel。

## 功能

- 新增 / 编辑 / 删除 / 勾选完成待办
- 筛选（全部 / 未完成 / 已完成）与关键词搜索
- 优先级（高 / 中 / 低）、截止日期（逾期高亮）、备注
- 排序：未完成在前 → 优先级 → 截止日期 → 创建时间
- 多设备同步（数据存于 Vercel Postgres，GitHub 账号登录）

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 15（App Router）+ TypeScript |
| 样式 | Tailwind CSS v4 |
| 数据库 | Vercel Postgres + Drizzle ORM |
| 认证 | Auth.js v5（GitHub OAuth，JWT 会话） |
| 部署 | Vercel（Hobby 免费套餐） |

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 创建数据库

Vercel 控制台 → 选择/创建项目 → **Storage** → **Add Database** → 选择 **Postgres**，复制连接串。
（也可使用 Neon 等其他 serverless Postgres，只要拿到 `postgres://` 连接串即可。）

### 3. 配置环境变量

```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local
# macOS / Linux
cp .env.example .env.local
```

编辑 `.env.local`：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | 上一步复制的连接串 |
| `AUTH_SECRET` | 用 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 生成 |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub → Settings → Developer settings → **OAuth Apps** → New OAuth App 创建；**Callback URL** 本地填 `http://localhost:3000/api/auth/callback/github`，部署后改为 `https://<你的域名>/api/auth/callback/github` |

### 4. 建表

```bash
npm run db:push
```

### 5. 启动

```bash
npm run dev
```

打开 http://localhost:3000 ，点击「使用 GitHub 登录」。

## 部署到 Vercel

1. 将代码推送到 GitHub。
2. Vercel → **Add New Project** → 选择该仓库（框架自动识别为 Next.js，无需改构建配置）。
3. 在 **Environment Variables** 中配置 `DATABASE_URL`、`AUTH_SECRET`、`AUTH_TRUST_HOST=true`、`GITHUB_ID`、`GITHUB_SECRET`（GitHub OAuth 的 Callback URL 改为线上域名）。
4. **首次部署前先在本地连线上库执行一次 `npm run db:push`** 建表。
5. Deploy 完成，访问分配的域名即可使用。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm run db:push` | 将 schema 直接同步到数据库（开发期推荐） |
| `npm run db:generate` | schema 变更后生成 SQL 迁移文件到 `drizzle/` |
| `npm run db:migrate` | 执行 `drizzle/` 下的迁移 |
| `npm run db:studio` | 打开 Drizzle Studio 数据库 GUI |

## 目录结构

```
app/
  page.tsx                # 主页面（Server Component，直读数据库渲染列表）
  layout.tsx              # 全局布局
  api/
    auth/[...nextauth]/   # Auth.js 路由
    todos/route.ts        # GET 列表 / POST 创建
    todos/[id]/route.ts   # PATCH 更新 / DELETE 删除
components/               # 客户端组件（TodoList / TodoItem / TodoForm / FilterBar 等）
lib/
  schema.ts               # Drizzle 表定义（todos）
  db.ts                   # 数据库连接
  auth.ts                 # Auth.js 配置
  types.ts                # 前后端共享类型
drizzle.config.ts         # drizzle-kit 配置
```
