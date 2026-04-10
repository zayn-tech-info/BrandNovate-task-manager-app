import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiCalendar, FiCheckCircle, FiClock, FiPlus } from 'react-icons/fi';
import taskService from '../services/task.service';
import insightsService from '../services/insights.service';
import { buildOverviewMetrics, buildDeterministicInsights } from '../utils/overviewMetrics';
import { DashboardSkeleton } from '../components/skeletons';

const formatDate = (value) => {
  if (!value) return 'No due date';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'No due date';
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const severityClass = {
  high: 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300',
  medium: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  low: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300'
};

const KpiCard = ({ label, value, icon: Icon, accent }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#111420]">
    <div className="flex items-center gap-3">
      <div className={`rounded-xl p-2 ${accent}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-semibold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

const TaskMiniList = ({ title, tasks, emptyText }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#111420]">
    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
    {tasks.length ? (
      <div className="mt-3 space-y-2">
        {tasks.map((task) => (
          <div
            key={task._id || task.id}
            className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-white/5 dark:bg-[#0d1018]"
          >
            <p className="truncate text-sm text-slate-800 dark:text-gray-100">{task.title}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">Due: {formatDate(task.dueDate)}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="mt-3 text-sm text-slate-500 dark:text-gray-500">{emptyText}</p>
    )}
  </div>
);

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const tasksResponse = await taskService.getAllTasks();
        const safeTasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];
        setTasks(safeTasks);

        try {
          const insightsResponse = await insightsService.getOverviewInsights();
          setInsights(insightsResponse.data);
        } catch {
          const fallbackOverview = buildOverviewMetrics(safeTasks);
          setInsights(buildDeterministicInsights(fallbackOverview, new Date().toISOString()));
        }

        setError('');
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const overview = useMemo(() => buildOverviewMetrics(tasks), [tasks]);
  const trendMax = Math.max(1, ...overview.completionTrend.map((item) => item.completed));

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Overview</h1>
          <p className="text-sm text-slate-600 dark:text-gray-400">Your real-time productivity snapshot.</p>
        </div>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <FiPlus size={16} />
          Manage tasks
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total" value={overview.kpis.total} icon={FiCalendar} accent="bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" />
        <KpiCard label="Due today" value={overview.kpis.dueToday} icon={FiClock} accent="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" />
        <KpiCard label="Overdue" value={overview.kpis.overdue} icon={FiAlertCircle} accent="bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" />
        <KpiCard label="Completed (7d)" value={overview.kpis.completed7d} icon={FiCheckCircle} accent="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" />
        <KpiCard label="Completion rate" value={`${overview.kpis.completionRate}%`} icon={FiCheckCircle} accent="bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <TaskMiniList
          title="Needs Attention"
          tasks={overview.lists.needsAttention}
          emptyText="No urgent tasks right now."
        />
        <TaskMiniList
          title="Today"
          tasks={overview.lists.today}
          emptyText="Nothing due today."
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#111420]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
          {overview.lists.recentActivity.length ? (
            <div className="mt-3 space-y-2">
              {overview.lists.recentActivity.map((item, idx) => (
                <div
                  key={`${item.task?._id || item.task?.id || idx}-${item.type}`}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-white/5 dark:bg-[#0d1018]"
                >
                  <p className="text-sm text-slate-800 dark:text-gray-100">{item.task?.title}</p>
                  <p className="mt-1 text-xs capitalize text-slate-500 dark:text-gray-500">
                    {item.type} · {formatDate(item.date)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500 dark:text-gray-500">No recent activity yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#111420]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Completion Trend (7 days)</h3>
          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-gray-500">Weekly</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {overview.completionTrend.map((item) => {
            const heightPercent = Math.max(8, Math.round((item.completed / trendMax) * 100));
            return (
              <div key={item.date} className="flex flex-col items-center gap-1">
                <div className="flex h-24 w-full items-end rounded-md bg-slate-100 p-1 dark:bg-[#0d1018]">
                  <div className="w-full rounded-sm bg-blue-500 dark:bg-blue-500/80" style={{ height: `${heightPercent}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-gray-500">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#111420]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Insights</h3>
          <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-gray-400">
            {insights?.source || 'rules'}
          </span>
        </div>
        <p className="text-sm text-slate-700 dark:text-gray-300">{insights?.summary || 'No insights available.'}</p>
        <div className="mt-3 space-y-2">
          {(insights?.suggestions || []).map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-white/5 dark:bg-[#0d1018]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">{item.reason}</p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${severityClass[item.severity] || severityClass.medium}`}>
                  {item.severity || 'medium'}
                </span>
              </div>
              <Link
                to={item.actionRoute || '/tasks'}
                className="mt-2 inline-block text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {item.actionLabel || 'Open tasks'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
