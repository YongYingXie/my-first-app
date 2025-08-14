"use client";

import { useEffect, useState } from "react";

interface TodoItem {
  id: number;
  text: string;
  createdAt: Date;
  isCompleted: boolean;
}

export function Memo() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [filter, setFilter] = useState<'all' | 'active' | 'isCompleted'>('all');

  const STORAGE_KEY = "memo.todos";
  const INPUT_KEY = "memo.inputText";

  // 首次加载时读本地存储，把字符串日期转回Date
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Array<{
      id: number;
      text: string;
      createdAt: string;
      isCompleted: boolean;
    }>;
    setTodos(
      parsed.map((t) => ({
        ...t,
        createdAt: new Date(t.createdAt),
      }))
    );
  }, []);

  // todos变化时候写本地存储，把Date转为ISO字符串
  useEffect(() => {
    const serializable = todos.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }, [todos]);

  useEffect(() => {
    const saved = localStorage.getItem(INPUT_KEY);
    if (saved !== null) setInputText(saved);
  }, []);

  useEffect(() => {
    if (inputText) {
      localStorage.setItem(INPUT_KEY, inputText);
    } else {
      localStorage.removeItem(INPUT_KEY);
    }
  }, [inputText]);

  const addTodo = () => {
    if (inputText.trim()) {
      const newTodo: TodoItem = {
        id: Date.now(),
        text: inputText.trim(),
        createdAt: new Date(),
        isCompleted: false,
      };
      setTodos([...todos, newTodo]);
      setInputText("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => todo.id === id ? {...todo, isCompleted: !todo.isCompleted } : todo));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = filter === 'all'
  ? todos
  : filter === 'active'
  ? todos.filter(t => !t.isCompleted)
  : todos.filter(t => t.isCompleted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Memo</h1>
          <p className="text-gray-600 text-lg">记录你的待办事项，让生活更有条理</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text" 
              placeholder="输入你的待办事项..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
            />
            <button
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              onClick={addTodo}
              disabled={!inputText.trim()}
            >
              添加
            </button>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${filter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              全部 ({todos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${filter === 'active'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              待完成 ({todos.filter(t => !t.isCompleted).length})
            </button>
            <button
              onClick={() => setFilter('isCompleted')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${filter === 'isCompleted'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              已完成 ({todos.filter(t => t.isCompleted).length})
            </button>
          </div>
          <div className="space-y-4">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg">还没有待办事项，开始添加吧！</p>
              </div>
            ) : (
              filteredTodos.map(todo => (
                <div
                  key={todo.id}
                  className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg ${todo.isCompleted ? "opacity-75" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleTodo(todo.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleTodo(todo.id);
                          }
                        }}
                        role="checkbox"
                        aria-checked={todo.isCompleted}
                        aria-label={todo.isCompleted ? '标记为未完成' : '标记为已完成'}
                        className={`mt-1 grid place-items-center w-5 h-5 rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          todo.isCompleted ? 'bg-green-600 border-green-600' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {todo.isCompleted && (
                          <svg
                            className="w-3 h-3 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`text-lg text-gray-800 ${todo.isCompleted ? "line-through text-gray-500" : ""}`}>{todo.text}</p>
                        <p className="text-sm text-gray-500 mt-1">创建时间：{todo.createdAt.toLocaleString("zh-CN")}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
            {todos.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{todos.length}</div>
                    <div className="text-sm text-blue-500">总任务</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {todos.filter(t => t.isCompleted).length}
                    </div>
                    <div className="text-sm text-green-500">已完成</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {todos.filter(t => !t.isCompleted).length}
                    </div>
                    <div className="text-sm text-orange-500">待完成</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}