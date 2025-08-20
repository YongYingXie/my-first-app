'use client';

import { Calendar, Check, Edit3, Flag, List, Plus, Search, Trash2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useId, useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { WelcomeSuggestions } from '~/components/welcome-suggestions';
import { api } from '~/trpc/react';

export default function Memo() {
  const { data: session, status } = useSession();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedList, setSelectedList] = useState('所有任务');
  const [showCompleted, setShowCompleted] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'date' | 'priority' | null>(null);
  const [editingDate, setEditingDate] = useState('');
  const [editingPriority, setEditingPriority] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // tRPC hooks
  const { data: tasks = [], refetch } = api.todo.getAll.useQuery(undefined, {
    enabled: !!session?.user?.id,
  });
  const createTodo = api.todo.create.useMutation({
    onSuccess: () => refetch(),
  });
  const updateTodo = api.todo.update.useMutation({
    onSuccess: () => refetch(),
  });
  const toggleTodo = api.todo.toggle.useMutation({
    onSuccess: () => refetch(),
  });
  const toggleFlagTodo = api.todo.toggleFlag.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteTodo = api.todo.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const isToday = (date?: Date | null) => {
    if (!date) return false;
    const today = new Date().toISOString().split('T')[0];
    const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date;
    return dateString === today;
  };

  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0] || '';
  };

  const lists = [
    { id: 'all', name: '所有任务', icon: List, count: tasks.length },
    {
      id: 'today',
      name: '今天',
      icon: Calendar,
      count: tasks.filter((t) => t.dueDate && isToday(t.dueDate)).length,
    },
    {
      id: 'flagged',
      name: '已标记',
      icon: Flag,
      count: tasks.filter((t) => t.flagged).length,
    },
    {
      id: 'completed',
      name: '已完成',
      icon: Check,
      count: tasks.filter((t) => t.completed).length,
    },
  ];

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    createTodo.mutate(
      {
        title: newTaskTitle.trim(),
        dueDate: newTaskDate.trim() || getTodayDate(),
        priority: 'MEDIUM',
        list: '所有任务',
      },
      {
        onSuccess: () => {
          setNewTaskTitle('');
          setNewTaskDate('');
          setIsAddingTask(false);
        },
        onError: (error) => {
          console.error('创建任务失败:', error);
          alert('创建任务失败，请重试');
        },
      }
    );
  };

  const toggleTask = (taskId: string) => {
    toggleTodo.mutate(
      { id: taskId },
      {
        onError: (error) => {
          console.error('切换任务状态失败:', error);
          alert('操作失败，请重试');
        },
      }
    );
  };

  const deleteTask = (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      console.log('正在删除任务:', taskId);
      deleteTodo.mutate(
        { id: taskId },
        {
          onSuccess: () => {
            console.log('任务删除成功:', taskId);
          },
          onError: (error) => {
            console.error('删除任务失败:', error);
            alert('删除任务失败，请重试');
          },
        }
      );
    }
  };

  const toggleFlag = (taskId: string) => {
    toggleFlagTodo.mutate(
      { id: taskId },
      {
        onError: (error) => {
          console.error('切换标记状态失败:', error);
          alert('操作失败，请重试');
        },
      }
    );
  };

  const startEditDate = (taskId: string, currentDate?: string) => {
    setEditingTaskId(taskId);
    setEditingType('date');
    setEditingDate(currentDate || '');
  };

  const saveDateEdit = (taskId: string) => {
    updateTodo.mutate(
      {
        id: taskId,
        dueDate: editingDate || null,
      },
      {
        onSuccess: () => {
          setEditingTaskId(null);
          setEditingType(null);
          setEditingDate('');
        },
        onError: (error) => {
          console.error('更新日期失败:', error);
          alert('更新失败，请重试');
        },
      }
    );
  };

  const cancelDateEdit = () => {
    setEditingTaskId(null);
    setEditingType(null);
    setEditingDate('');
  };

  const startEditPriority = (taskId: string, currentPriority: string) => {
    setEditingTaskId(taskId);
    setEditingType('priority');
    setEditingPriority(currentPriority);
  };

  const savePriorityEdit = (taskId: string) => {
    updateTodo.mutate(
      {
        id: taskId,
        priority: editingPriority as 'LOW' | 'MEDIUM' | 'HIGH',
      },
      {
        onSuccess: () => {
          setEditingTaskId(null);
          setEditingType(null);
          setEditingPriority('');
        },
        onError: (error) => {
          console.error('更新优先级失败:', error);
          alert('更新失败，请重试');
        },
      }
    );
  };

  const cancelPriorityEdit = () => {
    setEditingTaskId(null);
    setEditingType(null);
    setEditingPriority('');
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return '';
    }
  };

  const filteredTasks = tasks.filter((task) => {
    // 首先按搜索关键词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(query);
      const notesMatch = task.notes?.toLowerCase().includes(query) || false;
      if (!titleMatch && !notesMatch) return false;
    }

    // 然后按选中的列表过滤
    if (selectedList === '今天') return isToday(task.dueDate);
    if (selectedList === '已标记') return task.flagged;
    if (selectedList === '已完成') return task.completed;
    return true;
  });

  // 按完成状态、优先级和时间排序
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // 首先按完成状态排序：未完成的在前，已完成的在后
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // 未完成的在前（-1），已完成的在后（1）
    }

    // 如果完成状态相同，按优先级排序：高 > 中 > 低
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

    if (priorityDiff !== 0) {
      return priorityDiff; // 优先级不同，按优先级排序
    }

    // 优先级相同，按时间排序
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const visibleTasks =
    selectedList === '已完成'
      ? sortedTasks.filter((task) => task.completed) // 只显示已完成的任务
      : showCompleted
        ? sortedTasks // 显示所有任务（已排序，已完成的在下面）
        : sortedTasks.filter((task) => !task.completed); // 只显示未完成的任务

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-2xl font-semibold text-gray-700">加载中...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">欢迎使用 My Memo</h1>
          <p className="text-gray-600 mb-6">请登录以开始管理你的任务</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => window.location.assign('/auth/signin')} className="w-full">
              登录
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.assign('/auth/signup')}
              className="w-full"
            >
              注册
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-100 overflow-hidden">
      <div className="h-full max-w-4xl mx-auto p-6">
        {/* 侧边栏和主内容区域 */}
        <div className="flex gap-6 h-full">
          {/* 左侧边栏 */}
          <div className="w-64 flex-shrink-0 h-full">
            <Card className="p-4 h-full flex flex-col bg-gray-50">
              {/* 搜索框 */}
              <div className="mb-4 flex-shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索任务..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <nav className="space-y-1 flex-1 overflow-y-auto min-h-0">
                {lists.map((list) => (
                  <button
                    type="button"
                    key={list.id}
                    onClick={() => {
                      setSelectedList(list.name);
                      setSearchQuery(''); // 清除搜索
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedList === list.name
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <list.icon className="w-4 h-4 mr-3" />
                      {list.name}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {list.count}
                    </Badge>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* 主内容区域 */}
          <div className="flex-1 h-full">
            <Card className="p-6 h-full flex flex-col bg-white">
              {/* 标题和操作栏 */}
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {searchQuery.trim() ? `搜索: "${searchQuery}"` : selectedList}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {searchQuery.trim()
                      ? `找到 ${visibleTasks.length} 个相关任务`
                      : `${visibleTasks.length} 个任务`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    添加任务
                  </button>
                  {selectedList !== '已完成' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCompleted(!showCompleted)}
                      className={showCompleted ? 'bg-blue-100 text-blue-700' : ''}
                    >
                      {showCompleted ? '隐藏已完成' : '显示已完成'}
                    </Button>
                  )}
                </div>
              </div>

              {/* 添加任务输入框 */}
              {isAddingTask && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex-shrink-0">
                  <div className="flex gap-3 mb-3">
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="输入任务内容..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                      autoFocus
                    />
                    <Input
                      type="date"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      className="w-40"
                      placeholder="选择日期（可选）"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addTask} size="sm">
                      添加任务
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAddingTask(false);
                        setNewTaskTitle('');
                        setNewTaskDate('');
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              )}

              {/* 任务列表容器 */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {/* 任务列表 */}
                <div className="space-y-2">
                  {visibleTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`group flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-gray-50 ${
                        task.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                      }`}
                    >
                      {/* 完成状态按钮 */}
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3" />}
                      </button>

                      {/* 任务内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.priority === 'HIGH' && (
                            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                          )}
                          {task.priority === 'MEDIUM' && (
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          )}
                          {task.priority === 'LOW' && (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          {editingTaskId === task.id && editingType === 'date' ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="date"
                                value={editingDate}
                                onChange={(e) => setEditingDate(e.target.value)}
                                className="w-32 h-6 text-xs"
                                onKeyPress={(e) => e.key === 'Enter' && saveDateEdit(task.id)}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => saveDateEdit(task.id)}
                                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={cancelDateEdit}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : editingTaskId === task.id && editingType === 'priority' ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={editingPriority}
                                onChange={(e) => setEditingPriority(e.target.value)}
                                className="w-20 h-6 text-xs border border-gray-300 rounded px-2"
                              >
                                <option value="LOW">低</option>
                                <option value="MEDIUM">中</option>
                                <option value="HIGH">高</option>
                              </select>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => savePriorityEdit(task.id)}
                                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={cancelPriorityEdit}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {task.dueDate ? (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {isToday(task.dueDate)
                                      ? '今天'
                                      : task.dueDate instanceof Date
                                        ? task.dueDate.toISOString().split('T')[0]
                                        : task.dueDate}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      startEditDate(
                                        task.id,
                                        task.dueDate instanceof Date
                                          ? task.dueDate.toISOString().split('T')[0]
                                          : task.dueDate || ''
                                      )
                                    }
                                    className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditDate(task.id)}
                                  className="h-6 px-2 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-300 hover:border-gray-400"
                                >
                                  <Calendar className="w-3 h-3 mr-1" />
                                  添加日期
                                </Button>
                              )}
                              <Badge
                                variant="outline"
                                className="text-xs cursor-pointer hover:opacity-80"
                                style={{
                                  color:
                                    task.priority === 'HIGH'
                                      ? '#dc2626'
                                      : task.priority === 'MEDIUM'
                                        ? '#d97706'
                                        : '#059669',
                                  borderColor:
                                    task.priority === 'HIGH'
                                      ? '#fca5a5'
                                      : task.priority === 'MEDIUM'
                                        ? '#fed7aa'
                                        : '#a7f3d0',
                                  backgroundColor:
                                    task.priority === 'HIGH'
                                      ? '#fef2f2'
                                      : task.priority === 'MEDIUM'
                                        ? '#fffbeb'
                                        : '#ecfdf5',
                                }}
                                onClick={() => startEditPriority(task.id, task.priority)}
                              >
                                {getPriorityLabel(task.priority)}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFlag(task.id)}
                          className={`${
                            task.flagged
                              ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                          }`}
                          title={task.flagged ? '取消标记' : '标记任务'}
                        >
                          <Flag className={`w-4 h-4 ${task.flagged ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 空状态 */}
              {visibleTasks.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <WelcomeSuggestions />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
