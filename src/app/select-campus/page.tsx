"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Building2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/store/language.store";

export default function SelectCampusPage() {
  const router = useRouter();
  const { user, setActiveSchoolId, isLoading } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "ORG_ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "ORG_ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const handleSelectSchool = (schoolId: string) => {
    setActiveSchoolId(schoolId);
    router.push("/dashboard");
  };

  const schools = user.organizationSchools || [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-black to-secondary-900/20 z-0" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-3xl glass-panel p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 glass-button rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold font-outfit mb-2 gradient-text">
            Selecciona tu Plantel
          </h1>
          <p className="text-gray-400">
            Elige el plantel que deseas administrar en esta sesión.
          </p>
        </div>

        {schools.length === 0 ? (
          <div className="text-center p-8 bg-white/5 rounded-xl border border-white/10">
            <p className="text-gray-400">No hay planteles asignados a esta organización.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {schools.map((school) => (
              <motion.button
                key={school.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectSchool(school.id)}
                className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary-500/50 transition-all group text-left"
              >
                <div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-400 transition-colors">
                    {school.name}
                  </h3>
                  <span className="text-xs text-gray-500 font-mono bg-black/50 px-2 py-1 rounded">
                    {school.code}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 transform group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
