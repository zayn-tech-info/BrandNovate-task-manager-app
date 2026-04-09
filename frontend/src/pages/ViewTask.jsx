import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import taskService from '../services/task.service';

const formatDateTime = (value) => {
  if (!value) return '-';
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return '-';
  return dateValue.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatStatus = (value) =>
  String(value || 'todo')
    .replace(/_/g, '-')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatPriority = (value) => {
  const normalized = String(value || 'medium').toLowerCase();
  if (normalized === 'high') return 'High';
  if (normalized === 'low') return 'Low';
  return 'Medium';
};

const Field = ({ label, value }) => (
  <div className="rounded-xl border border-white/5 bg-[#111420] p-4">
    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
    <p className="mt-2 text-sm text-gray-200">{value || '-'}</p>
  </div>
);

const ViewTask = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        const response = await taskService.getTaskById(id);
        setTask(response.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load task');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#111420] p-6 text-sm text-gray-500">Loading task...</div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-4">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/[0.05]"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to tasks
        </Link>
        <div className="rounded-2xl border border-white/5 bg-[#111420] p-6 text-sm text-gray-400">
          Task not found.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 py-2">
      <Link
        to="/tasks"
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/[0.05]"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to tasks
      </Link>

      <section className="rounded-2xl border border-white/5 bg-[#0f1320] p-6">
        <h1 className="text-xl font-semibold tracking-tight text-white">{task.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-300">
          {task.description || 'No description provided.'}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" value={task.category || 'Other'} />
        <Field label="Priority" value={formatPriority(task.priority)} />
        <Field label="Status" value={formatStatus(task.status)} />
        <Field label="Due Date" value={formatDateTime(task.dueDate)} />
        <Field label="Created" value={formatDateTime(task.createdAt)} />
        <Field label="Last Updated" value={formatDateTime(task.updatedAt)} />
      </section>
    </div>
  );
};

export default ViewTask;
