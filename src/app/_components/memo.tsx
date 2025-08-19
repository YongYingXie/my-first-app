'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import { api } from '~/trpc/react';
import { useMemoStore } from '../../stores/memoStore';

export function Memo() {
  const { data: session, status } = useSession();
  const {
    todos,
    inputText,
    filter,
    setInputText,
    setFilter,
    setTodos,
    addTodo,
    updateTodo,
    removeTodo,
    setLoading,
  } = useMemoStore();

  // 获取后端数据
  const { data: serverTodos = [], isLoading: isFetching } = api.todo.getAll.useQuery(undefined, {
    enabled: !!session?.user, // 只有登录用户才能获取数据
  });

  const createTodoMutation = api.todo.create.useMutation({
    onSuccess: (newTodo) => {
      // 后端创建成功后，将新todo添加到前端状态
      const formattedTodo = {
        id: newTodo.id,
        text: newTodo.text,
        createdAt: new Date(newTodo.createdAt),
        isCompleted: newTodo.isCompleted,
      };
      addTodo(formattedTodo);
      setInputText(''); // 清空输入框
    },
    onError: (error) => {
      console.error('Failed to create todo:', error);
      // 可以在这里添加错误提示UI
    },
  });

  const toggleTodoMutation = api.todo.toggle.useMutation({
    onSuccess: (updatedTodo) => {
      // 后端更新成功后，更新前端状态
      updateTodo(updatedTodo.id, {
        isCompleted: updatedTodo.isCompleted,
      });
    },
    onError: (error) => {
      console.error('Failed to toggle todo:', error);
      // 错误已在 mutation 的 onError 中处理
    },
  });

  const deleteTodoMutation = api.todo.delete.useMutation({
    onSuccess: (_, variables) => {
      // 后端删除成功后，从前端状态中移除
      removeTodo(variables.id);
    },
    onError: (error) => {
      console.error('Failed to delete todo:', error);
      // 错误已在 mutation 的 onError 中处理
    },
  });

  // 同步后端数据到前端状态
  useEffect(() => {
    if (serverTodos.length > 0) {
      const serverTodosFormatted = serverTodos.map((todo) => ({
        id: todo.id,
        text: todo.text,
        createdAt: new Date(todo.createdAt),
        isCompleted: todo.isCompleted,
      }));
      setTodos(serverTodosFormatted);
    }
  }, [serverTodos, setTodos]);

  // 设置加载状态
  useEffect(() => {
    setLoading(isFetching);
  }, [isFetching, setLoading]);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.isCompleted);
      case 'isCompleted':
        return todos.filter((todo) => todo.isCompleted);
      default:
        return todos;
    }
  }, [todos, filter]);

  // 计算待完成的数量
  const activeCount = useMemo(() => {
    return todos.filter((todo) => !todo.isCompleted).length;
  }, [todos]);

  // 计算已完成的数量
  const completedCount = useMemo(() => {
    return todos.filter((todo) => todo.isCompleted).length;
  }, [todos]);

  // 添加 Todo 函数 - 等待后端响应
  const handleAddTodo = async () => {
    if (inputText.trim()) {
      try {
        // 等待后端创建成功后再更新前端状态
        await createTodoMutation.mutateAsync({ text: inputText.trim() });
      } catch (error) {
        // 错误已在 mutation 的 onError 中处理
        console.error('Failed to add todo:', error);
      }
    }
  };

  // 切换 Todo 状态函数 - 等待后端响应
  const handleToggleTodo = async (id: string) => {
    try {
      // 等待后端更新成功后再更新前端状态
      await toggleTodoMutation.mutateAsync({ id });
    } catch (error) {
      // 错误已在 mutation 的 onError 中处理
      console.error('Failed to toggle todo:', error);
    }
  };

  // 删除 Todo 函数 - 等待后端响应
  const handleDeleteTodo = async (id: string) => {
    try {
      // 等待后端删除成功后再更新前端状态
      await deleteTodoMutation.mutateAsync({ id });
    } catch (error) {
      // 错误已在 mutation 的 onError 中处理
      console.error('Failed to delete todo:', error);
    }
  };

  // 如果正在加载认证状态，显示加载指示器
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl font-bold text-gray-800 mb-2">Loading...</div>
        </div>
      </div>
    );
  }

  // 如果用户未登录，显示登录提示
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl font-bold text-gray-800 mb-4">Welcome to My Memo</div>
          <p className="text-gray-600 text-lg mb-8">Please sign in to manage your todo list</p>
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => window.location.href = '/auth/signup'}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Memo</h1>
          <p className="text-gray-600 text-lg">
            Welcome back, {session.user.name || session.user.email}!
          </p>
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
              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              disabled={createTodoMutation.isPending}
            />
            <button
              type="button"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
              onClick={handleAddTodo}
              disabled={!inputText.trim() || createTodoMutation.isPending}
            >
              {createTodoMutation.isPending ? '添加中...' : '添加'}
            </button>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              全部 ({todos.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${
                  filter === 'active'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              待完成 {activeCount}
            </button>
            <button
              type="button"
              onClick={() => setFilter('isCompleted')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${
                  filter === 'isCompleted'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              已完成 {completedCount}
            </button>
          </div>

          {/* 加载状态指示器 */}
          {isFetching && <div className="text-center py-4 text-blue-600">正在同步数据...</div>}

          <div className="space-y-4">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {filter === 'all'
                  ? '还没有待办事项，开始添加吧！'
                  : filter === 'active'
                    ? '没有待完成的事项'
                    : '没有已完成的事项'}
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTodo(todo.id)}
                    disabled={toggleTodoMutation.isPending}
                    className={`w-5 h-5 rounded border-2 transition-colors ${
                      todo.isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {todo.isCompleted && '✓'}
                  </button>
                  <span
                    className={`flex-1 text-gray-700 ${
                      todo.isCompleted ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTodo(todo.id)}
                    disabled={deleteTodoMutation.isPending}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    删除
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
