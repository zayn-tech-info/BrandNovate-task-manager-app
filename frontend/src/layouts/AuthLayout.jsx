import React from 'react';
import { Outlet } from 'react-router-dom';
import AuthMarketingPanel from '../components/AuthMarketingPanel';

const AuthLayout = () => {
  return (
    <div className="dark min-h-screen bg-[#0d0f14] text-white">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_40%,rgba(59,130,246,0.12),transparent_50%),radial-gradient(ellipse_60%_40%_at_80%_20%,rgba(148,163,184,0.08),transparent_45%),radial-gradient(ellipse_50%_60%_at_70%_80%,rgba(59,130,246,0.06),transparent_50%),linear-gradient(180deg,#0a0c10_0%,#0d0f14_100%)] opacity-[0.85]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col lg:grid lg:min-h-screen lg:grid-cols-2">
        <aside className="border-b border-white/5 lg:border-b-0 lg:border-r lg:border-white/5">
          <AuthMarketingPanel />
        </aside>

        <main className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="mx-auto w-full max-w-md overflow-y-auto rounded-2xl border border-white/5 bg-[#111420] p-1 backdrop-blur-md">
            <div className="rounded-[14px] border border-white/5 bg-[#0d0f14]/80">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
