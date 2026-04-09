import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ListTodo, Sparkles } from 'lucide-react';

const bullets = [
  {
    icon: ListTodo,
    title: 'Capture and prioritize',
    text: 'Keep every task in one place with clear status and due dates.',
  },
  {
    icon: Calendar,
    title: 'Plan your week',
    text: 'See what matters next so nothing important slips through.',
  },
  {
    icon: Sparkles,
    title: 'Stay focused',
    text: 'Cut noise with filters and categories built for real workflows.',
  },
];

const AuthMarketingPanel = () => {
  return (
    <div className="relative flex flex-col justify-between px-8 py-10 lg:px-12 lg:py-14">
      <div>
        <Link to="/login" className="inline-block">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Taskify</h1>
          <p className="mt-2 text-sm text-gray-400">Plan work, ship outcomes without the clutter.</p>
        </Link>

        <p className="mt-10 max-w-md text-base leading-relaxed text-gray-400">
          A calm workspace for lists, deadlines, and momentum. Built for people who want clarity, not
          another noisy dashboard.
        </p>

        <ul className="mt-10 space-y-6">
          {bullets.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-[#161926] text-blue-400 ring-1 ring-inset ring-white/5">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-medium text-white">{title}</p>
                <p className="mt-1 text-sm text-gray-600">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-12 text-xs text-gray-600 lg:mt-0">
        &copy; {new Date().getFullYear()} Task Manager. All rights reserved.
      </p>
    </div>
  );
};

export default AuthMarketingPanel;
