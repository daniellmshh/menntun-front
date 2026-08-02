"use client";

import { Building2, X } from "lucide-react";
import ModalShell from "@/components/shared/ModalShell";
import { translations } from "@/lib/translations";
import type { School, SchoolDetailTab, SchoolModule, SchoolUser } from "../types";
import SchoolGeneralTab from "./SchoolGeneralTab";
import SchoolModulesTab from "./SchoolModulesTab";
import SchoolUsersTab from "./SchoolUsersTab";

interface SchoolDetailModalProps {
  school: School;
  tab: SchoolDetailTab;
  modules: SchoolModule[];
  modulesLoading: boolean;
  modulesError: string | null;
  users: SchoolUser[];
  usersLoading: boolean;
  usersError: string | null;
  actionLoadingId: string | null;
  canManageModules: boolean;
  t: typeof translations.es;
  onClose: () => void;
  onTabChange: (tab: SchoolDetailTab) => void;
  onToggleModule: (moduleName: string, active: boolean) => void;
  onAddUser: () => void;
  onEditUser: (user: SchoolUser) => void;
  onToggleUserActive: (user: SchoolUser) => void;
}

export default function SchoolDetailModal({ school, tab, modules, modulesLoading, modulesError, users, usersLoading, usersError, actionLoadingId, canManageModules, t, onClose, onTabChange, onToggleModule, onAddUser, onEditUser, onToggleUserActive }: SchoolDetailModalProps) {
  return <ModalShell className="items-center justify-center p-4 overflow-y-auto bg-black/70"><div className="glass-panel max-w-3xl w-full p-6 border border-[var(--border-glass)] relative flex flex-col max-h-[85vh] overflow-hidden animate-scale-up"><button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer z-10"><X size={20} /></button><header className="flex items-center gap-4 border-b border-[var(--border-glass)] pb-4"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">{school.logoUrl ? <img src={school.logoUrl} alt={school.name} className="w-full h-full object-cover rounded-2xl" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <Building2 size={24} />}</div><div><h2 className="text-2xl font-bold text-[var(--text-primary)]">{school.name}</h2><p className="text-xs text-[var(--text-muted)] font-mono">Code: {school.code} | ID: {school.id}</p></div></header><nav className="flex border-b border-[var(--border-glass)] gap-6 pb-1">{(["general", "modules", "users"] as const).map((item) => <button key={item} onClick={() => onTabChange(item)} className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${tab === item ? "border-[var(--accent-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>{item === "general" ? t.schools.tabs.details : item === "modules" ? t.schools.tabs.modules : t.schools.tabs.users}</button>)}</nav><div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-6 custom-scrollbar" style={{ minHeight: "300px" }}>{tab === "general" && <SchoolGeneralTab school={school} t={t} />}{tab === "modules" && <SchoolModulesTab modules={modules} loading={modulesLoading} error={modulesError} canManage={canManageModules} t={t} onToggle={onToggleModule} />}{tab === "users" && <SchoolUsersTab users={users} loading={usersLoading} error={usersError} actionLoadingId={actionLoadingId} t={t} onAdd={onAddUser} onEdit={onEditUser} onToggleActive={onToggleUserActive} />}</div></div></ModalShell>;
}
