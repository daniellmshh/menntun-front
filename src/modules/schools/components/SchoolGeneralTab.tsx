import type { ReactNode } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { translations } from "@/lib/translations";
import type { School } from "../types";

interface SchoolGeneralTabProps {
  school: School;
  t: typeof translations.es;
}

export default function SchoolGeneralTab({ school, t }: SchoolGeneralTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.schools.details.contactLocation}</h3>
        <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-[var(--border-glass)]">
          <ContactRow icon={<MapPin size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />} label={t.schools.details.address} value={school.address} />
          <ContactRow icon={<Phone size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />} label={t.schools.details.phone} value={school.phone} />
          <ContactRow icon={<Mail size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />} label={t.schools.details.email} value={school.email} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.schools.details.accountInfo}</h3>
        <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-[var(--border-glass)]">
          <InfoRow label={t.schools.details.activeStatus} value={school.active ? t.schools.status.active : t.schools.status.inactive} valueClassName={school.active ? "text-[var(--accent-success)]" : "text-[var(--accent-danger)]"} />
          <InfoRow label={t.schools.details.registeredUsers} value={school._count?.users ?? 0} />
          <InfoRow label={t.schools.details.createdAt} value={school.createdAt ? new Date(school.createdAt).toLocaleDateString() : "N/A"} muted />
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return <div className="flex items-start gap-3">{icon}<div><span className="text-xs text-[var(--text-muted)] block">{label}</span><span className="text-sm text-[var(--text-primary)]">{value || "N/A"}</span></div></div>;
}

function InfoRow({ label, value, valueClassName = "text-[var(--text-primary)]", muted = false }: { label: string; value: string | number; valueClassName?: string; muted?: boolean }) {
  return <div className="flex justify-between items-center py-1.5 border-b last:border-0 border-white/5"><span className="text-xs text-[var(--text-secondary)]">{label}</span><span className={`text-xs font-bold ${muted ? "font-mono text-[var(--text-muted)]" : valueClassName}`}>{value}</span></div>;
}
