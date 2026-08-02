import type { ReactNode } from "react";
import { Bookmark, Calendar, ShieldCheck, Users } from "lucide-react";
import type { AcademicGroup, GroupTranslations } from "../types";

interface HomeroomTeacher {
  teacherProfile: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface GroupGeneralTabProps {
  group: AcademicGroup;
  homeroomTeacher?: HomeroomTeacher | null;
  t: GroupTranslations;
}

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  value: string;
  bordered?: boolean;
}

function DetailRow({ icon, label, value, bordered = false }: DetailRowProps) {
  return (
    <div
      className={`flex items-center justify-between text-sm ${
        bordered ? "border-b border-[var(--border-glass)] pb-2.5" : ""
      }`}
    >
      <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
        {icon}
        {label}
      </span>
      <span className="font-bold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

export default function GroupGeneralTab({
  group,
  homeroomTeacher,
  t,
}: GroupGeneralTabProps) {
  const enrolledStudents = group._count?.enrollments ?? 0;

  return (
    <div className="space-y-4">
      <div className="glass-panel space-y-3 rounded-xl border border-[var(--border-glass)] p-4">
        <DetailRow
          bordered
          icon={<Bookmark size={15} />}
          label={t.detail.grade}
          value={group.grade?.name || "—"}
        />
        <DetailRow
          bordered
          icon={<Calendar size={15} />}
          label={t.detail.schoolYear}
          value={group.schoolYear?.name || "—"}
        />
        <DetailRow
          icon={<Users size={15} />}
          label={t.detail.capacity}
          value={`${enrolledStudents} / ${group.maxStudents || "∞"}`}
        />
      </div>

      {homeroomTeacher && (
        <div className="flex items-center gap-3 rounded-xl border border-[hsla(142,72%,45%,0.2)] bg-[hsla(142,72%,45%,0.06)] p-4">
          <ShieldCheck
            size={18}
            className="flex-shrink-0 text-[hsl(142,72%,55%)]"
          />
          <div>
            <p className="text-xs font-semibold text-[hsl(142,72%,55%)]">
              Maestro Titular
            </p>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {homeroomTeacher.teacherProfile.user.firstName}{" "}
              {homeroomTeacher.teacherProfile.user.lastName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
