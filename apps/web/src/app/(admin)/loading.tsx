import React from 'react';

export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse p-4">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="h-8 w-48 bg-slate-200/80 rounded-lg"></div>
        <div className="h-10 w-36 bg-slate-200/80 rounded-lg"></div>
      </div>

      {/* Summary Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="w-10 h-10 rounded-full bg-slate-100"></div>
            </div>
            <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Charts & Cards Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded"></div>
          <div className="h-[280px] w-full bg-slate-100 rounded-lg"></div>
        </div>
        <div className="lg:col-span-1 bg-slate-100 p-6 rounded-xl space-y-4 flex flex-col justify-between h-[360px]">
          <div className="space-y-2">
            <div className="h-6 w-24 bg-slate-200 rounded"></div>
            <div className="h-4 w-36 bg-slate-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-16 w-full bg-slate-200/60 rounded-lg"></div>
            <div className="h-16 w-full bg-slate-200/60 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="h-6 w-40 bg-slate-200 rounded"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
              <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
              <div className="h-4 w-1/6 bg-slate-200 rounded"></div>
              <div className="h-4 w-12 bg-slate-100 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
