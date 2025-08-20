'use client';

import { Calendar, Flag, Lightbulb, Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/react';

const exampleTasks = [
  {
    title: '完成项目报告',
    priority: 'HIGH' as const,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    list: '工作',
    flagged: true,
  },
  {
    title: '购买生日礼物',
    priority: 'MEDIUM' as const,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    list: '个人',
    flagged: false,
  },
  {
    title: '健身30分钟',
    priority: 'LOW' as const,
    list: '健康',
    flagged: false,
  },
];

export function WelcomeSuggestions() {
  const createTodo = api.todo.create.useMutation({
    onSuccess: () => {
      // 可以添加一个toast通知
    },
  });

  const handleCreateExampleTask = (task: (typeof exampleTasks)[0]) => {
    createTodo.mutate({
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      list: task.list,
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">欢迎使用 My Memo！</h3>
        <p className="text-gray-600">以下是一些示例任务，帮助你快速开始</p>
      </div>

      <div className="grid gap-3 mb-6">
        {exampleTasks.map((task, index) => (
          <div
            key={`${task.title}-${index}`}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">{task.title}</span>
                  {task.priority === 'HIGH' && (
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  )}
                  {task.priority === 'MEDIUM' && (
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  )}
                  {task.priority === 'LOW' && (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  )}
                  {task.flagged && <Flag className="w-4 h-4 text-yellow-600 fill-current" />}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">{task.list}</span>
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{task.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleCreateExampleTask(task)}
                disabled={createTodo.isPending}
                className="ml-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-3">或者点击右下角的 + 按钮创建自己的任务</p>
        <div className="flex justify-center">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce mx-1"></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce mx-1"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce mx-1"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
