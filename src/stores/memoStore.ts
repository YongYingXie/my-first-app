import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '~/trpc/react';

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

  // 本地操作（立即更新UI）
  addTodo: () => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;

  // 同步操作（与后端同步）
  syncTodos: () => Promise<void>;
  syncAddTodo: (text: string) => Promise<void>;
  syncToggleTodo: (id: string) => Promise<void>;
  syncDeleteTodo: (id: string) => Promise<void>;
}

export const useMemoStore = create<MemoStore>()(
  persist(
    (set, get) => ({
      todos: [],
      inputText: '',
      filter: 'all',
      isLoading: false,

      setInputText: (text: string) => set({ inputText: text }),
      setFilter: (filter: 'all' | 'active' | 'isCompleted') => set({ filter }),

      // 本地操作 - 立即更新UI
      addTodo: () => {
        const { inputText, todos } = get();
        if (inputText.trim()) {
          const newTodo: TodoItem = {
            id: `temp-${Date.now()}`, // 临时ID
            text: inputText.trim(),
            createdAt: new Date(),
            isCompleted: false,
          };
          set((state) => ({
            todos: [...state.todos, newTodo],
            inputText: '',
          }));
        }
      },

      toggleTodo: (id: string) => {
        const { todos } = get();
        set({
          todos: todos.map((todo) =>
            todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
          ),
        });
      },

      deleteTodo: (id: string) => {
        const { todos } = get();
        set({
          todos: todos.filter((todo) => todo.id !== id),
        });
      },

      // 同步操作 - 与后端API同步
      syncTodos: async () => {
        set({ isLoading: true });
        try {
          // 这里我们需要在组件中调用，因为hooks不能在store中直接使用
          // 我们会在组件中实现这个逻辑
        } catch (error) {
          console.error('Failed to sync todos:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      syncAddTodo: async (text: string) => {
        const { todos } = get();
        if (text.trim()) {
          try {
            // 在组件中调用API
            // 成功后更新本地状态
            const newTodo: TodoItem = {
              id: `temp-${Date.now()}`,
              text: text.trim(),
              createdAt: new Date(),
              isCompleted: false,
            };
            set((state) => ({
              todos: [...state.todos, newTodo],
              inputText: '',
            }));
          } catch (error) {
            console.error('Failed to add todo:', error);
          }
        }
      },

      syncToggleTodo: async (id: string) => {
        const { todos } = get();
        const todo = todos.find((t) => t.id === id);
        if (todo) {
          // 乐观更新
          set({
            todos: todos.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)),
          });
        }
      },

      syncDeleteTodo: async (id: string) => {
        const { todos } = get();
        // 乐观删除
        set({
          todos: todos.filter((todo) => todo.id !== id),
        });
      },
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
