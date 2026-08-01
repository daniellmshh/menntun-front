"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import ModuleGuard from "@/components/shared/ModuleGuard";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal";
import { translations } from "@/lib/translations";
import { ApiResponse, UserRole } from "@/types";
import GroupAlertBanner from "@/modules/academic/components/GroupAlertBanner";
import GroupDetailDrawer from "@/modules/academic/components/GroupDetailDrawer";
import GroupsListSection from "@/modules/academic/components/GroupsListSection";
import GroupModal from "@/modules/academic/components/GroupModal";
import type {
  AcademicGroup,
  Grade,
  School,
  SchoolYear,
} from "@/modules/academic/types";

function getApiError(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("response" in error)) return undefined;
  const response = error.response;
  if (!response || typeof response !== "object" || !("data" in response)) return undefined;
  const data = response.data;
  if (!data || typeof data !== "object") return undefined;
  const { error: apiError } = data as { error?: unknown };
  return typeof apiError === "string" ? apiError : undefined;
}


// ─── MAIN PAGE ──────────────────────────────────────────────────────

export default function GroupsPage() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language].groups;

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const canManage =
    user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SCHOOL_ADMIN;

  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSchoolId, setFilterSchoolId] = useState("");
  const [filterGradeId, setFilterGradeId] = useState("");
  const [filterYearId, setFilterYearId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editGroup, setEditGroup] = useState<AcademicGroup | null>(null);
  const [detailGroup, setDetailGroup] = useState<AcademicGroup | null>(null);
  const [alert, setAlert] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AcademicGroup | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const showAlert = useCallback((msg: string, type: "success" | "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  }, []);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isSuperAdmin ? "/academic/groups/all" : "/academic/groups";
      const res = await api.get<ApiResponse<AcademicGroup[]>>(endpoint);
      setGroups(res.data.data || []);
    } catch {
      showAlert(t.alerts.errorFetch, "error");
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, t.alerts.errorFetch, showAlert]);

  const fetchCatalogs = useCallback(async () => {
    try {
      if (isSuperAdmin) {
        const schoolsRes = await api.get<ApiResponse<School[]>>("/schools");
        setSchools(schoolsRes.data.data || []);

        const yearsRes = await api.get<ApiResponse<SchoolYear[]>>("/academic/school-years/all");
        setSchoolYears(yearsRes.data.data || []);

        const gradesRes = await api.get<ApiResponse<Grade[]>>("/academic/grades/all");
        setGrades(gradesRes.data.data || []);
      } else {
        const yearsRes = await api.get<ApiResponse<SchoolYear[]>>("/academic/school-years");
        setSchoolYears(yearsRes.data.data || []);

        const gradesRes = await api.get<ApiResponse<Grade[]>>("/academic/grades");
        setGrades(gradesRes.data.data || []);
      }
    } catch {}
  }, [isSuperAdmin]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchGroups();
      void fetchCatalogs();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchGroups, fetchCatalogs]);

  const handleDeleteClick = (group: AcademicGroup) => {
    if (group._count && group._count.enrollments > 0) {
      showAlert("No se puede eliminar el grupo porque tiene alumnos inscritos.", "error");
      return;
    }
    setDeleteTarget(group);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/academic/groups/${deleteTarget.id}`);
      setGroups((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      showAlert(t.alerts.successDelete, "success");
      setDeleteTarget(null);
    } catch (error) {
      showAlert(getApiError(error) || t.alerts.errorDelete, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaved = (saved: AcademicGroup) => {
    setGroups((prev) => {
      const idx = prev.findIndex((g) => g.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setShowModal(false);
    setEditGroup(null);
    showAlert(editGroup ? t.alerts.successUpdate : t.alerts.successCreate, "success");
  };

  return (
    <ModuleGuard moduleKey="academic" requireSchoolContext={true}>
      <div className="flex flex-col h-full space-y-6">
        {/* Alert Banner */}
        {alert && (
          <GroupAlertBanner message={alert.msg} type={alert.type} onClose={() => setAlert(null)} />
        )}

        <GroupsListSection
          groups={groups}
          schools={schools}
          grades={grades}
          schoolYears={schoolYears}
          loading={loading}
          search={search}
          filterSchoolId={filterSchoolId}
          filterGradeId={filterGradeId}
          filterYearId={filterYearId}
          isSuperAdmin={isSuperAdmin}
          canManage={canManage}
          translations={t}
          onSearchChange={setSearch}
          onSchoolFilterChange={(schoolId) => {
            setFilterSchoolId(schoolId);
            setFilterGradeId("");
            setFilterYearId("");
          }}
          onGradeFilterChange={setFilterGradeId}
          onYearFilterChange={setFilterYearId}
          onCreate={() => {
            setEditGroup(null);
            setShowModal(true);
          }}
          onEdit={(group) => {
            setEditGroup(group);
            setShowModal(true);
          }}
          onDetail={setDetailGroup}
          onDelete={handleDeleteClick}
        />

      {/* Create / Edit Modal */}
      {/* Delete Confirmation Modal */}
      {deleteTarget && createPortal(
        <ConfirmDeleteModal
          title="Eliminar Grupo"
          description={
            <>
              ¿Estás seguro de que deseas eliminar el grupo <strong className="text-[var(--text-primary)]">&quot;{deleteTarget.name}&quot;</strong>?
            </>
          }
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          isLoading={deleteLoading}
        />
      , document.body)}

      {showModal && (
        <GroupModal
          group={editGroup}
          schools={schools}
          grades={grades}
          schoolYears={schoolYears}
          isSuperAdmin={isSuperAdmin}
          currentSchoolId={user?.schoolId || ""}
          onClose={() => {
            setShowModal(false);
            setEditGroup(null);
          }}
          onSaved={handleSaved}
          translations={t}
        />
      )}

      {/* Detail Drawer */}
      {detailGroup && (
        <GroupDetailDrawer
          group={detailGroup}
          onClose={() => {
            setDetailGroup(null);
            fetchGroups(); // refresh groups to sync count updates
          }}
          t={t}
        />
      )}
      </div>
    </ModuleGuard>
  );
}
