'use client';

import { useEffect, useMemo } from 'react';
import { api } from '~/trpc/react';
import { useMemoStore } from '../../stores/memoStore';

export function Memo() {
  const { todos, inputText, filter, setInputText, setFilter, addTodo, toggleTodo, deleteTodo } =
    useMemoStore();

  // 获取后端数据
  const { data: serverTodos = [], refetch } = api.todo.getAll.useQuery();
  const createTodoMutation = api.todo.create.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const toggleTodoMutation = api.todo.toggle.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const deleteTodoMutation = api.todo.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // 同步后端数据到本地状态（仅在组件挂载时）
  useEffect(() => {
    if (serverTodos.length > 0) {
      // 将服务器数据转换为本地格式并合并
      const serverTodosFormatted = serverTodos.map((todo) => ({
        id: todo.id,
        text: todo.text,
        createdAt: new Date(todo.createdAt),
        isCompleted: todo.isCompleted,
      }));

      // 合并本地和服务器数据，避免重复
      const existingIds = new Set(todos.map((t) => t.id));
      const newTodos = serverTodosFormatted.filter((t) => !existingIds.has(t.id));

      if (newTodos.length > 0) {
        // 这里我们需要在 store 中添加一个方法来合并数据
        // 暂时先直接使用服务器数据
        useMemoStore.setState({ todos: serverTodosFormatted });
      }
    }
  }, [serverTodos]);

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

  // 增强的添加 Todo 函数
  const handleAddTodo = async () => {
    if (inputText.trim()) {
      // 先添加到本地状态（乐观更新）
      addTodo();

      // 同步到后端
      try {
        await createTodoMutation.mutateAsync({ text: inputText.trim() });
      } catch (error) {
        console.error('Failed to sync todo to server:', error);
        // 如果后端同步失败，可以在这里添加错误提示
        // 或者回滚本地状态
      }
    }
  };

  // 增强的切换 Todo 状态函数
  // 修改函数参数类型
  const handleToggleTodo = async (id: string) => {
    // 先更新本地状态
    toggleTodo(id); // 直接传递 string

    // 同步到后端
    try {
      await toggleTodoMutation.mutateAsync({ id });
    } catch (error) {
      console.error('Failed to sync todo toggle to server:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    // 先从本地状态删除
    deleteTodo(id); // 直接传递 string

    // 同步到后端
    try {
      await deleteTodoMutation.mutateAsync({ id });
    } catch (error) {
      console.error('Failed to sync todo deletion to server:', error);
    }
  };

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
              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              disabled={createTodoMutation.isPending}
            />
            <button
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
              onClick={handleAddTodo}
              disabled={!inputText.trim() || createTodoMutation.isPending}
            >
              {createTodoMutation.isPending ? '添加中...' : '添加'}
            </button>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
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
