import type { ReactNode } from "react";
import { Edit2, Loader2, UserCheck, UserPlus, UserX } from "lucide-react";
import { translations } from "@/lib/translations";
import { UserRole } from "@/types";
import type { SchoolUser } from "../types";

interface SchoolUsersTabProps {
  users: SchoolUser[];
  loading: boolean;
  error: string | null;
  actionLoadingId: string | null;
  t: typeof translations.es;
  onAdd: () => void;
  onEdit: (user: SchoolUser) => void;
  onToggleActive: (user: SchoolUser) => void;
}

export default function SchoolUsersTab({ users, loading, error, actionLoadingId, t, onAdd, onEdit, onToggleActive }: SchoolUsersTabProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between"><div className="space-y-0.5"><h3 className="text-lg font-bold">{t.schools.users.title}</h3><p className="text-xs text-[var(--text-secondary)]">{t.schools.users.subtitle}</p></div><button onClick={onAdd} className="glass-button flex items-center gap-1 text-xs py-2 px-4"><UserPlus size={14} /><span>{t.schools.users.addBtn}</span></button></div>
      {loading ? <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" /></div> : error ? <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">{error}</div> : users.length === 0 ? <div className="glass-panel p-10 text-center text-[var(--text-secondary)] text-sm border-dashed border-[var(--border-glass)]">{t.schools.users.noUsers}</div> : <UsersTable users={users} actionLoadingId={actionLoadingId} t={t} onEdit={onEdit} onToggleActive={onToggleActive} />}
    </div>
  );
}

function UsersTable({ users, actionLoadingId, t, onEdit, onToggleActive }: Omit<SchoolUsersTabProps, "loading" | "error" | "onAdd">) {
  return <div className="glass-panel overflow-hidden border border-[var(--border-glass)]"><table className="w-full text-left border-collapse"><thead><tr className="border-b border-[var(--border-glass)] bg-white/[0.01]"><Header>{t.schools.users.table.name}</Header><Header>{t.schools.users.table.email}</Header><Header>{t.schools.users.table.role}</Header><Header className="w-[100px] text-center">{t.schools.users.table.status}</Header><Header className="w-[120px] text-right">{t.schools.users.table.actions}</Header></tr></thead><tbody className="divide-y divide-white/5">{users.map((user) => <UserRow key={user.id} user={user} actionLoadingId={actionLoadingId} t={t} onEdit={onEdit} onToggleActive={onToggleActive} />)}</tbody></table></div>;
}

function Header({ children, className = "" }: { children: ReactNode; className?: string }) { return <th className={`p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ${className}`}>{children}</th>; }
function UserRow({ user, actionLoadingId, t, onEdit, onToggleActive }: { user: SchoolUser; actionLoadingId: string | null; t: typeof translations.es; onEdit: SchoolUsersTabProps["onEdit"]; onToggleActive: SchoolUsersTabProps["onToggleActive"] }) {
  const role = user.role === UserRole.SUPER_ADMIN ? t.schools.users.roles.SUPER_ADMIN : user.role === UserRole.TEACHER ? t.schools.users.roles.TEACHER : t.schools.users.roles.SCHOOL_ADMIN;
  return <tr className="hover:bg-white/[0.01]"><td className="p-3"><span className="font-semibold text-sm">{user.firstName} {user.lastName}</span></td><td className="p-3 text-xs text-[var(--text-secondary)] font-mono">{user.email}</td><td className="p-3"><span className="text-xs text-[var(--text-primary)] font-medium">{role}</span></td><td className="p-3 text-center"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${user.active ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>{user.active ? t.schools.status.active : t.schools.status.inactive}</span></td><td className="p-3"><div className="flex items-center justify-end gap-1.5"><button onClick={() => onEdit(user)} className="p-1.5 rounded border border-[var(--border-glass)] bg-white/[0.02] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"><Edit2 size={12} /></button><button onClick={() => onToggleActive(user)} disabled={actionLoadingId === user.id} className={`p-1.5 rounded border cursor-pointer disabled:opacity-50 ${user.active ? "bg-red-500/10 border-red-500/20 text-[var(--accent-danger)] hover:bg-red-500/20" : "bg-emerald-500/10 border-emerald-500/20 text-[var(--accent-success)] hover:bg-emerald-500/20"}`} title={user.active ? t.schools.deactivateBtn : t.schools.activateBtn}>{actionLoadingId === user.id ? <Loader2 size={12} className="animate-spin" /> : user.active ? <UserX size={12} /> : <UserCheck size={12} />}</button></div></td></tr>;
}
