import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { ChevronDown, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CampusSwitcher() {
  const { user, setActiveSchoolId } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user || user.role !== "ORG_ADMIN" || !user.organizationSchools || user.organizationSchools.length === 0) {
    return null;
  }

  const activeSchool = user.organizationSchools.find(s => s.id === user.activeSchoolId);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <Building2 className="w-4 h-4 text-primary-400" />
        <span className="text-sm font-medium text-gray-200 hidden sm:block">
          {activeSchool ? activeSchool.name : "Vista Consolidada"}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-64 right-0 glass-panel border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  setActiveSchoolId(null);
                  setIsOpen(false);
                  window.location.href = "/dashboard"; // force refresh for modules guard
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  !user.activeSchoolId ? "bg-primary-500/20 text-primary-300" : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${!user.activeSchoolId ? "bg-primary-400" : "bg-transparent"}`} />
                Vista Consolidada (Todas)
              </button>

              <div className="h-px bg-white/10 my-1" />

              {user.organizationSchools.map(school => (
                <button
                  key={school.id}
                  onClick={() => {
                    setActiveSchoolId(school.id);
                    setIsOpen(false);
                    window.location.href = "/dashboard"; // force refresh for modules guard
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                    user.activeSchoolId === school.id ? "bg-primary-500/20 text-primary-300" : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.activeSchoolId === school.id ? "bg-primary-400" : "bg-transparent"}`} />
                    <span className="truncate max-w-[150px]">{school.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{school.code}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
