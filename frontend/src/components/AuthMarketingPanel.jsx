import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiList } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const bullets = [
  {
    icon: FiList,
    title: 'Capture and prioritize',
    text: 'Keep every task in one place with clear status and due dates.',
  },
  {
    icon: FiCalendar,
    title: 'Plan your week',
    text: 'See what matters next so nothing important slips through.',
  },
  {
    icon: HiSparkles,
    title: 'Stay focused',
    text: 'Cut noise with filters and categories built for real workflows.',
  },
];

const AuthMarketingPanel = () => {
  return (
    <div className="relative flex flex-col justify-between px-8 py-10 lg:px-12 lg:py-14">
      <div>
        <Link to="/login" className="inline-block">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Taskify</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-400">Plan work, ship outcomes without the clutter.</p>
        </Link>

        <p className="mt-10 max-w-md text-base leading-relaxed text-slate-600 dark:text-gray-400">
          A calm workspace for lists, deadlines, and momentum. Built for people who want clarity, not
          another noisy dashboard.
        </p>

        <ul className="mt-10 space-y-6">
          {bullets.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 ring-1 ring-inset ring-slate-200/80 dark:border-white/5 dark:bg-[#161926] dark:text-blue-400 dark:ring-white/5">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-gray-500">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-12 text-xs text-slate-500 dark:text-gray-600 lg:mt-0">
        &copy; {new Date().getFullYear()} Task Manager made by Zayn. All rights reserved.
      </p>
    </div>
  );
};

export default AuthMarketingPanel;
