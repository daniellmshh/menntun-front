"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldAlert,
  Loader2,
  Check,
  X,
  Phone,
  Mail,
  RefreshCw,
  Eye,
  MapPin,
  Calendar,
  Layers,
  Award,
  GraduationCap,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";
import ModuleGuard from "@/components/shared/ModuleGuard";
import Loader from "@/components/shared/Loader";
import api from "@/lib/api/axios";
import { ApiResponse, UserRole } from "@/types";
import type { SchoolOption, Student, StudentGroup } from "../types";
import StudentFormModal from "./StudentFormModal";

export default function StudentsPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  // List states
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("");
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("");

  // Create/Edit Form Modal states
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<"create" | "edit">("create");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentSchoolId, setStudentSchoolId] = useState("");
  const [studentEnrollmentNumber, setStudentEnrollmentNumber] = useState("");
  const [studentBirthDate, setStudentBirthDate] = useState("");
  const [studentGender, setStudentGender] = useState("");
  const [studentBloodType, setStudentBloodType] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [studentGroupId, setStudentGroupId] = useState("");

  // Details Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [detailTab, setDetailTab] = useState<"general" | "enrollments">("general");

  // Delete states
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SCHOOL_ADMIN;

  // Load students list
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = "/students";
      const params: string[] = [];
      if (user?.role === UserRole.SUPER_ADMIN && selectedSchoolFilter) {
        params.push(`schoolId=${selectedSchoolFilter}`);
      }
      if (params.length > 0) {
        endpoint += `?${params.join("&")}`;
      }

      const response = await api.get<ApiResponse<Student[]>>(endpoint);
      setStudents(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(t.students?.alerts?.errorFetch || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  // Load groups (filtered by school if Super Admin)
  const fetchGroups = async () => {
    try {
      let endpoint = "/academic/groups";
      const params: string[] = [];
      if (user?.role === UserRole.SUPER_ADMIN && selectedSchoolFilter) {
        params.push(`schoolId=${selectedSchoolFilter}`);
      }
      if (params.length > 0) {
        endpoint += `?${params.join("&")}`;
      }

      const response = await api.get<ApiResponse<StudentGroup[]>>(endpoint);
      setGroups(response.data.data || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  // Load schools list (SUPER_ADMIN only)
  const fetchSchools = async () => {
    if (user?.role !== UserRole.SUPER_ADMIN) return;
    try {
      const response = await api.get<ApiResponse<SchoolOption[]>>("/schools");
      setSchools(response.data.data || []);
    } catch (err) {
      console.error("Error fetching schools list:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchGroups();
      fetchSchools();
    }
  }, [user, selectedSchoolFilter]);

  // Load detailed student data
  const fetchStudentDetails = async (studentId: string) => {
    try {
      const response = await api.get<ApiResponse<Student>>(`/students/${studentId}`);
      setDetailStudent(response.data.data);
    } catch (err) {
      console.error("Error loading student details:", err);
    }
  };

  const handleOpenDetails = (student: Student) => {
    setDetailStudent(student);
    setDetailTab("general");
    setIsDetailModalOpen(true);
    fetchStudentDetails(student.id);
  };

  const handleOpenCreateForm = () => {
    setFormModalMode("create");
    setSelectedStudent(null);
    setStudentEmail("");
    setStudentPassword("");
    setStudentFirstName("");
    setStudentLastName("");
    setStudentPhone("");
    setStudentSchoolId(user?.role === UserRole.SCHOOL_ADMIN ? (user.schoolId || "") : "");
    setStudentEnrollmentNumber("");
    setStudentBirthDate("");
    setStudentGender("");
    setStudentBloodType("");
    setStudentAddress("");
    setStudentGroupId("");
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (student: Student) => {
    setFormModalMode("edit");
    setSelectedStudent(student);
    setStudentEmail(student.email);
    setStudentPassword("");
    setStudentFirstName(student.firstName);
    setStudentLastName(student.lastName);
    setStudentPhone(student.phone || "");
    setStudentSchoolId(student.schoolId);
    setStudentEnrollmentNumber(student.studentProfile?.enrollmentNumber || "");
    
    let formattedDate = "";
    if (student.studentProfile?.birthDate) {
      formattedDate = new Date(student.studentProfile.birthDate).toISOString().split("T")[0];
    }
    setStudentBirthDate(formattedDate);
    setStudentGender(student.studentProfile?.gender || "");
    setStudentBloodType(student.studentProfile?.bloodType || "");
    setStudentAddress(student.studentProfile?.address || "");

    // Find active group assignment if any
    const activeEnrollment = student.studentProfile?.enrollments?.find(
      (e) => e.status === "ACTIVE"
    );
    setStudentGroupId(activeEnrollment?.group?.id || "");
    
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFirstName.trim() || !studentLastName.trim() || !studentEmail.trim()) {
      setFormError(t.login.errorFields);
      return;
    }
    if (formModalMode === "create" && !studentPassword.trim()) {
      setFormError(t.login.errorFields);
      return;
    }
    if (user?.role === UserRole.SUPER_ADMIN && !studentSchoolId) {
      setFormError("Please select a school");
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError(null);

      const payload = {
        email: studentEmail,
        firstName: studentFirstName,
        lastName: studentLastName,
        phone: studentPhone || undefined,
        enrollmentNumber: studentEnrollmentNumber || undefined,
        birthDate: studentBirthDate || undefined,
        gender: studentGender || undefined,
        bloodType: studentBloodType || undefined,
        address: studentAddress || undefined,
        groupId: studentGroupId || undefined,
        ...(formModalMode === "create" ? { password: studentPassword, schoolId: studentSchoolId } : {}),
      };

      if (formModalMode === "create") {
        await api.post("/students", payload);
      } else if (selectedStudent) {
        const { email: _, ...updatePayload } = payload as any;
        await api.patch(`/students/${selectedStudent.id}`, updatePayload);
      }

      setIsFormModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      console.error("Form submit error:", err);
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      setFormError(
        backendMessage ||
        (formModalMode === "create" ? t.students?.alerts?.errorCreate : t.students?.alerts?.errorUpdate) ||
        "Error submitting form"
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle active/inactive state
  const handleToggleActive = async (student: Student) => {
    try {
      setActionLoadingId(student.id);
      // Optimistic update
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, active: !s.active } : s))
      );

      await api.patch(`/students/${student.id}`, { active: !student.active });
      
      // Background reload
      const response = await api.get<ApiResponse<Student[]>>("/students");
      setStudents(response.data.data || []);
    } catch (err) {
      console.error("Error toggling active state:", err);
      // Revert
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, active: student.active } : s))
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm(language === "es" ? "¿Estás seguro de que deseas eliminar este alumno? Esta acción no se puede deshacer." : "Are you sure you want to delete this student? This action cannot be undone.")) return;

    try {
      setIsDeletingId(studentId);
      await api.delete(`/students/${studentId}`);
      fetchStudents();
    } catch (err: any) {
      console.error("Error deleting student:", err);
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      alert(backendMessage || t.students?.alerts?.errorDelete || "Failed to delete student");
    } finally {
      setIsDeletingId(null);
    }
  };

  // Search and group filter logic
  const filteredStudents = students.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(query) ||
      s.email.toLowerCase().includes(query) ||
      (s.studentProfile?.enrollmentNumber && s.studentProfile.enrollmentNumber.toLowerCase().includes(query));

    const activeEnrollment = s.studentProfile?.enrollments?.find((e) => e.status === "ACTIVE");
    const matchesGroup = selectedGroupFilter ? activeEnrollment?.group?.id === selectedGroupFilter : true;

    return matchesSearch && matchesGroup;
  });

  if (authLoading) {
    return (
      <div className="flex-1 p-8">
        <Loader minHeight="400px" />
      </div>
    );
  }

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
              Please log in to view this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ModuleGuard moduleKey="students" requireSchoolContext={true}>
      <div className="space-y-8 animate-fade-in">
        {/* Header section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow shrink-0">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
              {t.students?.title || "Students Directory"}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-0.5 max-w-2xl">
              {t.students?.subtitle || "Manage student profiles, enrollments, and details."}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreateForm}
            className="glass-button flex items-center gap-2 text-sm shrink-0"
          >
            <Plus size={16} />
            <span>{t.students?.registerBtn || "Register Student"}</span>
          </button>
        )}
      </div>

      {/* Toolbar panel */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
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

          {/* Group Filter */}
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="glass-input h-[42px] bg-[var(--bg-surface)] text-sm w-full sm:w-[180px]"
          >
            <option value="">{language === "es" ? "Todos los grupos" : "All groups"}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.grade?.name} {g.name} ({g.schoolYear?.name})
              </option>
            ))}
          </select>

          {/* School filter (SUPER_ADMIN only) */}
          {user?.role === UserRole.SUPER_ADMIN && (
            <select
              value={selectedSchoolFilter}
              onChange={(e) => {
                setSelectedSchoolFilter(e.target.value);
                setSelectedGroupFilter(""); // Clear group filter since groups belong to school
              }}
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

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => {
              fetchStudents();
              fetchGroups();
            }}
            className="w-[42px] h-[42px] rounded-lg border border-[var(--border-glass)] bg-white/[0.03] flex items-center justify-center cursor-pointer transition-all hover:bg-white/[0.08]"
            title="Refresh List"
          >
            <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
          </button>
          <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide bg-black/10 px-3 py-1.5 rounded-lg border border-[var(--border-glass)]">
            Total: {filteredStudents.length}
          </span>
        </div>
      </div>

      {/* Main Table view */}
      {loading && students.length === 0 ? (
        <Loader />
      ) : error ? (
        <div className="glass-panel p-8 text-center space-y-4 border-red-500/20">
          <p className="text-red-400 text-sm font-semibold">{error}</p>
          <button onClick={fetchStudents} className="glass-button-secondary text-xs">
            Try Again
          </button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-panel p-12 text-center text-[var(--text-secondary)] text-sm border-dashed border-[var(--border-glass)]">
          {t.students?.noData || "No students found."}
        </div>
      ) : (
        <div className="glass-panel overflow-hidden border border-[var(--border-glass)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-glass)] bg-white/[0.01]">
                  <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {t.students?.table?.name || "Full Name"}
                  </th>
                  <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">
                    {t.students?.table?.email || "Email Address"}
                  </th>
                  {user?.role === UserRole.SUPER_ADMIN && (
                    <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {t.teachers?.details?.schoolName || "School"}
                    </th>
                  )}
                  <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[140px] hidden sm:table-cell">
                    {t.students?.table?.enrollmentNumber || "Matrícula"}
                  </th>
                  <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[160px] hidden md:table-cell">
                    {t.students?.table?.group || "Group"}
                  </th>
                  <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[120px] text-center">
                    {t.students?.table?.status || "Status"}
                  </th>
                  <th className="p-4 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[180px] text-right">
                    {t.students?.table?.actions || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((student) => {
                  const activeEnrollment = student.studentProfile?.enrollments?.find(
                    (e) => e.status === "ACTIVE"
                  );
                  return (
                    <tr key={student.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-primary)] shrink-0 font-bold uppercase">
                            {student.firstName[0] || ""}{student.lastName[0] || ""}
                          </div>
                          <div>
                            <span className="font-semibold text-sm text-[var(--text-primary)] block">
                              {student.firstName} {student.lastName}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] md:hidden">
                              {student.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-[var(--text-secondary)] font-mono hidden md:table-cell">
                        {student.email}
                      </td>
                      {user?.role === UserRole.SUPER_ADMIN && (
                        <td className="p-4 text-xs font-semibold text-[var(--text-primary)]">
                          {student.school?.name || student.schoolId}
                        </td>
                      )}
                      <td className="p-4 text-xs font-mono text-[var(--text-secondary)] hidden sm:table-cell">
                        {student.studentProfile?.enrollmentNumber || "—"}
                      </td>
                      <td className="p-4 text-xs text-[var(--text-secondary)] truncate max-w-[150px] hidden md:table-cell">
                        {activeEnrollment ? (
                          <span className="inline-flex items-center gap-1 text-[var(--text-primary)] bg-[hsla(263,90%,60%,0.08)] px-2.5 py-1 rounded-lg border border-[hsla(263,90%,65%,0.12)]">
                            <Layers size={12} className="text-[var(--accent-primary)]" />
                            {activeEnrollment.group?.grade?.name} {activeEnrollment.group?.name}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] italic">
                            {language === "es" ? "Sin grupo asignado" : "No group assigned"}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold select-none border
                            ${
                              student.active
                                ? "bg-emerald-500/10 text-[var(--accent-success)] border-emerald-500/20"
                                : "bg-rose-500/10 text-[var(--accent-danger)] border-rose-500/20"
                            }
                          `}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${student.active ? "bg-[var(--accent-success)] animate-pulse" : "bg-[var(--accent-danger)]"}`} />
                          {student.active ? t.schools?.status?.active || "Active" : t.schools?.status?.inactive || "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetails(student)}
                            className="p-2 rounded-lg border border-[var(--border-glass)] bg-white/[0.02] hover:bg-white/[0.08] hover:border-[var(--accent-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                            title={t.schools?.tabs?.details || "Details"}
                          >
                            <Eye size={14} />
                          </button>
                          
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEditForm(student)}
                                className="p-2 rounded-lg border border-[var(--border-glass)] bg-white/[0.02] hover:bg-white/[0.08] hover:border-[var(--accent-primary-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                                title={t.schools?.editBtn || "Edit"}
                              >
                                <Edit2 size={14} />
                              </button>
                              
                              <button
                                onClick={() => handleToggleActive(student)}
                                disabled={actionLoadingId === student.id}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all disabled:opacity-50
                                  ${
                                    student.active
                                      ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-[var(--accent-danger)]"
                                      : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-[var(--accent-success)]"
                                  }
                                `}
                              >
                                {actionLoadingId === student.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : student.active ? (
                                  <X size={12} />
                                ) : (
                                  <Check size={12} />
                                )}
                                <span>
                                  {student.active ? t.schools?.deactivateBtn || "Deactivate" : t.schools?.activateBtn || "Activate"}
                                </span>
                              </button>

                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                disabled={isDeletingId === student.id}
                                className="p-2 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer disabled:opacity-50"
                                title={language === "es" ? "Eliminar" : "Delete"}
                              >
                                {isDeletingId === student.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Create/Edit Student */}
      {mounted && isFormModalOpen && (
        <StudentFormModal
          mode={formModalMode}
          t={t}
          error={formError}
          submitting={formSubmitting}
          canSelectSchool={user?.role === UserRole.SUPER_ADMIN}
          schools={schools}
          groups={groups}
          email={studentEmail}
          password={studentPassword}
          firstName={studentFirstName}
          lastName={studentLastName}
          phone={studentPhone}
          schoolId={studentSchoolId}
          enrollmentNumber={studentEnrollmentNumber}
          birthDate={studentBirthDate}
          gender={studentGender}
          bloodType={studentBloodType}
          address={studentAddress}
          groupId={studentGroupId}
          onEmailChange={setStudentEmail}
          onPasswordChange={setStudentPassword}
          onFirstNameChange={setStudentFirstName}
          onLastNameChange={setStudentLastName}
          onPhoneChange={setStudentPhone}
          onSchoolIdChange={setStudentSchoolId}
          onEnrollmentNumberChange={setStudentEnrollmentNumber}
          onBirthDateChange={setStudentBirthDate}
          onGenderChange={setStudentGender}
          onBloodTypeChange={setStudentBloodType}
          onAddressChange={setStudentAddress}
          onGroupIdChange={setStudentGroupId}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Modal - Student Detailed View */}
      {mounted && isDetailModalOpen && detailStudent && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
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
                {detailStudent.firstName[0] || ""}{detailStudent.lastName[0] || ""}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  {detailStudent.firstName} {detailStudent.lastName}
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {t.students?.details?.role || "Role"}: {t.schools?.users?.roles?.STUDENT || "STUDENT"} | {t.students?.details?.schoolName || "Institution"}: {detailStudent.school?.name || detailStudent.schoolId}
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
                {t.students?.details?.generalInfo || "General Profile"}
              </button>
              <button
                onClick={() => setDetailTab("enrollments")}
                className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer
                  ${detailTab === "enrollments" ? "border-[var(--accent-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
                `}
              >
                {t.students?.details?.enrollments || "Enrollments"}
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
                          <span className="text-xs text-[var(--text-muted)] block">{t.students?.table?.email || "Email Address"}</span>
                          <span className="text-sm text-[var(--text-primary)] font-mono">{detailStudent.email}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-[var(--text-muted)] block">{t.students?.table?.phone || "Phone"}</span>
                          <span className="text-sm text-[var(--text-primary)]">{detailStudent.phone || "—"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-[var(--text-muted)] block">{t.students?.modal?.addressLabel || "Address"}</span>
                          <span className="text-sm text-[var(--text-primary)]">{detailStudent.studentProfile?.address || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {language === "es" ? "Detalles del Estudiante" : "Student Details"}
                    </h3>
                    <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-[var(--border-glass)]">
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.students?.modal?.enrollmentNumberLabel || "Matrícula"}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)] font-mono">
                          {detailStudent.studentProfile?.enrollmentNumber || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.students?.modal?.birthDateLabel || "Birth Date"}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)] font-mono">
                          {detailStudent.studentProfile?.birthDate
                            ? new Date(detailStudent.studentProfile.birthDate).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.students?.modal?.genderLabel || "Gender"}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {detailStudent.studentProfile?.gender || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.students?.modal?.bloodTypeLabel || "Blood Type"}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)] font-mono">
                          {detailStudent.studentProfile?.bloodType || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.students?.modal?.statusLabel || "Status"}</span>
                        <span className={`text-xs font-bold ${detailStudent.active ? "text-[var(--accent-success)]" : "text-[var(--accent-danger)]"}`}>
                          {detailStudent.active ? (t.schools?.status?.active || "Active") : (t.schools?.status?.inactive || "Inactive")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Enrollments */}
              {detailTab === "enrollments" && (
                <div className="space-y-4 py-2">
                  <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {t.students?.details?.enrollments || "Enrollments History"}
                  </h3>
                  
                  {!detailStudent.studentProfile?.enrollments || detailStudent.studentProfile.enrollments.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--text-muted)] italic bg-black/10 rounded-xl border border-[var(--border-glass)]">
                      {t.students?.details?.noEnrollments || "No active group enrollments."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detailStudent.studentProfile.enrollments.map((enr) => (
                        <div
                          key={enr.id}
                          className="flex items-center justify-between p-4 bg-black/15 border border-[var(--border-glass)] rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 border border-[hsla(263,90%,65%,0.15)] flex items-center justify-center text-[var(--accent-primary)]">
                              <Layers size={18} />
                            </div>
                            <div>
                              <span className="font-semibold text-sm text-[var(--text-primary)] block">
                                {enr.group?.grade?.name} {enr.group?.name}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {language === "es" ? "Ciclo: " : "Cycle: "} {enr.group?.schoolYear?.name}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider mb-1
                                ${
                                  enr.status === "ACTIVE"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-[var(--accent-success)]"
                                    : "bg-white/5 border-white/10 text-[var(--text-secondary)]"
                                }
                              `}
                            >
                              {enr.status}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] block">
                              {t.students?.details?.enrolledAt || "Enrolled"}: {new Date(enr.enrolledAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      </div>
    </ModuleGuard>
  );
}
