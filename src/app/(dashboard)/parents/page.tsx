"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  Phone,
  Mail,
  Users,
  Briefcase,
  Link as LinkIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";
import ModuleGuard from "@/components/shared/ModuleGuard";
import Loader from "@/components/shared/Loader";
import api from "@/lib/api/axios";

interface ParentStudentLink {
  id: string;
  relationship: string;
  isPrimary: boolean;
  studentProfile: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface Parent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  active: boolean;
  parentProfile?: {
    id: string;
    occupation?: string;
    studentLinks: ParentStudentLink[];
  };
}

export default function ParentsPage() {
  const { language } = useLanguageStore();
  const t = translations[language];

  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    occupation: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Link Students Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [linkRelationship, setLinkRelationship] = useState("Madre");
  const [linkIsPrimary, setLinkIsPrimary] = useState(false);
  const [linkingStudentId, setLinkingStudentId] = useState<string | null>(null);

  const fetchParents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/parents");
      setParents(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const handleOpenForm = (parent?: Parent) => {
    setFormError(null);
    if (parent) {
      setFormModalMode("edit");
      setSelectedParent(parent);
      setFormData({
        firstName: parent.firstName,
        lastName: parent.lastName,
        email: parent.email,
        phone: parent.phone || "",
        occupation: parent.parentProfile?.occupation || "",
      });
    } else {
      setFormModalMode("create");
      setSelectedParent(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        occupation: "",
      });
    }
    setIsFormModalOpen(true);
  };

  const handleSaveParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (formModalMode === "create") {
        await api.post("/parents", formData);
      } else if (selectedParent) {
        await api.patch(`/parents/${selectedParent.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          occupation: formData.occupation,
        });
      }
      setIsFormModalOpen(false);
      fetchParents();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setFormError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Error al guardar el padre",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteParent = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este registro?")) return;
    try {
      await api.delete(`/parents/${id}`);
      fetchParents();
    } catch (err: any) {
      alert("Error al eliminar el padre");
    }
  };

  const fetchStudentsForLinking = async () => {
    try {
      setStudentsLoading(true);
      const params = new URLSearchParams();
      const activeSchool =
        useAuthStore.getState().user?.activeSchoolId ||
        useAuthStore.getState().user?.schoolId;
      if (activeSchool) {
        params.append("schoolId", activeSchool);
      }
      const res = await api.get(`/students?${params.toString()}`);
      setAvailableStudents(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleOpenLinkModal = (parent: Parent) => {
    setSelectedParent(parent);
    setStudentSearch("");
    setLinkRelationship("Madre");
    setLinkIsPrimary(false);
    setIsLinkModalOpen(true);
    fetchStudentsForLinking();
  };

  const handleLinkStudent = async (studentProfileId: string) => {
    if (!selectedParent) return;
    setLinkingStudentId(studentProfileId);
    try {
      await api.post(`/parents/${selectedParent.id}/students`, {
        studentProfileId,
        relationship: linkRelationship,
        isPrimary: linkIsPrimary,
      });
      setIsLinkModalOpen(false);
      fetchParents();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error al vincular alumno");
    } finally {
      setLinkingStudentId(null);
    }
  };

  const handleUnlinkStudent = async (
    parentId: string,
    studentProfileId: string,
  ) => {
    if (!confirm("¿Deseas desvincular a este alumno?")) return;
    try {
      await api.delete(`/parents/${parentId}/students/${studentProfileId}`);
      fetchParents();
    } catch (err) {
      alert("Error al desvincular");
    }
  };

  const filteredParents = parents.filter((p) => {
    const term = searchQuery.toLowerCase();
    return (
      p.firstName?.toLowerCase().includes(term) ||
      p.lastName?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term)
    );
  });

  const filteredAvailableStudents = availableStudents.filter((s) => {
    const term = studentSearch.toLowerCase();
    const fullName = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
    // Do not filter out already linked students here, we will disable them in the UI instead
    return fullName.includes(term) && s.studentProfile?.id;
  });

  if (loading) return <Loader />;

  return (
    <ModuleGuard moduleKey="parents">
      <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-[var(--bg-base)] relative">
        <div className="flex-1 p-8 pb-10 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow shrink-0">
                  <UserCheck size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
                    Padres y Tutores
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                    Gestiona los perfiles de los padres y sus alumnos
                    vinculados.
                  </p>
                </div>
              </div>
              <button onClick={() => handleOpenForm()} className="glass-button">
                <Plus size={20} />
                Nuevo Padre/Tutor
              </button>
            </div>

            <div className="glass-panel rounded-2xl border border-[var(--border-glass)] shadow-main">
              <div className="p-5 border-b border-[var(--border-glass)] flex items-center justify-between">
                <div className="relative max-w-sm w-full">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full !pl-10 glass-input"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-glass)] bg-white/[0.02]">
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Padre / Tutor
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Contacto
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Ocupación
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Alumnos Vinculados
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-12 text-center text-[var(--text-secondary)]"
                        >
                          No se encontraron padres o tutores.
                        </td>
                      </tr>
                    ) : (
                      filteredParents.map((parent) => (
                        <tr
                          key={parent.id}
                          className="border-b border-[var(--border-glass)] hover:bg-[var(--bg-surface)] transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-semibold text-[var(--text-primary)]">
                              {parent.firstName} {parent.lastName}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] mt-1 opacity-70 font-mono">
                              ID: {parent.id.substring(0, 8)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-[var(--text-secondary)] gap-2">
                                <Mail
                                  size={14}
                                  className="text-[var(--accent-primary)]"
                                />
                                {parent.email}
                              </div>
                              {parent.phone && (
                                <div className="flex items-center text-sm text-[var(--text-secondary)] gap-2">
                                  <Phone
                                    size={14}
                                    className="text-[var(--status-success)]"
                                  />
                                  {parent.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center text-sm text-[var(--text-secondary)] gap-2">
                              {parent.parentProfile?.occupation ? (
                                <>
                                  <Briefcase size={14} />
                                  {parent.parentProfile.occupation}
                                </>
                              ) : (
                                <span className="opacity-50 italic">
                                  No especificada
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {!parent.parentProfile?.studentLinks ||
                              parent.parentProfile.studentLinks.length === 0 ? (
                                <span className="text-xs text-[var(--text-muted)] italic">
                                  Ninguno
                                </span>
                              ) : null}
                              {parent.parentProfile?.studentLinks?.map(
                                (link) => (
                                  <div
                                    key={link.id}
                                    className="flex items-center gap-2 px-2.5 py-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-glass)] group relative"
                                  >
                                    <span className="text-xs font-medium text-[var(--text-primary)]">
                                      {link.studentProfile?.user?.firstName}{" "}
                                      {link.studentProfile?.user?.lastName}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)] uppercase">
                                      ({link.relationship})
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleUnlinkStudent(
                                          parent.id,
                                          link.studentProfile?.id,
                                        )
                                      }
                                      className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--status-danger)] rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Desvincular"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenLinkModal(parent)}
                                className="p-2 rounded-lg hover:bg-[var(--accent-primary)]/20 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                                title="Vincular Alumno"
                              >
                                <LinkIcon size={18} />
                              </button>
                              <button
                                onClick={() => handleOpenForm(parent)}
                                className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                title="Editar Padre"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteParent(parent.id)}
                                className="p-2 rounded-lg hover:bg-[var(--status-danger)]/20 text-[var(--text-secondary)] hover:text-[var(--status-danger)] transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg p-6 relative shadow-2xl border border-[var(--border-glass)]">
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
              <UserCheck className="text-[var(--accent-primary)]" size={24} />
              {formModalMode === "create"
                ? "Nuevo Padre/Tutor"
                : "Editar Padre/Tutor"}
            </h2>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-[var(--status-danger)]/20 border border-[var(--status-danger)]/50 text-[var(--status-danger)] text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveParent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Nombre *
                  </label>
                  <input
                    required
                    type="text"
                    className="glass-input w-full"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Apellidos *
                  </label>
                  <input
                    required
                    type="text"
                    className="glass-input w-full"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Correo Electrónico {formModalMode === "create" && "*"}
                </label>
                <input
                  required={formModalMode === "create"}
                  type="email"
                  disabled={formModalMode === "edit"}
                  className="glass-input w-full disabled:opacity-50"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {formModalMode === "create" && (
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    El padre recibirá una invitación para configurar su
                    contraseña.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className="glass-input w-full"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Ocupación
                  </label>
                  <input
                    type="text"
                    className="glass-input w-full"
                    value={formData.occupation}
                    onChange={(e) =>
                      setFormData({ ...formData, occupation: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-6 border-t border-[var(--border-glass)]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="glass-button-secondary flex-1"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="glass-button flex-1 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Guardar Padre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK STUDENT MODAL */}
      {isLinkModalOpen && selectedParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg p-6 relative shadow-2xl border border-[var(--border-glass)]">
            <button
              onClick={() => setIsLinkModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-2 text-[var(--text-primary)] flex items-center gap-2">
              <LinkIcon className="text-[var(--accent-primary)]" size={24} />
              Vincular Alumno
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Selecciona un alumno para vincularlo a{" "}
              <strong>
                {selectedParent.firstName} {selectedParent.lastName}
              </strong>
              .
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Parentesco
                  </label>
                  <select
                    className="glass-input w-full"
                    value={linkRelationship}
                    onChange={(e) => setLinkRelationship(e.target.value)}
                  >
                    <option value="Madre" className="bg-[var(--bg-base)]">
                      Madre
                    </option>
                    <option value="Padre" className="bg-[var(--bg-base)]">
                      Padre
                    </option>
                    <option value="Tutor" className="bg-[var(--bg-base)]">
                      Tutor Legal
                    </option>
                    <option value="Abuelo/a" className="bg-[var(--bg-base)]">
                      Abuelo/a
                    </option>
                    <option value="Tio/a" className="bg-[var(--bg-base)]">
                      Tío/a
                    </option>
                    <option value="Otro" className="bg-[var(--bg-base)]">
                      Otro
                    </option>
                  </select>
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={linkIsPrimary}
                      onChange={(e) => setLinkIsPrimary(e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--border-glass)] bg-[var(--bg-surface)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] focus:ring-offset-0"
                    />
                    Tutor Principal
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Buscar Alumno
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />
                  <input
                    type="text"
                    placeholder="Escribe el nombre del alumno..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full !pl-9 glass-input"
                  />
                </div>
              </div>

              <div className="mt-4 border border-[var(--border-glass)] rounded-lg overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                {studentsLoading ? (
                  <div className="p-8 flex justify-center">
                    <Loader2
                      size={24}
                      className="animate-spin text-[var(--text-muted)]"
                    />
                  </div>
                ) : filteredAvailableStudents.length === 0 ? (
                  <div className="p-4 text-center text-[var(--text-secondary)] text-sm">
                    No se encontraron alumnos disponibles.
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--border-glass)]">
                    {filteredAvailableStudents.map((student) => {
                      const isAlreadyLinked = selectedParent?.parentProfile?.studentLinks?.some(
                        (l) => l.studentProfile?.id === student.studentProfile?.id,
                      ) || false;

                      return (
                        <li
                          key={student.id}
                          className={`p-3 transition-colors flex items-center justify-between ${
                            isAlreadyLinked
                              ? "bg-[var(--bg-surface)] opacity-60"
                              : "hover:bg-[var(--bg-surface)]"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              ID Perfil:{" "}
                              {student.studentProfile?.id?.substring(0, 8) || "N/A"}
                            </p>
                          </div>
                          {isAlreadyLinked ? (
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-[var(--status-success)]/20 text-[var(--status-success)]">
                              Vinculado
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleLinkStudent(student.studentProfile.id)
                              }
                              disabled={
                                linkingStudentId === student.studentProfile.id
                              }
                              className="px-3 py-1.5 rounded-md bg-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {linkingStudentId === student.studentProfile.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Plus size={12} />
                              )}
                              Vincular
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ModuleGuard>
  );
}
