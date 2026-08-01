"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SchoolFormModal from "./SchoolFormModal";
import SchoolUserFormModal, { type SchoolUserPosition } from "./SchoolUserFormModal";
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
  UserPlus,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  UserX,
  User,
} from "lucide-react";
import ModuleGuard from "@/components/shared/ModuleGuard";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import Loader from "@/components/shared/Loader";
import { translations } from "@/lib/translations";
import api from "@/lib/api/axios";
import { ApiResponse, UserRole } from "@/types";

interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    users: number;
  };
}

interface SchoolModule {
  module: string;
  active: boolean;
  isCore: boolean;
}

interface SchoolUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  active: boolean;
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
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
  const [detailTab, setDetailTab] = useState<"general" | "modules" | "users">("general");

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
  const fetchSchools = async () => {
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
    } catch (err: any) {
      console.error("Error fetching schools:", err);
      setError(t.schools.alerts.errorFetch);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SCHOOL_ADMIN) {
      fetchSchools();
    }
  }, [user]);

  // Load modules details
  const fetchModules = async (schoolId: string) => {
    try {
      setModulesLoading(true);
      setModulesError(null);
      const response = await api.get<ApiResponse<SchoolModule[]>>(`/schools/${schoolId}/modules`);
      setModules(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching school modules:", err);
      setModulesError(t.schools.modules.errorToggle);
    } finally {
      setModulesLoading(false);
    }
  };

  // Load school users
  const fetchUsers = async (schoolId: string) => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const response = await api.get<ApiResponse<SchoolUser[]>>(`/schools/${schoolId}/users`);
      setUsers(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching school users:", err);
      setUsersError(t.schools.users.errorFetch);
    } finally {
      setUsersLoading(false);
    }
  };

  // Handle Tab Switch
  useEffect(() => {
    if (detailSchool) {
      if (detailTab === "modules") {
        fetchModules(detailSchool.id);
      } else if (detailTab === "users") {
        fetchUsers(detailSchool.id);
      }
    }
  }, [detailTab, detailSchool]);

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
        const { code: _, ...updatePayload } = payload;
        await api.patch(`/schools/${selectedSchool.id}`, updatePayload);
      }

      setIsSchoolModalOpen(false);
      fetchSchools();
    } catch (err: any) {
      console.error("School form submit error:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
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
    } catch (err: any) {
      console.error("User form submit error:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
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
      {mounted && isSchoolModalOpen && (
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
      {mounted && isDetailModalOpen && detailSchool && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-3xl w-full p-6 border border-[var(--border-glass)] relative flex flex-col max-h-[85vh] overflow-hidden animate-scale-up">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            {/* School Title in Modal */}
            <div className="flex items-center gap-4 border-b border-[var(--border-glass)] pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
                {detailSchool.logoUrl ? (
                  <img
                    src={detailSchool.logoUrl}
                    alt={detailSchool.name}
                    className="w-full h-full object-cover rounded-2xl"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Building2 size={24} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{detailSchool.name}</h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">Code: {detailSchool.code} | ID: {detailSchool.id}</p>
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
                {t.schools.tabs.details}
              </button>
              <button
                onClick={() => setDetailTab("modules")}
                className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer
                  ${detailTab === "modules" ? "border-[var(--accent-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
                `}
              >
                {t.schools.tabs.modules}
              </button>
              <button
                onClick={() => setDetailTab("users")}
                className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer
                  ${detailTab === "users" ? "border-[var(--accent-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
                `}
              >
                {t.schools.tabs.users}
              </button>
            </div>

            {/* Tab content area (scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-6 custom-scrollbar" style={{ minHeight: "300px" }}>
              {/* TAB 1: General Details */}
              {detailTab === "general" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.schools.details.contactLocation}</h3>
                    <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-[var(--border-glass)]">
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-[var(--text-muted)] block">{t.schools.details.address}</span>
                          <span className="text-sm text-[var(--text-primary)]">{detailSchool.address || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-[var(--text-muted)] block">{t.schools.details.phone}</span>
                          <span className="text-sm text-[var(--text-primary)]">{detailSchool.phone || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-[var(--text-muted)] block">{t.schools.details.email}</span>
                          <span className="text-sm text-[var(--text-primary)]">{detailSchool.email || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.schools.details.accountInfo}</h3>
                    <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-[var(--border-glass)]">
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.schools.details.activeStatus}</span>
                        <span className={`text-xs font-bold ${detailSchool.active ? "text-[var(--accent-success)]" : "text-[var(--accent-danger)]"}`}>
                          {detailSchool.active ? t.schools.status.active : t.schools.status.inactive}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.schools.details.registeredUsers}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {detailSchool._count?.users ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.schools.details.createdAt}</span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          {detailSchool.createdAt ? new Date(detailSchool.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Modules activation */}
              {detailTab === "modules" && (
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">{t.schools.modules.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{t.schools.modules.subtitle}</p>
                  </div>

                  {modulesLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
                    </div>
                  ) : modulesError ? (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                      {modulesError}
                    </div>
                  ) : (
                    <div className="glass-panel overflow-hidden border border-[var(--border-glass)]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--border-glass)] bg-white/[0.01]">
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.schools.modules.colName}</th>
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[120px]">{t.schools.modules.colType}</th>
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[150px] text-right">{t.schools.modules.colStatus}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {modules.map((m) => {
                            const sidebarKey = (
                              m.module === "schoolYears" ? "schoolYears" :
                              m.module === "gradesCatalog" ? "gradesCatalog" :
                              m.module.toLowerCase()
                            ) as keyof typeof t.sidebar;
                            return (
                            <tr key={m.module} className="hover:bg-white/[0.01]">
                              <td className="p-3">
                                <span className="font-semibold text-sm capitalize">
                                  {t.sidebar[sidebarKey] || m.module}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${m.isCore ? "bg-purple-500/15 border-purple-500/30 text-purple-300" : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"}`}>
                                  {m.isCore ? t.schools.modules.core : t.schools.modules.optional}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex justify-end items-center">
                                  {m.isCore ? (
                                    <span className="text-xs text-[var(--text-muted)] italic">
                                      {t.schools.modules.coreActive}
                                    </span>
                                  ) : user?.role === UserRole.SUPER_ADMIN ? (
                                    <button
                                      onClick={() => handleToggleModule(m.module, m.active)}
                                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                                    >
                                      {m.active ? (
                                        <ToggleRight size={32} className="text-[var(--accent-success)]" />
                                      ) : (
                                        <ToggleLeft size={32} className="text-[var(--text-muted)]" />
                                      )}
                                    </button>
                                  ) : (
                                    <div className="text-[var(--text-secondary)] opacity-50 cursor-not-allowed" title="Solo el Super Admin puede modificar módulos">
                                      {m.active ? (
                                        <ToggleRight size={32} className="text-[var(--accent-success)]" />
                                      ) : (
                                        <ToggleLeft size={32} className="text-[var(--text-muted)]" />
                                      )}
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

              {/* TAB 3: User Assignment / Management */}
              {detailTab === "users" && (
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-lg font-bold">{t.schools.users.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)]">{t.schools.users.subtitle}</p>
                    </div>
                    <button
                      onClick={handleOpenAddUser}
                      className="glass-button flex items-center gap-1 text-xs py-2 px-4"
                    >
                      <UserPlus size={14} />
                      <span>{t.schools.users.addBtn}</span>
                    </button>
                  </div>

                  {usersLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
                    </div>
                  ) : usersError ? (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                      {usersError}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="glass-panel p-10 text-center text-[var(--text-secondary)] text-sm border-dashed border-[var(--border-glass)]">
                      {t.schools.users.noUsers}
                    </div>
                  ) : (
                    <div className="glass-panel overflow-hidden border border-[var(--border-glass)]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--border-glass)] bg-white/[0.01]">
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.schools.users.table.name}</th>
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.schools.users.table.email}</th>
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.schools.users.table.role}</th>
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[100px] text-center">{t.schools.users.table.status}</th>
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[120px] text-right">{t.schools.users.table.actions}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-white/[0.01]">
                              <td className="p-3">
                                <span className="font-semibold text-sm">{u.firstName} {u.lastName}</span>
                              </td>
                              <td className="p-3 text-xs text-[var(--text-secondary)] font-mono">{u.email}</td>
                              <td className="p-3">
                                <span className="text-xs text-[var(--text-primary)] font-medium">
                                  {u.role === UserRole.SUPER_ADMIN
                                    ? t.schools.users.roles.SUPER_ADMIN
                                    : u.role === UserRole.TEACHER
                                    ? t.schools.users.roles.TEACHER
                                    : t.schools.users.roles.SCHOOL_ADMIN}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${u.active ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                                  {u.active ? t.schools.status.active : t.schools.status.inactive}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditUser(u)}
                                    className="p-1.5 rounded border border-[var(--border-glass)] bg-white/[0.02] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleToggleUserActive(u)}
                                    disabled={actionLoadingId === u.id}
                                    className={`p-1.5 rounded border cursor-pointer disabled:opacity-50
                                      ${u.active ? "bg-red-500/10 border-red-500/20 text-[var(--accent-danger)] hover:bg-red-500/20" : "bg-emerald-500/10 border-emerald-500/20 text-[var(--accent-success)] hover:bg-emerald-500/20"}
                                    `}
                                    title={u.active ? t.schools.deactivateBtn : t.schools.activateBtn}
                                  >
                                    {actionLoadingId === u.id ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : u.active ? (
                                      <UserX size={12} />
                                    ) : (
                                      <UserCheck size={12} />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal - Create/Edit User */}
      {mounted && isUserModalOpen && detailSchool && (
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
