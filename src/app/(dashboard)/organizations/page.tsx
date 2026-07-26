"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { ApiResponse, UserRole } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import Loader from "@/components/shared/Loader";
import { Plus, Building2, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Organization {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  _count: {
    schools: number;
    users: number;
  };
}

export default function OrganizationsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Organization[]>>("/organizations");
      return res.data.data;
    },
    enabled: user?.role === UserRole.SUPER_ADMIN,
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post<ApiResponse<Organization>>("/organizations", { name });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setIsModalOpen(false);
      setNewOrgName("");
    },
  });

  if (user?.role !== UserRole.SUPER_ADMIN) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-400">No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  if (isLoading) return <Loader />;

  const filteredOrgs = orgs?.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-[var(--text-primary)]">
            Organizaciones
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Gestiona redes de colegios y escuelas multi-plantel.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="glass-button flex items-center gap-2 px-4 py-2 bg-primary-600/20 text-primary-300 hover:bg-primary-600/30 rounded-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nueva Organización</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar organización por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full glass-input pl-10 h-12"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org) => (
          <Link href={`/organizations/${org.id}`} key={org.id}>
            <motion.div
              whileHover={{ y: -4 }}
              className="glass-panel p-6 h-full flex flex-col hover:border-primary-500/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary-500/20 transition-colors">
                  <Building2 className="w-6 h-6 text-primary-400" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary-400 transform group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{org.name}</h3>
              <div className="mt-auto pt-4 border-t border-[var(--border-glass)] flex justify-between text-sm text-[var(--text-secondary)]">
                <span>{org._count.schools} planteles</span>
                <span>{org._count.users} admins</span>
              </div>
            </motion.div>
          </Link>
        ))}
        {filteredOrgs.length === 0 && (
          <div className="col-span-full py-12 text-center text-[var(--text-secondary)] bg-[var(--bg-panel)] rounded-xl border border-[var(--border-glass)]">
            No se encontraron organizaciones.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel p-6 w-full max-w-md relative border border-[var(--border-glass)]"
          >
            <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Crear Organización</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nombre</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full glass-input"
                  placeholder="Ej. Colegio Las Américas"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] hover:bg-black/10 transition-colors text-[var(--text-primary)]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => createMutation.mutate(newOrgName)}
                  disabled={!newOrgName.trim() || createMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creando..." : "Crear"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
