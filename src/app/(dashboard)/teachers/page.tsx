"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  Edit2,
  ShieldAlert,
  Loader2,
  Check,
  X,
  Phone,
  Mail,
  RefreshCw,
  Eye,
  UserCheck,
  UserX,
  User,
  Building2,
  Lock,
  Calendar,
  CheckSquare,
  ToggleLeft,
  ToggleRight,
  Save,
  Info,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";
import api from "@/lib/api/axios";
import { ApiResponse, UserRole } from "@/types";

interface Teacher {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  schoolId: string;
  school?: {
    name: string;
    code: string;
  };
  teacherProfile?: {
    employeeNumber?: string;
    specialty?: string;
    hireDate?: string;
    allowedModules?: string[];
    groupAssignments?: Array<{
      id: string;
      group: {
        id: string;
        name: string;
        section: string;
        grade: { name: string };
        schoolYear: { name: string };
      };
    }>;
    subjectAssignments?: Array<{
      id: string;
      subject: { name: string };
      group: {
        id: string;
        name: string;
        section: string;
        grade: { name: string };
      };
    }>;
  };
}

interface School {
  id: string;
  name: string;
  code: string;
}

interface SchoolModule {
  module: string;
  active: boolean;
  isCore: boolean;
}

export default function TeachersPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  // List states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("");

  // Create/Edit Form Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<"create" | "edit">("create");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherFirstName, setTeacherFirstName] = useState("");
  const [teacherLastName, setTeacherLastName] = useState("");
  const [teacherPhone, setTeacherPhone] = useState("");
  const [teacherSchoolId, setTeacherSchoolId] = useState("");
  const [teacherEmpNumber, setTeacherEmpNumber] = useState("");
  const [teacherSpecialty, setTeacherSpecialty] = useState("");
  const [teacherHireDate, setTeacherHireDate] = useState("");

  // Details Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTeacher, setDetailTeacher] = useState<Teacher | null>(null);
  const [detailTab, setDetailTab] = useState<"general" | "permissions" | "assignments">("general");

  // Permissions Tab states
  const [schoolModules, setSchoolModules] = useState<SchoolModule[]>([]);
  const [schoolModulesLoading, setSchoolModulesLoading] = useState(false);
  const [teacherPermissions, setTeacherPermissions] = useState<string[]>([]);
  const [permissionsSubmitting, setPermissionsSubmitting] = useState(false);

  // Action loading states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SCHOOL_ADMIN;

  // Load teachers list
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint = "/teachers";
      if (user?.role === UserRole.SUPER_ADMIN && selectedSchoolFilter) {
        endpoint += `?schoolId=${selectedSchoolFilter}`;
      }

      const response = await api.get<ApiResponse<Teacher[]>>(endpoint);
      setTeachers(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching teachers:", err);
      setError(t.teachers.alerts.errorFetch);
    } finally {
      setLoading(false);
    }
  };

  // Load schools list (SUPER_ADMIN only)
  const fetchSchools = async () => {
    if (user?.role !== UserRole.SUPER_ADMIN) return;
    try {
      const response = await api.get<ApiResponse<School[]>>("/schools");
      setSchools(response.data.data || []);
    } catch (err) {
      console.error("Error fetching schools list:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTeachers();
      fetchSchools();
    }
  }, [user, selectedSchoolFilter]);

  // Load detailed teacher data (assignments and school modules status)
  const fetchTeacherDetails = async (teacherId: string) => {
    try {
      const response = await api.get<ApiResponse<Teacher>>(`/teachers/${teacherId}`);
      const updatedTeacher = response.data.data;
      setDetailTeacher(updatedTeacher);
      setTeacherPermissions(updatedTeacher.teacherProfile?.allowedModules || []);

      // If viewing permissions, fetch the school modules to know what is contracted
      if (isAdmin) {
        setSchoolModulesLoading(true);
        const schoolId = updatedTeacher.schoolId;
        const modulesResponse = await api.get<ApiResponse<SchoolModule[]>>(`/schools/${schoolId}/modules`);
        setSchoolModules(modulesResponse.data.data || []);
      }
    } catch (err) {
      console.error("Error loading teacher details:", err);
    } finally {
      setSchoolModulesLoading(false);
    }
  };

  useEffect(() => {
    if (detailTeacher && isDetailModalOpen) {
      fetchTeacherDetails(detailTeacher.id);
    }
  }, [detailTab]);

  const handleOpenDetails = (teacher: Teacher) => {
    setDetailTeacher(teacher);
    setTeacherPermissions(teacher.teacherProfile?.allowedModules || []);
    setDetailTab("general");
    setIsDetailModalOpen(true);
  };

  const handleOpenCreateForm = () => {
    setFormModalMode("create");
    setSelectedTeacher(null);
    setTeacherEmail("");
    setTeacherPassword("");
    setTeacherFirstName("");
    setTeacherLastName("");
    setTeacherPhone("");
    setTeacherSchoolId(user?.role === UserRole.SCHOOL_ADMIN ? user.schoolId : "");
    setTeacherEmpNumber("");
    setTeacherSpecialty("");
    setTeacherHireDate("");
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (teacher: Teacher) => {
    setFormModalMode("edit");
    setSelectedTeacher(teacher);
    setTeacherEmail(teacher.email);
    setTeacherPassword("");
    setTeacherFirstName(teacher.firstName);
    setTeacherLastName(teacher.lastName);
    setTeacherPhone(teacher.phone || "");
    setTeacherSchoolId(teacher.schoolId);
    setTeacherEmpNumber(teacher.teacherProfile?.employeeNumber || "");
    setTeacherSpecialty(teacher.teacherProfile?.specialty || "");
    
    let formattedDate = "";
    if (teacher.teacherProfile?.hireDate) {
      formattedDate = new Date(teacher.teacherProfile.hireDate).toISOString().split("T")[0];
    }
    setTeacherHireDate(formattedDate);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherFirstName.trim() || !teacherLastName.trim() || !teacherEmail.trim()) {
      setFormError(t.login.errorFields);
      return;
    }
    if (formModalMode === "create" && !teacherPassword.trim()) {
      setFormError(t.login.errorFields);
      return;
    }
    if (user?.role === UserRole.SUPER_ADMIN && !teacherSchoolId) {
      setFormError("Please select a school");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError(null);

      const payload = {
        email: teacherEmail,
        firstName: teacherFirstName,
        lastName: teacherLastName,
        phone: teacherPhone || undefined,
        employeeNumber: teacherEmpNumber || undefined,
        specialty: teacherSpecialty || undefined,
        hireDate: teacherHireDate || undefined,
        ...(formModalMode === "create" ? { password: teacherPassword, schoolId: teacherSchoolId } : {}),
      };

      if (formModalMode === "create") {
        await api.post("/teachers", payload);
      } else if (selectedTeacher) {
        const { email: _, ...updatePayload } = payload as any;
        await api.patch(`/teachers/${selectedTeacher.id}`, updatePayload);
      }

      setIsFormModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      console.error("Form submit error:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setFormError(
        backendMessage ||
        (formModalMode === "create" ? t.teachers.alerts.errorCreate : t.teachers.alerts.errorUpdate)
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle active/inactive state
  const handleToggleActive = async (teacher: Teacher) => {
    try {
      setActionLoadingId(teacher.id);
      // Optimistic update
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacher.id ? { ...t, active: !t.active } : t))
      );

      await api.patch(`/teachers/${teacher.id}`, { active: !teacher.active });
      
      // Background reload
      const response = await api.get<ApiResponse<Teacher[]>>("/teachers");
      setTeachers(response.data.data || []);
    } catch (err) {
      console.error("Error toggling active state:", err);
      // Revert
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacher.id ? { ...t, active: teacher.active } : t))
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle allowed optional module permission
  const handleTogglePermission = async (moduleName: string, isAllowed: boolean) => {
    if (!detailTeacher) return;

    let updatedPermissions = [...teacherPermissions];
    if (isAllowed) {
      // Remove
      updatedPermissions = updatedPermissions.filter((m) => m.toLowerCase() !== moduleName.toLowerCase());
    } else {
      // Add
      updatedPermissions.push(moduleName.toLowerCase());
    }

    try {
      setPermissionsSubmitting(true);
      // Optimistic update
      setTeacherPermissions(updatedPermissions);

      await api.patch(`/teachers/${detailTeacher.id}`, {
        allowedModules: updatedPermissions,
      });

      // Update local detailed teacher view state
      setDetailTeacher((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          teacherProfile: {
            ...prev.teacherProfile,
            allowedModules: updatedPermissions,
          },
        };
      });

      // Dispatch event to refresh layout sidebar if editing own profile (e.g. mock test case)
      if (detailTeacher.id === user?.id) {
        window.dispatchEvent(new Event("modulesUpdated"));
      }
    } catch (err) {
      console.error("Error updating teacher permissions:", err);
      // Revert
      setTeacherPermissions(detailTeacher.teacherProfile?.allowedModules || []);
    } finally {
      setPermissionsSubmitting(false);
    }
  };

  // Search filter logic
  const filteredTeachers = teachers.filter((t) => {
    const query = searchQuery.toLowerCase().trim();
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(query) ||
      t.email.toLowerCase().includes(query) ||
      (t.teacherProfile?.employeeNumber && t.teacherProfile.employeeNumber.toLowerCase().includes(query)) ||
      (t.teacherProfile?.specialty && t.teacherProfile.specialty.toLowerCase().includes(query));

    return matchesSearch;
  });

  if (authLoading) {
    return (
      <div className="flex-1 p-8">
        <Loader minHeight="400px" />
      </div>
    );
  }

  // Allow access only to admins and teachers
  if (!user) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="glass-panel max-w-md w-full p-8 text-center space-y-6 border border-red-500/20">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-[var(--accent-danger)]">
            <ShieldAlert size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Access Denied</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Please log in to view this directory.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="gradient-text text-[2.2rem] font-extrabold tracking-tight">
            {t.teachers.title}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-2xl">
            {t.teachers.subtitle}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreateForm}
            className="glass-button flex items-center gap-2 text-sm shrink-0"
          >
            <Plus size={16} />
            <span>{t.teachers.registerBtn}</span>
          </button>
        )}
      </div>

      {/* Toolbar panel */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-[280px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search size={18} className="text-[var(--text-muted)]" />
            </span>
            <input
              type="text"
              placeholder={t.header.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: "44px", height: "42px" }}
            />
          </div>

          {/* School filter (SUPER_ADMIN only) */}
          {user?.role === UserRole.SUPER_ADMIN && (
            <select
              value={selectedSchoolFilter}
              onChange={(e) => setSelectedSchoolFilter(e.target.value)}
              className="glass-input h-[42px] bg-[var(--bg-surface)] text-sm w-full sm:w-[200px]"
            >
              <option value="">Todas las escuelas / All schools</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={fetchTeachers}
            className="w-[42px] h-[42px] rounded-lg border border-[var(--border-glass)] bg-white/[0.03] flex items-center justify-center cursor-pointer transition-all hover:bg-white/[0.08]"
            title="Refresh List"
          >
            <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
          </button>
          <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide bg-black/10 px-3 py-1.5 rounded-lg border border-[var(--border-glass)]">
            Total: {filteredTeachers.length}
          </span>
        </div>
      </div>

      {/* Main Table view */}
      {loading && teachers.length === 0 ? (
        <Loader />
      ) : error ? (
        <div className="glass-panel p-8 text-center space-y-4 border-red-500/20">
          <p className="text-red-400 text-sm font-semibold">{error}</p>
          <button onClick={fetchTeachers} className="glass-button-secondary text-xs">
            Try Again
          </button>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="glass-panel p-12 text-center text-[var(--text-secondary)] text-sm border-dashed border-[var(--border-glass)]">
          {t.teachers.noData}
        </div>
      ) : (
        <div className="glass-panel overflow-hidden border border-[var(--border-glass)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-glass)] bg-white/[0.01]">
                  <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {t.teachers.table.name}
                  </th>
                  <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">
                    {t.teachers.table.email}
                  </th>
                  {user?.role === UserRole.SUPER_ADMIN && (
                    <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {t.teachers.details.schoolName || "School"}
                    </th>
                  )}
                  <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[140px] hidden sm:table-cell">
                    {t.teachers.table.employeeNumber}
                  </th>
                  <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[160px] hidden md:table-cell">
                    {t.teachers.table.specialty}
                  </th>
                  <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[120px] text-center">
                    {t.teachers.table.status}
                  </th>
                  <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[180px] text-right">
                    {t.teachers.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-primary)] shrink-0 font-bold uppercase">
                          {teacher.firstName[0] || ""}{teacher.lastName[0] || ""}
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-[var(--text-primary)] block">
                            {teacher.firstName} {teacher.lastName}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] md:hidden">
                            {teacher.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-[var(--text-secondary)] font-mono hidden md:table-cell">
                      {teacher.email}
                    </td>
                    {user?.role === UserRole.SUPER_ADMIN && (
                      <td className="p-4 text-xs font-semibold text-[var(--text-primary)]">
                        {teacher.school?.name || teacher.schoolId}
                      </td>
                    )}
                    <td className="p-4 text-xs font-mono text-[var(--text-secondary)] hidden sm:table-cell">
                      {teacher.teacherProfile?.employeeNumber || "—"}
                    </td>
                    <td className="p-4 text-xs text-[var(--text-secondary)] truncate max-w-[150px] hidden md:table-cell">
                      {teacher.teacherProfile?.specialty || "—"}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold select-none border
                          ${
                            teacher.active
                              ? "bg-emerald-500/10 text-[var(--accent-success)] border-emerald-500/20"
                              : "bg-rose-500/10 text-[var(--accent-danger)] border-rose-500/20"
                          }
                        `}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${teacher.active ? "bg-[var(--accent-success)] animate-pulse" : "bg-[var(--accent-danger)]"}`} />
                        {teacher.active ? t.schools.status.active : t.schools.status.inactive}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Eye details button */}
                        <button
                          onClick={() => handleOpenDetails(teacher)}
                          className="p-2 rounded-lg border border-[var(--border-glass)] bg-white/[0.02] hover:bg-white/[0.08] hover:border-[var(--accent-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                          title={t.schools.tabs.details}
                        >
                          <Eye size={14} />
                        </button>
                        
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEditForm(teacher)}
                              className="p-2 rounded-lg border border-[var(--border-glass)] bg-white/[0.02] hover:bg-white/[0.08] hover:border-[var(--accent-primary-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                              title={t.schools.editBtn}
                            >
                              <Edit2 size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleToggleActive(teacher)}
                              disabled={actionLoadingId === teacher.id}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all disabled:opacity-50
                                ${
                                  teacher.active
                                    ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-[var(--accent-danger)]"
                                    : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-[var(--accent-success)]"
                                }
                              `}
                            >
                              {actionLoadingId === teacher.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : teacher.active ? (
                                <X size={12} />
                              ) : (
                                <Check size={12} />
                              )}
                              <span>
                                {teacher.active ? t.schools.deactivateBtn : t.schools.activateBtn}
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Create/Edit Teacher */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-6 border border-[var(--border-glass)] relative">
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold gradient-text">
                {formModalMode === "create" ? t.teachers.modal.createTitle : t.teachers.modal.editTitle}
              </h2>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                {/* Names */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                      {t.schools.users.modal.firstName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={teacherFirstName}
                      onChange={(e) => setTeacherFirstName(e.target.value)}
                      className="glass-input"
                      disabled={formSubmitting}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                      {t.schools.users.modal.lastName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={teacherLastName}
                      onChange={(e) => setTeacherLastName(e.target.value)}
                      className="glass-input"
                      disabled={formSubmitting}
                    />
                  </div>
                </div>

                {/* Email (immutable on edit) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                    {t.schools.users.modal.email} *
                  </label>
                  <input
                    type="email"
                    required
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    className="glass-input"
                    disabled={formSubmitting || formModalMode === "edit"}
                  />
                </div>

                {/* Password (create only) */}
                {formModalMode === "create" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                      {t.teachers.modal.passwordLabel} *
                    </label>
                    <input
                      type="password"
                      required
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      className="glass-input"
                      disabled={formSubmitting}
                    />
                  </div>
                )}

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                    {t.teachers.table.phone}
                  </label>
                  <input
                    type="text"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="glass-input"
                    disabled={formSubmitting}
                  />
                </div>

                {/* School Selector (SUPER_ADMIN only, create mode only) */}
                {user?.role === UserRole.SUPER_ADMIN && formModalMode === "create" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                      {t.teachers.details.schoolName || "School"} *
                    </label>
                    <select
                      value={teacherSchoolId}
                      onChange={(e) => setTeacherSchoolId(e.target.value)}
                      className="glass-input bg-[var(--bg-surface)]"
                      disabled={formSubmitting}
                    >
                      <option value="">Selecciona escuela / Select school</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Employee Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                    {t.teachers.modal.employeeNumberLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="EMP-001"
                    value={teacherEmpNumber}
                    onChange={(e) => setTeacherEmpNumber(e.target.value)}
                    className="glass-input font-mono"
                    disabled={formSubmitting}
                  />
                </div>

                {/* Specialty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                    {t.teachers.modal.specialtyLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="Mathematics, Physics ..."
                    value={teacherSpecialty}
                    onChange={(e) => setTeacherSpecialty(e.target.value)}
                    className="glass-input"
                    disabled={formSubmitting}
                  />
                </div>

                {/* Hire Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                    {t.teachers.modal.hireDateLabel}
                  </label>
                  <input
                    type="date"
                    value={teacherHireDate}
                    onChange={(e) => setTeacherHireDate(e.target.value)}
                    className="glass-input"
                    disabled={formSubmitting}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-glass)]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={formSubmitting}
                  className="glass-button-secondary py-2 px-5 text-sm cursor-pointer"
                >
                  {t.teachers.modal.cancel}
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="glass-button py-2 px-5 text-sm flex items-center gap-2 cursor-pointer"
                >
                  {formSubmitting && <Loader2 size={16} className="animate-spin" />}
                  <span>{formSubmitting ? t.teachers.modal.loading : t.teachers.modal.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Teacher Detailed View (Tabs: General, Permissions, Assignments) */}
      {isDetailModalOpen && detailTeacher && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-3xl w-full p-6 border border-[var(--border-glass)] relative flex flex-col max-h-[85vh] overflow-hidden animate-scale-up">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            {/* Modal Title Banner */}
            <div className="flex items-center gap-4 border-b border-[var(--border-glass)] pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-lg uppercase shrink-0">
                {detailTeacher.firstName[0] || ""}{detailTeacher.lastName[0] || ""}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  {detailTeacher.firstName} {detailTeacher.lastName}
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {t.teachers.details.role}: {t.schools.users.roles.TEACHER} | {t.teachers.details.schoolName}: {detailTeacher.school?.name || detailTeacher.schoolId}
                </p>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-[var(--border-glass)] gap-6 pb-1">
              <button
                onClick={() => setDetailTab("general")}
                className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer
                  ${detailTab === "general" ? "border-[var(--accent-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
                `}
              >
                {t.teachers.details.generalInfo}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setDetailTab("permissions")}
                  className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer
                    ${detailTab === "permissions" ? "border-[var(--accent-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
                  `}
                >
                  {t.teachers.details.permissions}
                </button>
              )}
              <button
                onClick={() => setDetailTab("assignments")}
                className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer
                  ${detailTab === "assignments" ? "border-[var(--accent-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
                `}
              >
                {t.teachers.details.assignments}
              </button>
            </div>

            {/* Tab content area (scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-6 custom-scrollbar" style={{ minHeight: "300px" }}>
              {/* TAB 1: General Info */}
              {detailTab === "general" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {language === "es" ? "Información de Contacto" : "Contact Details"}
                    </h3>
                    <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-[var(--border-glass)]">
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-[var(--text-muted)] block">{t.teachers.table.email}</span>
                          <span className="text-sm text-[var(--text-primary)] font-mono">{detailTeacher.email}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-[var(--text-muted)] block">{t.teachers.table.phone}</span>
                          <span className="text-sm text-[var(--text-primary)]">{detailTeacher.phone || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {language === "es" ? "Detalles Profesionales" : "Professional Details"}
                    </h3>
                    <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-[var(--border-glass)]">
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.teachers.table.employeeNumber}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)] font-mono">
                          {detailTeacher.teacherProfile?.employeeNumber || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.teachers.table.specialty}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {detailTeacher.teacherProfile?.specialty || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.teachers.modal.hireDateLabel}</span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          {detailTeacher.teacherProfile?.hireDate
                            ? new Date(detailTeacher.teacherProfile.hireDate).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.teachers.table.status}</span>
                        <span className={`text-xs font-bold ${detailTeacher.active ? "text-[var(--accent-success)]" : "text-[var(--accent-danger)]"}`}>
                          {detailTeacher.active ? t.schools.status.active : t.schools.status.inactive}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Permissions (Admin only) */}
              {detailTab === "permissions" && isAdmin && (
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">{t.teachers.modal.allowedModulesLabel}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{t.teachers.modal.allowedModulesSubtitle}</p>
                  </div>

                  {schoolModulesLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
                    </div>
                  ) : (
                    <div className="glass-panel overflow-hidden border border-[var(--border-glass)]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--border-glass)] bg-white/[0.01]">
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                              {t.schools.modules.colName}
                            </th>
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[180px]">
                              {language === "es" ? "Contratado (Escuela)" : "School Contracted"}
                            </th>
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[150px] text-right">
                              {language === "es" ? "Acceso Permitido" : "Access Allowed"}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {schoolModules
                            .filter((sm) => !sm.isCore) // Only show optional modules
                            .map((sm) => {
                              const moduleKey = sm.module.toLowerCase();
                              const isAllowedForTeacher = teacherPermissions
                                .map((p) => p.toLowerCase())
                                .includes(moduleKey);

                              return (
                                <tr key={sm.module} className="hover:bg-white/[0.01]">
                                  <td className="p-3">
                                    <span className="font-semibold text-sm capitalize">
                                      {t.sidebar[moduleKey as keyof typeof t.sidebar] || sm.module}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    {sm.active ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                                        {t.schools.status.active}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border bg-rose-500/10 border-rose-500/20 text-rose-400">
                                        {t.schools.status.inactive}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex justify-end items-center">
                                      {sm.active ? (
                                        <button
                                          onClick={() => handleTogglePermission(sm.module, isAllowedForTeacher)}
                                          disabled={permissionsSubmitting}
                                          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                          {isAllowedForTeacher ? (
                                            <ToggleRight size={32} className="text-[var(--accent-success)]" />
                                          ) : (
                                            <ToggleLeft size={32} className="text-[var(--text-muted)]" />
                                          )}
                                        </button>
                                      ) : (
                                        <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs italic">
                                          <Lock size={12} />
                                          <span>{language === "es" ? "Sin Contratar" : "Locked"}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Academic Assignments */}
              {detailTab === "assignments" && (
                <div className="space-y-6 py-2">
                  {/* Groups Assignments */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <Calendar size={18} className="text-[var(--accent-primary)]" />
                      <span>{language === "es" ? "Grupos Asignados (Titular)" : "Assigned Groups (Homeroom)"}</span>
                    </h3>
                    
                    {!detailTeacher.teacherProfile?.groupAssignments ||
                    detailTeacher.teacherProfile.groupAssignments.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] italic pl-1">
                        {language === "es" ? "No es profesor titular de ningún grupo." : "Not assigned as homeroom teacher to any groups."}
                      </p>
                    ) : (
                      <div className="glass-panel overflow-hidden border border-[var(--border-glass)]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border-glass)] bg-white/[0.01]">
                              <th className="p-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">{t.teachers.details.class}</th>
                              <th className="p-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">{t.teachers.details.level}</th>
                              <th className="p-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">{t.teachers.details.schoolYear}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {detailTeacher.teacherProfile.groupAssignments.map((ga) => (
                              <tr key={ga.id} className="hover:bg-white/[0.01]">
                                <td className="p-2.5 text-sm font-semibold text-[var(--text-primary)]">
                                  {ga.group.name} - {ga.group.section}
                                </td>
                                <td className="p-2.5 text-xs text-[var(--text-secondary)]">{ga.group.grade.name}</td>
                                <td className="p-2.5 text-xs text-[var(--text-muted)] font-mono">{ga.group.schoolYear.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Subjects / Subject-Group Assignments */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <CheckSquare size={18} className="text-[var(--accent-secondary)]" />
                      <span>{language === "es" ? "Materias e Impartición" : "Subject Assignments"}</span>
                    </h3>

                    {!detailTeacher.teacherProfile?.subjectAssignments ||
                    detailTeacher.teacherProfile.subjectAssignments.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] italic pl-1">
                        {language === "es" ? "No imparte ninguna materia asignada." : "No subjects assigned to teach."}
                      </p>
                    ) : (
                      <div className="glass-panel overflow-hidden border border-[var(--border-glass)]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border-glass)] bg-white/[0.01]">
                              <th className="p-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">{t.teachers.details.subject}</th>
                              <th className="p-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">{t.teachers.details.class}</th>
                              <th className="p-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">{t.teachers.details.level}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {detailTeacher.teacherProfile.subjectAssignments.map((sa) => (
                              <tr key={sa.id} className="hover:bg-white/[0.01]">
                                <td className="p-2.5 text-sm font-semibold text-[var(--text-primary)]">{sa.subject.name}</td>
                                <td className="p-2.5 text-xs text-[var(--text-secondary)]">
                                  {sa.group.name} - {sa.group.section}
                                </td>
                                <td className="p-2.5 text-xs text-[var(--text-muted)]">{sa.group.grade.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
