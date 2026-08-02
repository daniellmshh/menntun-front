"use client";

import React, { useCallback, useEffect, useState } from "react";
import SchoolFormModal from "./SchoolFormModal";
import SchoolUserFormModal, { type SchoolUserPosition } from "./SchoolUserFormModal";
import SchoolDetailModal from "./SchoolDetailModal";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  ShieldAlert,
  Loader2,
  Check,
  X,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  Eye,
} from "lucide-react";
import ModuleGuard from "@/components/shared/ModuleGuard";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import Loader from "@/components/shared/Loader";
import { translations } from "@/lib/translations";
import api from "@/lib/api/axios";
import { ApiResponse, UserRole } from "@/types";
import type { School, SchoolDetailTab, SchoolModule, SchoolUser } from "../types";

function getApiErrorMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const response = error.response;
  if (typeof response !== "object" || response === null || !("data" in response)) {
    return undefined;
  }

  const data = response.data;
  if (typeof data !== "object" || data === null) {
    return undefined;
  }

  if ("error" in data && typeof data.error === "string") {
    return data.error;
  }

  return "message" in data && typeof data.message === "string" ? data.message : undefined;
}

export default function SchoolsPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  // List states
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Create/Edit School Modal states
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [schoolModalMode, setSchoolModalMode] = useState<"create" | "edit">("create");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolSubmitting, setSchoolSubmitting] = useState(false);
  const [schoolFormError, setSchoolFormError] = useState<string | null>(null);

  // School Form fields
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [schoolLogoUrl, setSchoolLogoUrl] = useState("");
  const [isIndependentTeacher, setIsIndependentTeacher] = useState(false);

  // Detail Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailSchool, setDetailSchool] = useState<School | null>(null);
  const [detailTab, setDetailTab] = useState<SchoolDetailTab>("general");

  // Modules tab states
  const [modules, setModules] = useState<SchoolModule[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState<string | null>(null);

  // Users tab states
  const [users, setUsers] = useState<SchoolUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // User Register/Edit Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<SchoolUser | null>(null);
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // User Form fields
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userPosition, setUserPosition] = useState<SchoolUserPosition>("admin");
  const [userActive, setUserActive] = useState(true);

  // Action loaders (keyed by item ID)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fetch schools list
  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (user?.role === UserRole.SUPER_ADMIN) {
        const response = await api.get<ApiResponse<School[]>>("/schools");
        setSchools(response.data.data || []);
      } else if (user?.role === UserRole.SCHOOL_ADMIN) {
        const response = await api.get<ApiResponse<School>>("/schools/me");
        setSchools(response.data.data ? [response.data.data] : []);
      }
    } catch (err: unknown) {
      console.error("Error fetching schools:", err);
      setError(t.schools.alerts.errorFetch);
    } finally {
      setLoading(false);
    }
  }, [t.schools.alerts.errorFetch, user]);

  useEffect(() => {
    if (user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SCHOOL_ADMIN) {
      const timeoutId = window.setTimeout(() => {
        void fetchSchools();
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [fetchSchools, user?.role]);

  // Load modules details
  const fetchModules = useCallback(async (schoolId: string) => {
    try {
      setModulesLoading(true);
      setModulesError(null);
      const response = await api.get<ApiResponse<SchoolModule[]>>(`/schools/${schoolId}/modules`);
      setModules(response.data.data || []);
    } catch (err: unknown) {
      console.error("Error fetching school modules:", err);
      setModulesError(t.schools.modules.errorToggle);
    } finally {
      setModulesLoading(false);
    }
  }, [t.schools.modules.errorToggle]);

  // Load school users
  const fetchUsers = useCallback(async (schoolId: string) => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const response = await api.get<ApiResponse<SchoolUser[]>>(`/schools/${schoolId}/users`);
      setUsers(response.data.data || []);
    } catch (err: unknown) {
      console.error("Error fetching school users:", err);
      setUsersError(t.schools.users.errorFetch);
    } finally {
      setUsersLoading(false);
    }
  }, [t.schools.users.errorFetch]);

  // Handle Tab Switch
  useEffect(() => {
    if (detailSchool) {
      if (detailTab === "modules") {
        const timeoutId = window.setTimeout(() => {
          void fetchModules(detailSchool.id);
        }, 0);
        return () => window.clearTimeout(timeoutId);
      } else if (detailTab === "users") {
        const timeoutId = window.setTimeout(() => {
          void fetchUsers(detailSchool.id);
        }, 0);
        return () => window.clearTimeout(timeoutId);
      }
    }
  }, [detailSchool, detailTab, fetchModules, fetchUsers]);

  // Open details view
  const handleOpenDetails = (school: School) => {
    setDetailSchool(school);
    setDetailTab("general");
    setIsDetailModalOpen(true);
  };

  // Open create school modal
  const handleOpenCreateSchool = () => {
    setSchoolModalMode("create");
    setSelectedSchool(null);
    setSchoolName("");
    setSchoolCode("");
    setSchoolAddress("");
    setSchoolPhone("");
    setSchoolEmail("");
    setSchoolLogoUrl("");
    setIsIndependentTeacher(false);
    setSchoolFormError(null);
    setIsSchoolModalOpen(true);
  };

  // Open edit school modal
  const handleOpenEditSchool = (school: School) => {
    setSchoolModalMode("edit");
    setSelectedSchool(school);
    setSchoolName(school.name);
    setSchoolCode(school.code);
    setSchoolAddress(school.address || "");
    setSchoolPhone(school.phone || "");
    setSchoolEmail(school.email || "");
    setSchoolLogoUrl(school.logoUrl || "");
    setSchoolFormError(null);
    setIsSchoolModalOpen(true);
  };

  // Submit School (Create/Edit)
  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalCode = schoolCode;
    if (isIndependentTeacher && !finalCode) {
      finalCode = `IND-${Date.now().toString().slice(-6)}`;
    }

    if (!schoolName.trim() || !finalCode.trim()) {
      setSchoolFormError(t.login.errorFields);
      return;
    }

    try {
      setSchoolSubmitting(true);
      setSchoolFormError(null);

      const payload = {
        name: schoolName.trim(),
        code: finalCode.trim(),
        address: schoolAddress.trim() || undefined,
        phone: schoolPhone.trim() || undefined,
        email: schoolEmail.trim() || undefined,
        logoUrl: schoolLogoUrl.trim() || undefined,
      };

      if (schoolModalMode === "create") {
        await api.post("/schools", payload);
      } else if (selectedSchool) {
        const updatePayload = {
          name: payload.name,
          address: payload.address,
          phone: payload.phone,
          email: payload.email,
          logoUrl: payload.logoUrl,
        };
        await api.patch(`/schools/${selectedSchool.id}`, updatePayload);
      }

      setIsSchoolModalOpen(false);
      fetchSchools();
    } catch (err: unknown) {
      console.error("School form submit error:", err);
      const backendMessage = getApiErrorMessage(err);
      setSchoolFormError(
        backendMessage || 
        (schoolModalMode === "create" ? t.schools.alerts.errorCreate : t.schools.alerts.errorUpdate)
      );
    } finally {
      setSchoolSubmitting(false);
    }
  };

  // Toggle school active/inactive status
  const handleToggleSchoolActive = async (school: School) => {
    try {
      setActionLoadingId(school.id);
      
      // Optimistic state update
      setSchools((prev) =>
        prev.map((s) => (s.id === school.id ? { ...s, active: !s.active } : s))
      );

      await api.patch(`/schools/${school.id}`, { active: !school.active });
      
      // Background reload
      const response = await api.get<ApiResponse<School[]>>("/schools");
      setSchools(response.data.data || []);
    } catch (err) {
      console.error("Error toggling active state:", err);
      // Revert
      setSchools((prev) =>
        prev.map((s) => (s.id === school.id ? { ...s, active: school.active } : s))
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle module activation status
  const handleToggleModule = async (moduleName: string, currentActive: boolean) => {
    if (!detailSchool) return;
    try {
      // Optimistic update
      setModules((prev) =>
        prev.map((m) => (m.module === moduleName ? { ...m, active: !currentActive } : m))
      );

      await api.patch(`/schools/${detailSchool.id}/modules`, {
        modules: [moduleName],
        active: !currentActive,
      });

      // Dispatch event to trigger sidebar refresh
      window.dispatchEvent(new Event("modulesUpdated"));
    } catch (err) {
      console.error("Error toggling module:", err);
      // Revert
      setModules((prev) =>
        prev.map((m) => (m.module === moduleName ? { ...m, active: currentActive } : m))
      );
    }
  };

  // Open modal to add user to school
  const handleOpenAddUser = () => {
    setUserModalMode("create");
    setSelectedUser(null);
    setUserFirstName("");
    setUserLastName("");
    setUserEmail("");
    setUserPhone("");
    setUserPassword("");
    setUserPosition("admin");
    setUserActive(true);
    setUserFormError(null);
    setIsUserModalOpen(true);
  };

  // Open modal to edit user
  const handleOpenEditUser = (schoolUser: SchoolUser) => {
    setUserModalMode("edit");
    setSelectedUser(schoolUser);
    setUserFirstName(schoolUser.firstName);
    setUserLastName(schoolUser.lastName);
    setUserEmail(schoolUser.email);
    setUserPhone(schoolUser.phone || "");
    setUserPassword("");
    setUserActive(schoolUser.active);
    
    // Map database role to userPosition dropdown selection
    if (schoolUser.role === UserRole.TEACHER) {
      setUserPosition("teacher");
    } else {
      setUserPosition("admin");
    }
    setUserFormError(null);
    setIsUserModalOpen(true);
  };

  // Submit User (Register/Update)
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailSchool) return;

    if (userModalMode === "create" && (!userEmail.trim() || !userPassword.trim() || !userFirstName.trim() || !userLastName.trim())) {
      setUserFormError(t.login.errorFields);
      return;
    }

    try {
      setUserSubmitting(true);
      setUserFormError(null);

      // Map positions to actual database UserRoles
      let dbRole: UserRole = UserRole.SCHOOL_ADMIN;
      if (userPosition === "teacher") {
        dbRole = UserRole.TEACHER;
      }

      if (userModalMode === "create") {
        const payload = {
          email: userEmail,
          password: userPassword,
          role: dbRole,
          firstName: userFirstName,
          lastName: userLastName,
          phone: userPhone || undefined,
        };
        await api.post(`/schools/${detailSchool.id}/users`, payload);
      } else if (selectedUser) {
        const payload = {
          role: dbRole,
          firstName: userFirstName,
          lastName: userLastName,
          phone: userPhone || undefined,
          active: userActive,
        };
        await api.patch(`/schools/${detailSchool.id}/users/${selectedUser.id}`, payload);
      }

      setIsUserModalOpen(false);
      fetchUsers(detailSchool.id);
    } catch (err: unknown) {
      console.error("User form submit error:", err);
      const backendMessage = getApiErrorMessage(err);
      setUserFormError(
        backendMessage || 
        (userModalMode === "create" ? t.schools.users.modal.errorCreate : t.schools.users.modal.errorUpdate)
      );
    } finally {
      setUserSubmitting(false);
    }
  };

  // Toggle user active status directly
  const handleToggleUserActive = async (schoolUser: SchoolUser) => {
    if (!detailSchool) return;
    try {
      setActionLoadingId(schoolUser.id);

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === schoolUser.id ? { ...u, active: !schoolUser.active } : u))
      );

      await api.patch(`/schools/${detailSchool.id}/users/${schoolUser.id}`, {
        active: !schoolUser.active,
      });

      // Background reload
      const res = await api.get<ApiResponse<SchoolUser[]>>(`/schools/${detailSchool.id}/users`);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Error toggling user status:", err);
      // Revert
      setUsers((prev) =>
        prev.map((u) => (u.id === schoolUser.id ? { ...u, active: schoolUser.active } : u))
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter schools list based on search term
  const filteredSchoolsList = schools.filter((school) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      school.name.toLowerCase().includes(query) ||
      school.code.toLowerCase().includes(query) ||
      (school.address && school.address.toLowerCase().includes(query)) ||
      (school.email && school.email.toLowerCase().includes(query))
    );
  });

  // Auth Guard view
  if (authLoading) {
    return (
      <div className="flex-1 p-8">
        <Loader minHeight="400px" />
      </div>
    );
  }

  if (!user || (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.SCHOOL_ADMIN)) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="glass-panel max-w-md w-full p-8 text-center space-y-6 border border-red-500/20">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-[var(--accent-danger)]">
            <ShieldAlert size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Access Denied</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              This module is only accessible to Super Administrators. Please contact your administrator if you believe this is an error.
            </p>
          </div>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="glass-button w-full"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ModuleGuard moduleKey="schools" requireSchoolContext={true}>
      <div className="space-y-8 animate-fade-in">
        {/* If SUPER_ADMIN, render schools list */}
      {user?.role === UserRole.SUPER_ADMIN && (
        <>
          {/* Header section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow shrink-0">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
                  {t.schools.title}
                </h1>
                <p className="text-[var(--text-secondary)] text-sm mt-0.5 max-w-2xl">
                  {t.schools.subtitle}
                </p>
              </div>
            </div>
            <button onClick={handleOpenCreateSchool} className="glass-button flex items-center gap-2 text-sm shrink-0">
              <Plus size={16} />
              <span>{t.schools.createBtn}</span>
            </button>
          </div>

          {/* Toolbar panel */}
          <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-[320px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search size={18} className="text-[var(--text-muted)]" />
              </span>
              <input
                type="text"
                placeholder={t.header.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: "44px", height: "42px" }} // Explicit padding to prevent search icon overlapping placeholder text
              />
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={fetchSchools}
                className="w-[42px] h-[42px] rounded-lg border border-[var(--border-glass)] bg-white/[0.03] flex items-center justify-center cursor-pointer transition-all hover:bg-white/[0.08]"
                title="Refresh List"
              >
                <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
              </button>
              <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide bg-black/10 px-3 py-1.5 rounded-lg border border-[var(--border-glass)]">
                Total: {filteredSchoolsList.length}
              </span>
            </div>
          </div>

          {/* Main Table view */}
          {loading && schools.length === 0 ? (
            <Loader />
          ) : error ? (
            <div className="glass-panel p-8 text-center space-y-4 border-red-500/20">
              <p className="text-red-400 text-sm font-semibold">{error}</p>
              <button onClick={fetchSchools} className="glass-button-secondary text-xs">
                Try Again
              </button>
            </div>
          ) : filteredSchoolsList.length === 0 ? (
            <div className="glass-panel p-12 text-center text-[var(--text-secondary)] text-sm border-dashed border-[var(--border-glass)]">
              {t.schools.noData}
            </div>
          ) : (
            <div className="glass-panel overflow-hidden border border-[var(--border-glass)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-glass)] bg-white/[0.01]">
                      <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        {t.schools.table.name}
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[180px]">
                        {t.schools.table.code}
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">
                        Contact & Address
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[120px] text-center">
                        {t.schools.table.status}
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[220px] text-right">
                        {t.schools.table.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSchoolsList.map((school) => (
                      <tr key={school.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
                              {school.logoUrl ? (
                                <img
                                  src={school.logoUrl}
                                  alt={school.name}
                                  className="w-full h-full object-cover rounded-xl"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <Building2 size={18} />
                              )}
                            </div>
                            <span className="font-semibold text-sm text-[var(--text-primary)]">{school.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-mono text-[var(--text-secondary)]">{school.code}</td>
                        <td className="p-4 text-xs text-[var(--text-muted)] hidden md:table-cell space-y-1">
                          {school.address && (
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="text-[var(--text-muted)]" />
                              <span className="truncate max-w-[240px]">{school.address}</span>
                            </div>
                          )}
                          {(school.phone || school.email) && (
                            <div className="flex items-center gap-3 flex-wrap">
                              {school.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone size={12} className="text-[var(--text-muted)]" />
                                  <span>{school.phone}</span>
                                </div>
                              )}
                              {school.email && (
                                <div className="flex items-center gap-1">
                                  <Mail size={12} className="text-[var(--text-muted)]" />
                                  <span>{school.email}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold select-none border
                              ${
                                school.active
                                  ? "bg-emerald-500/10 text-[var(--accent-success)] border-emerald-500/20"
                                  : "bg-rose-500/10 text-[var(--accent-danger)] border-rose-500/20"
                              }
                            `}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${school.active ? "bg-[var(--accent-success)] animate-pulse" : "bg-[var(--accent-danger)]"}`} />
                            {school.active ? t.schools.status.active : t.schools.status.inactive}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* Eye details button */}
                            <button
                              onClick={() => handleOpenDetails(school)}
                              className="p-2 rounded-lg border border-[var(--border-glass)] bg-white/[0.02] hover:bg-white/[0.08] hover:border-[var(--accent-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                              title={t.schools.tabs.details}
                            >
                              <Eye size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleOpenEditSchool(school)}
                              className="p-2 rounded-lg border border-[var(--border-glass)] bg-white/[0.02] hover:bg-white/[0.08] hover:border-[var(--accent-primary-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                              title={t.schools.editBtn}
                            >
                              <Edit2 size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleToggleSchoolActive(school)}
                              disabled={actionLoadingId === school.id}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all disabled:opacity-50
                                ${
                                  school.active
                                    ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-[var(--accent-danger)]"
                                    : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-[var(--accent-success)]"
                                }
                              `}
                            >
                              {actionLoadingId === school.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : school.active ? (
                                <X size={12} />
                              ) : (
                                <Check size={12} />
                              )}
                              <span>
                                {school.active ? t.schools.deactivateBtn : t.schools.activateBtn}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* If SCHOOL_ADMIN, render simplified single card */}
      {user?.role === UserRole.SCHOOL_ADMIN && (
        <div className="max-w-2xl mx-auto py-8">
          <div className="flex items-center justify-center gap-4 mb-8 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow shrink-0">
              <Building2 size={24} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
                {language === "es" ? "Mi Institución" : "My Institution"}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                {language === "es"
                  ? "Gestiona el estado de módulos y el personal asignado a tu unidad escolar."
                  : "Manage module status and staff assigned to your school unit."}
              </p>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : error || schools.length === 0 ? (
            <div className="glass-panel p-8 text-center space-y-4 border-red-500/20">
              <p className="text-red-400 text-sm font-semibold">{error || (language === "es" ? "No se pudo cargar la información de la escuela" : "Failed to load school information")}</p>
              <button onClick={fetchSchools} className="glass-button text-xs py-1.5 px-3">
                Retry
              </button>
            </div>
          ) : (
            (() => {
              const mySchool = schools[0];
              return (
                <div className="glass-panel p-8 border border-[var(--border-glass)] hover:border-[var(--accent-primary-light)]/20 transition-all duration-300 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-primary)] shadow-glow">
                      {mySchool.logoUrl ? (
                        <img
                          src={mySchool.logoUrl}
                          alt={mySchool.name}
                          className="w-full h-full object-cover rounded-3xl"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Building2 size={40} />
                      )}
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                        {mySchool.name}
                      </h2>
                      <p className="text-sm font-mono text-[var(--text-muted)] tracking-wider">
                        {language === "es" ? "Código" : "Code"}: {mySchool.code}
                      </p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{t.schools.status.active}</span>
                      </div>
                    </div>

                    <div className="border-t border-[var(--border-glass)] w-full pt-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
                      <button
                        onClick={() => handleOpenDetails(mySchool)}
                        className="glass-button py-2.5 px-8 text-sm flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <Eye size={16} />
                        <span>{language === "es" ? "Administrar Escuela" : "Manage School"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Modal - Create/Edit School */}
      {isSchoolModalOpen && (
        <SchoolFormModal
          mode={schoolModalMode}
          t={t}
          error={schoolFormError}
          submitting={schoolSubmitting}
          name={schoolName}
          code={schoolCode}
          address={schoolAddress}
          phone={schoolPhone}
          email={schoolEmail}
          logoUrl={schoolLogoUrl}
          isIndependentTeacher={isIndependentTeacher}
          onNameChange={setSchoolName}
          onCodeChange={setSchoolCode}
          onAddressChange={setSchoolAddress}
          onPhoneChange={setSchoolPhone}
          onEmailChange={setSchoolEmail}
          onLogoUrlChange={setSchoolLogoUrl}
          onIndependentTeacherChange={setIsIndependentTeacher}
          onClose={() => setIsSchoolModalOpen(false)}
          onSubmit={handleSchoolSubmit}
        />
      )}

      {/* Modal - School Detailed View (Tabs: General, Modules, Users) */}
      {isDetailModalOpen && detailSchool && (
        <SchoolDetailModal
          school={detailSchool}
          tab={detailTab}
          modules={modules}
          modulesLoading={modulesLoading}
          modulesError={modulesError}
          users={users}
          usersLoading={usersLoading}
          usersError={usersError}
          actionLoadingId={actionLoadingId}
          canManageModules={user?.role === UserRole.SUPER_ADMIN}
          t={t}
          onClose={() => setIsDetailModalOpen(false)}
          onTabChange={setDetailTab}
          onToggleModule={handleToggleModule}
          onAddUser={handleOpenAddUser}
          onEditUser={handleOpenEditUser}
          onToggleUserActive={handleToggleUserActive}
        />
      )}

      {/* Modal - Create/Edit User */}
      {isUserModalOpen && detailSchool && (
        <SchoolUserFormModal
          mode={userModalMode}
          t={t}
          error={userFormError}
          submitting={userSubmitting}
          firstName={userFirstName}
          lastName={userLastName}
          email={userEmail}
          password={userPassword}
          phone={userPhone}
          position={userPosition}
          active={userActive}
          onFirstNameChange={setUserFirstName}
          onLastNameChange={setUserLastName}
          onEmailChange={setUserEmail}
          onPasswordChange={setUserPassword}
          onPhoneChange={setUserPhone}
          onPositionChange={setUserPosition}
          onActiveChange={setUserActive}
          onClose={() => setIsUserModalOpen(false)}
          onSubmit={handleUserSubmit}
        />
      )}
      </div>
    </ModuleGuard>
  );
}
