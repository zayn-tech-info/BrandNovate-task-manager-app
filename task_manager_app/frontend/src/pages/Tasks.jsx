import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import FilterBar from '../components/FilterBar';
import taskService from '../services/task.service';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [hideCompleted, setHideCompleted] = useState(false);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const tasksResponse = await taskService.getAllTasks();
      setTasks(tasksResponse.data);
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
      description: payload.description,
      priority: 'medium',
      category: 'General',
      aiPending: true,
      status: 'todo',
      createdAt: new Date().toISOString()
    };

    setIsSubmitting(true);
    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const response = await taskService.createTask(payload);
      const savedTask = response.data;
      setTasks((prev) => [savedTask, ...prev.filter((task) => task.id !== optimisticTask.id)]);
      toast.success('Task added');
    } catch (err) {
      setTasks((prev) => prev.filter((task) => task.id !== optimisticTask.id));
      toast.error('Failed to add task');
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
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(task._id);
      setTasks((prev) => prev.filter((item) => item._id !== task._id));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
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

  const activeTasks = filteredTasks.filter((task) => !(task.completed === true || task.status === 'completed'));
  const completedTasks = filteredTasks.filter((task) => task.completed === true || task.status === 'completed');

  return (
    <div className="mx-auto w-full max-w-4xl py-2">
      <h1 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">Tasks</h1>

      <TaskForm onAddTask={addTask} isSubmitting={isSubmitting} />

      <FilterBar
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        hideCompleted={hideCompleted}
        setHideCompleted={setHideCompleted}
      />

      {isLoading ? (
        <div className="card text-sm text-slate-500 dark:text-slate-400">Loading tasks...</div>
      ) : (
        <div className="space-y-6">
          <TaskList title="Active Tasks" tasks={activeTasks} onToggleComplete={toggleTask} onDelete={deleteTask} />

          <TaskList
            title={`Completed (${completedTasks.length})`}
            tasks={completedTasks}
            onToggleComplete={toggleTask}
            onDelete={deleteTask}
          />

          {!activeTasks.length && !completedTasks.length ? (
            <div className="card text-sm text-slate-500 dark:text-slate-400">
              No tasks yet. Add your first task above.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Tasks;
