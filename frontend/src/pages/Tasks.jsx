import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { FiCheckSquare, FiPlus, FiTrash2 } from 'react-icons/fi';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskViewModal from '../components/TaskViewModal';
import ConfirmModal from '../components/ConfirmModal';
import TaskList from '../components/TaskList';
import FilterBar from '../components/FilterBar';
import taskService from '../services/task.service';
import { TasksPageSkeleton } from '../components/skeletons';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState('create');
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    action: null
  });

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const tasksResponse = await taskService.getAllTasks();
      setTasks(tasksResponse.data);
      setSelectedTaskIds(new Set());
    } catch (err) {
      toast.error('Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const normalizePriority = (value) => String(value || 'medium').toLowerCase();

  const addTask = async (payload) => {
    const optimisticTask = {
      id: `tmp-${Date.now()}`,
      title: payload.title,
      description: payload.description || '',
      priority: payload.priority || 'medium',
      status: payload.status || 'todo',
      category: payload.category || 'Other',
      dueDate: payload.dueDate,
      aiPending: true,
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const response = await taskService.createTask(payload);
      const savedTask = response.data;
      setTasks((prev) => [savedTask, ...prev.filter((task) => task.id !== optimisticTask.id)]);
      setSelectedTaskIds(new Set());
      toast.success('Task added');
    } catch (err) {
      setTasks((prev) => prev.filter((task) => task.id !== optimisticTask.id));
      const msg = err.response?.data?.message || 'Failed to add task';
      toast.error(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTask = async (payload) => {
    if (!editingTask?._id) return;
    setIsSubmitting(true);
    try {
      const response = await taskService.updateTask(editingTask._id, payload);
      const updatedTask = response.data;
      setTasks((prev) => prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
      toast.success('Task updated');
      setEditingTask(null);
      setTaskModalMode('create');
      setIsTaskModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task';
      toast.error(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTask = async (task) => {
    const isComplete = task.completed === true || task.status === 'completed';
    try {
      const response = isComplete
        ? await taskService.markTaskAsIncomplete(task._id)
        : await taskService.markTaskAsCompleted(task._id);
      const updated = response.data;
      setTasks((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    } catch (err) {
      toast.error('Could not update task state');
    }
  };

  const deleteTask = async (task) => {
    setConfirmState({
      open: true,
      title: 'Delete task',
      message: 'Are you sure you want to delete this task?',
      confirmLabel: 'Delete',
      action: async () => {
        try {
          await taskService.deleteTask(task._id);
          setTasks((prev) => prev.filter((item) => item._id !== task._id));
          setSelectedTaskIds((prev) => {
            if (!prev.has(task._id)) return prev;
            const next = new Set(prev);
            next.delete(task._id);
            return next;
          });
          toast.success('Task deleted');
        } catch (err) {
          toast.error('Failed to delete task');
        }
      }
    });
  };

  const handleOpenCreate = () => {
    setTaskModalMode('create');
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setTaskModalMode('edit');
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    if (isSubmitting) return;
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setTaskModalMode('create');
  };

  const handleViewTask = (task) => {
    if (!task?._id && !task?.id) return;
    setViewingTask(task);
  };

  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    if (priorityFilter !== 'all') {
      list = list.filter((task) => normalizePriority(task.priority) === priorityFilter);
    }

    if (hideCompleted) {
      list = list.filter((task) => !(task.completed === true || task.status === 'completed'));
    }

    if (sortBy === 'priority') {
      const order = { high: 0, medium: 1, low: 2 };
      list.sort((a, b) => order[normalizePriority(a.priority)] - order[normalizePriority(b.priority)]);
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [tasks, priorityFilter, sortBy, hideCompleted]);

  const isSameCalendarDay = (left, right) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  const isTodayTask = (task) => {
    if (!task?.dueDate) return false;
    const due = new Date(task.dueDate);
    if (Number.isNaN(due.getTime())) return false;
    return isSameCalendarDay(due, new Date());
  };

  const todayTasks = filteredTasks.filter((task) => isTodayTask(task));
  const nonTodayTasks = filteredTasks.filter((task) => !isTodayTask(task));
  const activeTasks = nonTodayTasks.filter((task) => !(task.completed === true || task.status === 'completed'));
  const completedTasks = nonTodayTasks.filter((task) => task.completed === true || task.status === 'completed');
  const selectedCount = selectedTaskIds.size;

  const handleSelectTask = (taskId, checked) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(taskId);
      else next.delete(taskId);
      return next;
    });
  };

  const handleSelectAllInSection = (sectionTasks, checked) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      sectionTasks.forEach((task) => {
        const id = task._id || task.id;
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const selectedTasks = useMemo(() => {
    if (!selectedTaskIds.size) return [];
    return tasks.filter((task) => selectedTaskIds.has(task._id || task.id));
  }, [tasks, selectedTaskIds]);

  const handleDeleteSelected = async () => {
    if (!selectedTasks.length) return;
    setConfirmState({
      open: true,
      title: 'Delete selected tasks',
      message: `Delete ${selectedTasks.length} selected task(s)?`,
      confirmLabel: 'Delete selected',
      action: async () => {
        try {
          await Promise.all(selectedTasks.map((task) => taskService.deleteTask(task._id)));
          setTasks((prev) => prev.filter((task) => !selectedTaskIds.has(task._id || task.id)));
          setSelectedTaskIds(new Set());
          toast.success('Selected tasks deleted');
        } catch {
          toast.error('Failed to delete selected tasks');
        }
      }
    });
  };

  const handleToggleSelectedCompletion = async () => {
    if (!selectedTasks.length) return;
    try {
      const results = await Promise.allSettled(
        selectedTasks.map((task) => {
          const done = task.completed === true || task.status === 'completed';
          return done ? taskService.markTaskAsIncomplete(task._id) : taskService.markTaskAsCompleted(task._id);
        })
      );

      const updates = new Map();
      const succeededIds = [];
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value?.data?._id) {
          const updated = result.value.data;
          updates.set(updated._id, updated);
          succeededIds.push(updated._id);
        }
      });

      if (updates.size) {
        setTasks((prev) => prev.map((task) => updates.get(task._id) || task));
      }

      setSelectedTaskIds((prev) => {
        if (!succeededIds.length) return prev;
        const next = new Set(prev);
        succeededIds.forEach((id) => next.delete(id));
        return next;
      });

      const failed = results.length - succeededIds.length;
      if (failed === 0) {
        toast.success('Selected tasks updated');
      } else if (succeededIds.length === 0) {
        toast.error('Failed to update selected tasks');
      } else {
        toast.warn(`Updated ${succeededIds.length} task(s); ${failed} failed`);
      }
    } catch {
      toast.error('Failed to update selected tasks');
    }
  };

  const closeConfirm = () => {
    setConfirmState((prev) => ({ ...prev, open: false, action: null }));
  };

  const handleConfirm = async () => {
    const run = confirmState.action;
    closeConfirm();
    if (run) {
      await run();
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2 lg:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white lg:text-xl">Tasks</h1>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-gray-500 sm:mt-1 sm:text-sm">
            Track and complete work in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          disabled={isSubmitting}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 sm:mt-0 sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          New task
        </button>
      </div>

      <FilterBar
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        hideCompleted={hideCompleted}
        setHideCompleted={setHideCompleted}
      />

      {selectedCount ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#121726]">
          <p className="text-sm text-slate-700 dark:text-gray-300">
            <span className="font-semibold text-slate-900 dark:text-white">{selectedCount}</span> selected
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSelectedCompletion}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/[0.05]"
            >
              <FiCheckSquare className="h-3.5 w-3.5" />
              Toggle complete
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10"
            >
              <FiTrash2 className="h-3.5 w-3.5" />
              Delete selected
            </button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <TasksPageSkeleton />
      ) : (
        <div className="space-y-4 lg:space-y-6">
          {todayTasks.length ? (
            <TaskList
              title={`Today (${todayTasks.length})`}
              tasks={todayTasks}
              selectedTaskIds={selectedTaskIds}
              onSelectTask={handleSelectTask}
              onSelectAllTasks={handleSelectAllInSection}
              onToggleComplete={toggleTask}
              onDelete={deleteTask}
              onEdit={handleOpenEdit}
              onView={handleViewTask}
            />
          ) : null}

          <TaskList
            title="Active Tasks"
            tasks={activeTasks}
            selectedTaskIds={selectedTaskIds}
            onSelectTask={handleSelectTask}
            onSelectAllTasks={handleSelectAllInSection}
            onToggleComplete={toggleTask}
            onDelete={deleteTask}
            onEdit={handleOpenEdit}
            onView={handleViewTask}
          />

          <TaskList
            title={`Completed (${completedTasks.length})`}
            tasks={completedTasks}
            selectedTaskIds={selectedTaskIds}
            onSelectTask={handleSelectTask}
            onSelectAllTasks={handleSelectAllInSection}
            onToggleComplete={toggleTask}
            onDelete={deleteTask}
            onEdit={handleOpenEdit}
            onView={handleViewTask}
          />

          {!activeTasks.length && !completedTasks.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/5 dark:bg-white/4">
                <FiCheckSquare className="text-slate-500 dark:text-gray-500" size={20} />
              </div>
              <p className="text-sm text-slate-600 dark:text-gray-500">No tasks yet</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-gray-600">Use New task to add your first one.</p>
            </div>
          ) : null}
        </div>
      )}

      <CreateTaskModal
        open={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onAddTask={taskModalMode === 'edit' ? updateTask : addTask}
        isSubmitting={isSubmitting}
        mode={taskModalMode}
        initialTask={editingTask}
      />

      <TaskViewModal task={viewingTask} onClose={() => setViewingTask(null)} />

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default Tasks;
