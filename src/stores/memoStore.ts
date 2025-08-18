import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TodoItem {
  id: string;
  text: string;
  createdAt: Date;
  isCompleted: boolean;
}

interface MemoStore {
  todos: TodoItem[];
  inputText: string;
  filter: 'all' | 'active' | 'isCompleted';
  isLoading: boolean;

  setInputText: (text: string) => void;
  setFilter: (filter: 'all' | 'active' | 'isCompleted') => void;
  
  // 同步操作 - 等待后端响应后再更新前端状态
  setTodos: (todos: TodoItem[]) => void;
  addTodo: (todo: TodoItem) => void;
  updateTodo: (id: string, updates: Partial<TodoItem>) => void;
  removeTodo: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useMemoStore = create<MemoStore>()(
  persist(
    (set) => ({
      todos: [],
      inputText: '',
      filter: 'all',
      isLoading: false,

      setInputText: (text: string) => set({ inputText: text }),
      setFilter: (filter: 'all' | 'active' | 'isCompleted') => set({ filter }),
      
      // 同步操作 - 直接更新状态，不涉及API调用
      setTodos: (todos: TodoItem[]) => set({ todos }),
      addTodo: (todo: TodoItem) => set((state) => ({ todos: [...state.todos, todo] })),
      updateTodo: (id: string, updates: Partial<TodoItem>) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, ...updates } : todo
          ),
        })),
      removeTodo: (id: string) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'memo-store',
      partialize: (state) => ({
        todos: state.todos.map((todo) => ({
          ...todo,
          createdAt: todo.createdAt.toISOString(),
        })),
        inputText: state.inputText,
        filter: state.filter,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.todos = state.todos.map((todo) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
          }));
        }
      },
    }
  )
);
