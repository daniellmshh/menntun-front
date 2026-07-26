"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { ApiResponse, UserRole } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import Loader from "@/components/shared/Loader";
import { Building2, ArrowLeft, Plus, Users, School } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function OrganizationDetailsPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"schools" | "admins">("schools");

  const { data: org, isLoading } = useQuery({
    queryKey: ["organization", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any>>(`/organizations/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  if (isLoading) return <Loader />;

  if (!org) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-white">Organización no encontrada</h2>
        <button onClick={() => router.back()} className="mt-4 text-primary-400 hover:underline">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => router.push("/organizations")} className="flex items-center text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a organizaciones
      </button>

      <div className="glass-panel p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary-500/20 rounded-2xl">
            <Building2 className="w-8 h-8 text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-outfit text-white">{org.name}</h1>
            <p className="text-gray-400 text-sm mt-1">ID: {org.id}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab("schools")}
          className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "schools" ? "border-primary-500 text-primary-400" : "border-transparent text-gray-400 hover:text-white"
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
            activeTab === "admins" ? "border-primary-500 text-primary-400" : "border-transparent text-gray-400 hover:text-white"
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
            <div className="flex justify-end">
              <button className="glass-button flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                <Plus className="w-4 h-4" /> Asignar Plantel
              </button>
            </div>
            
            {org.schools?.length === 0 ? (
              <div className="p-12 text-center text-gray-400 glass-panel">No hay planteles asignados.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {org.schools?.map((school: any) => (
                  <div key={school.id} className="glass-panel p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-white">{school.name}</h4>
                      <p className="text-sm text-gray-400 font-mono">{school.code}</p>
                    </div>
                    <Link href={`/schools/${school.id}`} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "admins" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button className="glass-button flex items-center gap-2 px-4 py-2 bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 rounded-xl transition-all">
                <Plus className="w-4 h-4" /> Nuevo ORG_ADMIN
              </button>
            </div>
            
            {org.users?.length === 0 ? (
              <div className="p-12 text-center text-gray-400 glass-panel">No hay administradores registrados.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {org.users?.map((admin: any) => (
                  <div key={admin.id} className="glass-panel p-5">
                    <h4 className="font-bold text-lg text-white">{admin.firstName} {admin.lastName}</h4>
                    <p className="text-sm text-gray-400">{admin.email}</p>
                    <span className="mt-2 inline-block px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
                      Activo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
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
