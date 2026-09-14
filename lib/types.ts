export type TodoPriority = 'low' | 'medium' | 'high';

/** 传给客户端组件的待办数据结构（日期序列化为 ISO 字符串） */
export interface TodoDTO {
  id: string;
  title: string;
  note: string | null;
  done: boolean;
  priority: TodoPriority;
  dueDate: string | null;
  createdAt: string;
}
