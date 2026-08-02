"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { ApiResponse, UserRole } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import Loader from "@/components/shared/Loader";
import { Building2, ArrowLeft, Plus, Users, School, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface OrganizationSchool {
  id: string;
  name: string;
  code: string;
  organizationId?: string | null;
}

interface OrganizationAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface OrganizationDetail {
  id: string;
  name: string;
  schools?: OrganizationSchool[];
  users?: OrganizationAdmin[];
}

export default function OrganizationDetailsPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"schools" | "admins">("schools");
  const canViewOrganization =
    user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ORG_ADMIN;
  const canManageOrganization = user?.role === UserRole.SUPER_ADMIN;

  // Modals state
  const [isAssignSchoolModalOpen, setIsAssignSchoolModalOpen] = useState(false);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);

  // Assign school form
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  
  // Create admin form
  const [adminEmail, setAdminEmail] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const { data: org, isLoading } = useQuery({
    queryKey: ["organization", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<OrganizationDetail>>(`/organizations/${id}`);
      return res.data.data;
    },
    enabled: !!id && canViewOrganization,
  });

  const { data: allSchools } = useQuery({
    queryKey: ["schools-unassigned"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<OrganizationSchool[]>>(`/schools`);
      // Optionally filter only schools without organization if backend returns all
      return res.data.data?.filter(s => s.organizationId === null) || [];
    },
    enabled: canManageOrganization && isAssignSchoolModalOpen,
  });

  const assignSchoolMutation = useMutation({
    mutationFn: async (schoolId: string) => {
      await api.post(`/organizations/${id}/schools`, { schoolId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", id] });
      setIsAssignSchoolModalOpen(false);
      setSelectedSchoolId("");
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/organizations/${id}/admins`, {
        email: adminEmail,
        firstName: adminFirstName,
        lastName: adminLastName,
        password: adminPassword,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", id] });
      setIsCreateAdminModalOpen(false);
      setAdminEmail("");
      setAdminFirstName("");
      setAdminLastName("");
      setAdminPassword("");
    },
  });

  if (!canViewOrganization) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-[var(--text-secondary)]">
          No tienes permisos para ver esta página.
        </p>
      </div>
    );
  }

  if (isLoading) return <Loader />;

  if (!org) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-[var(--text-primary)]">Organización no encontrada</h2>
        <button onClick={() => router.back()} className="mt-4 text-[var(--accent-primary)] hover:underline">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => router.push("/organizations")} className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a organizaciones
      </button>

      <div className="glass-panel p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[var(--accent-primary)]/20 rounded-2xl">
            <Building2 className="w-8 h-8 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-outfit text-[var(--text-primary)]">{org.name}</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">ID: {org.id}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-[var(--border-glass)]">
        <button
          onClick={() => setActiveTab("schools")}
          className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "schools" ? "border-[var(--accent-primary)] text-[var(--accent-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <School className="w-4 h-4" />
            Planteles ({org.schools?.length || 0})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("admins")}
          className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "admins" ? "border-[var(--accent-primary)] text-[var(--accent-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Administradores ORG ({org.users?.length || 0})
          </div>
        </button>
      </div>

      <div className="pt-4">
        {activeTab === "schools" && (
          <div className="space-y-4">
            {canManageOrganization && (
              <div className="flex justify-end">
                <button onClick={() => setIsAssignSchoolModalOpen(true)} className="glass-button flex items-center gap-2 px-4 py-2 bg-[var(--bg-panel)] hover:bg-black/10 border border-[var(--border-glass)] rounded-xl transition-all text-[var(--text-primary)]">
                  <Plus className="w-4 h-4" /> Asignar Plantel
                </button>
              </div>
            )}
            
            {org.schools?.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-secondary)] glass-panel border border-[var(--border-glass)]">No hay planteles asignados.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {org.schools?.map((school) => (
                  <div key={school.id} className="glass-panel p-5 flex items-center justify-between border border-[var(--border-glass)]">
                    <div>
                      <h4 className="font-bold text-lg text-[var(--text-primary)]">{school.name}</h4>
                      <p className="text-sm text-[var(--text-secondary)] font-mono">{school.code}</p>
                    </div>
                    <Link href={`/schools/${school.id}`} className="p-2 bg-[var(--bg-panel)] border border-[var(--border-glass)] hover:bg-black/10 rounded-lg transition-colors">
                      <ArrowRight className="w-5 h-5 text-[var(--text-secondary)]" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "admins" && (
          <div className="space-y-4">
            {canManageOrganization && (
              <div className="flex justify-end">
                <button onClick={() => setIsCreateAdminModalOpen(true)} className="glass-button flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/30 rounded-xl transition-all">
                  <Plus className="w-4 h-4" /> Nuevo ORG_ADMIN
                </button>
              </div>
            )}
            
            {org.users?.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-secondary)] glass-panel border border-[var(--border-glass)]">No hay administradores registrados.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {org.users?.map((admin) => (
                  <div key={admin.id} className="glass-panel p-5 border border-[var(--border-glass)]">
                    <h4 className="font-bold text-lg text-[var(--text-primary)]">{admin.firstName} {admin.lastName}</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{admin.email}</p>
                    <span className="mt-2 inline-block px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400">
                      Activo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal - Asignar Plantel */}
      {isAssignSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel p-6 w-full max-w-md relative border border-[var(--border-glass)]"
          >
            <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Asignar Plantel Existente</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Selecciona una escuela</label>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full glass-input bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  <option value="">Seleccione...</option>
                  {allSchools?.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
                {allSchools?.length === 0 && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1">No hay planteles sin asignar disponibles.</p>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsAssignSchoolModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] hover:bg-black/10 transition-colors text-[var(--text-primary)]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => assignSchoolMutation.mutate(selectedSchoolId)}
                  disabled={!selectedSchoolId || assignSchoolMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-light)] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {assignSchoolMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Asignar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal - Crear ORG ADMIN */}
      {isCreateAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel p-6 w-full max-w-md relative border border-[var(--border-glass)]"
          >
            <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Nuevo Administrador</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Nombre</label>
                  <input type="text" value={adminFirstName} onChange={e => setAdminFirstName(e.target.value)} className="w-full glass-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Apellido</label>
                  <input type="text" value={adminLastName} onChange={e => setAdminLastName(e.target.value)} className="w-full glass-input" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Email</label>
                <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full glass-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Contraseña temporal</label>
                <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full glass-input" />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsCreateAdminModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] hover:bg-black/10 transition-colors text-[var(--text-primary)]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => createAdminMutation.mutate()}
                  disabled={!adminEmail || !adminFirstName || !adminLastName || !adminPassword || createAdminMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-light)] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {createAdminMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Crear
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
