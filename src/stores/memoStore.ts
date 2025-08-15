import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TodoItem {
  id: number;
  text: string;
  createdAt: Date;
  isCompleted: boolean;
}

interface MemoStore {
  todos: TodoItem[];
  inputText: string;
  filter: "all" | "active" | "isCompleted";

  setInputText: (text: string) => void;
  setFilter: (filter: "all" | "active" | "isCompleted") => void;
  addTodo: () => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
}

export const useMemoStore = create<MemoStore>()(
  persist(
    (set, get) => ({
      todos: [],
      inputText: "",
      filter: "all",
    
      setInputText: (text:string) => set({ inputText: text}),
      setFilter: (filter: "all" | "active" | "isCompleted") => set({ filter }),
      addTodo: () => {
        const { inputText, todos } = get();
        if (inputText.trim()) {
          const newTodo: TodoItem = {
            id: Date.now(),
            text: inputText.trim(),
            createdAt: new Date(),
            isCompleted: false,
          };
          set((state) => ({
            todos: [...state.todos, newTodo],
            inputText: "",
          }));
        }
      },
      toggleTodo: (id: number) => {
        const { todos } = get();
        set({
          todos: todos.map((todo) => todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo)
        });
      },
      deleteTodo: (id: number) => {
        const { todos } = get();
        set({
          todos: todos.filter((todo) => todo.id !== id),
        })
      },
    }),
    {
      name: "memo-store",
      partialize: (state) => ({
        todos: state.todos.map(todo => ({
          ...todo,
          createdAt: todo.createdAt.toISOString(),
        })),
        inputText: state.inputText,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.todos = state.todos.map(todo => ({
            ...todo,
            createdAt: new Date(todo.createdAt)
          }));
        }
      },
    }
  )
);