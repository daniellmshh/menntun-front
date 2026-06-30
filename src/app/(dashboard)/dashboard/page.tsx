"use client";

import React from "react";
import {
  Users,
  GraduationCap,
  CalendarDays,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";

export default function DashboardPage() {
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="gradient-text text-[2.2rem] font-extrabold tracking-tight">{t.dashboard.welcomeTitle}</h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-2xl">
            {t.dashboard.welcomeSubtitle}
          </p>
        </div>
        <button className="glass-button flex items-center gap-2 text-sm shrink-0">
          <Plus size={16} />
          <span>{t.dashboard.createNoticeButton}</span>
        </button>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1 */}
        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase">
              {t.dashboard.stats.totalStudents}
            </span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)]">
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold">1,248</h3>
            <div className="flex items-center gap-1.5 text-xs text-[var(--accent-success)]">
              <TrendingUp size={14} />
              <span>{t.dashboard.stats.studentsDetail}</span>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase">
              {t.dashboard.stats.activeTeachers}
            </span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20 flex items-center justify-center text-[var(--accent-secondary)]">
              <Users size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold">86</h3>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <Clock size={14} />
              <span>{t.dashboard.stats.teachersDetail}</span>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase">
              {t.dashboard.stats.avgAttendance}
            </span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 flex items-center justify-center text-[var(--accent-cyan)]">
              <CalendarDays size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold">94.2%</h3>
            <div className="flex items-center gap-1.5 text-xs text-[var(--accent-success)]">
              <TrendingUp size={14} />
              <span>{t.dashboard.stats.attendanceDetail}</span>
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase">
              {t.dashboard.stats.reportCards}
            </span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-warning)]/10 border border-[var(--accent-warning)]/20 flex items-center justify-center text-[var(--accent-warning)]">
              <FileSpreadsheet size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold">98.6%</h3>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span>{t.dashboard.stats.cardsDetail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Activity & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Panel */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-lg">{t.dashboard.auditLog.title}</h4>
            <button className="text-xs text-[var(--accent-secondary)] flex items-center gap-1 hover:underline">
              {t.dashboard.auditLog.viewAll} <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 p-3 rounded-lg hover:bg-[var(--bg-panel-hover)] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] shrink-0 mt-0.5">
                <Users size={14} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{t.dashboard.auditLog.row1_title}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t.dashboard.auditLog.row1_desc}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">{t.dashboard.auditLog.row1_time}</p>
              </div>
            </div>

            <div className="flex gap-4 p-3 rounded-lg hover:bg-[var(--bg-panel-hover)] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-cyan)]/10 flex items-center justify-center text-[var(--accent-cyan)] shrink-0 mt-0.5">
                <Clock size={14} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{t.dashboard.auditLog.row2_title}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t.dashboard.auditLog.row2_desc}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">{t.dashboard.auditLog.row2_time}</p>
              </div>
            </div>

            <div className="flex gap-4 p-3 rounded-lg hover:bg-[var(--bg-panel-hover)] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-warning)]/10 flex items-center justify-center text-[var(--accent-warning)] shrink-0 mt-0.5">
                <FileSpreadsheet size={14} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{t.dashboard.auditLog.row3_title}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t.dashboard.auditLog.row3_desc}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">{t.dashboard.auditLog.row3_time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Modules Setup Panel */}
        <div className="glass-panel p-6 space-y-6">
          <h4 className="font-bold text-lg">{t.dashboard.quickAccess.title}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-[var(--border-glass)] hover:border-[var(--border-glass-active)] bg-black/15 hover:bg-black/25 text-center cursor-pointer transition-all space-y-2">
              <div className="mx-auto w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
                <GraduationCap size={16} />
              </div>
              <p className="text-xs font-semibold">{t.dashboard.quickAccess.classes}</p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-glass)] hover:border-[var(--border-glass-active)] bg-black/15 hover:bg-black/25 text-center cursor-pointer transition-all space-y-2">
              <div className="mx-auto w-8 h-8 rounded-lg bg-[var(--accent-secondary)]/10 flex items-center justify-center text-[var(--accent-secondary)]">
                <Users size={16} />
              </div>
              <p className="text-xs font-semibold">{t.dashboard.quickAccess.rosters}</p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-glass)] hover:border-[var(--border-glass-active)] bg-black/15 hover:bg-black/25 text-center cursor-pointer transition-all space-y-2">
              <div className="mx-auto w-8 h-8 rounded-lg bg-[var(--accent-cyan)]/10 flex items-center justify-center text-[var(--accent-cyan)]">
                <CalendarDays size={16} />
              </div>
              <p className="text-xs font-semibold">{t.dashboard.quickAccess.schedules}</p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-glass)] hover:border-[var(--border-glass-active)] bg-black/15 hover:bg-black/25 text-center cursor-pointer transition-all space-y-2">
              <div className="mx-auto w-8 h-8 rounded-lg bg-[var(--accent-warning)]/10 flex items-center justify-center text-[var(--accent-warning)]">
                <FileSpreadsheet size={16} />
              </div>
              <p className="text-xs font-semibold">{t.dashboard.quickAccess.reports}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
