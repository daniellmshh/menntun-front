import React from "react";
import { useAuthStore } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import { ApiResponse } from "@/types";
import { Building2, Users, GraduationCap, School } from "lucide-react";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/language.store";

interface ReportsSummary {
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalEnrollments: number;
}

export default function OrgAdminDashboard() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  const { data: summary, isLoading } = useQuery({
    queryKey: ["org-reports-summary", user?.organizationId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ReportsSummary>>(
        `/organizations/${user?.organizationId}/reports/summary`
      );
      return res.data.data;
    },
    enabled: !!user?.organizationId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const activeSchool = user?.organizationSchools?.find(
    (s) => s.id === user?.activeSchoolId
  );

  return (
    <div className="space-y-6">
      <div className="glass-panel p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        
        <div>
          <h1 className="text-3xl font-bold font-outfit mb-2">
            Vista de Organización
          </h1>
          <p className="text-gray-400">
            Administrando actualmente: <strong className="text-primary-400">{activeSchool?.name || "Consolidado"}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform">
            <Building2 className="w-16 h-16" />
          </div>
          <p className="text-gray-400 text-sm font-medium mb-2">Total Planteles</p>
          <p className="text-3xl font-bold font-outfit text-white">
            {summary?.totalSchools || 0}
          </p>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform">
            <Users className="w-16 h-16" />
          </div>
          <p className="text-gray-400 text-sm font-medium mb-2">Total Alumnos</p>
          <p className="text-3xl font-bold font-outfit text-white">
            {summary?.totalStudents || 0}
          </p>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform">
            <GraduationCap className="w-16 h-16" />
          </div>
          <p className="text-gray-400 text-sm font-medium mb-2">Total Maestros</p>
          <p className="text-3xl font-bold font-outfit text-white">
            {summary?.totalTeachers || 0}
          </p>
        </div>

        <div className="glass-panel p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform">
            <School className="w-16 h-16" />
          </div>
          <p className="text-gray-400 text-sm font-medium mb-2">Inscripciones Activas</p>
          <p className="text-3xl font-bold font-outfit text-white">
            {summary?.totalEnrollments || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
