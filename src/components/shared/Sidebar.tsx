"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Calendar,
  CalendarDays,
  GraduationCap,
  MessageSquare,
  Users,
  Award,
  FileText,
  UserCheck,
  ClipboardList,
  Compass,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  BookMarked,
  Layers,
  FolderOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";
import { UserRole } from "@/types";
import { useActiveModules, ACTIVE_MODULES_QUERY_KEY } from "@/hooks/useActiveModules";
import { useQueryClient } from "@tanstack/react-query";

interface SidebarItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  isCore?: boolean;
  moduleKey?: string;
  subItems?: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    isCore?: boolean;
    moduleKey?: string;
  }[];
}

const NAV_ITEMS: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, isCore: true },
  { name: "Schools", href: "/schools", icon: Building2, isCore: true },
  { name: "Academic", href: "/academic", icon: GraduationCap, moduleKey: "academic" },
  { name: "SchoolYears", href: "/school-years", icon: CalendarDays, moduleKey: "schoolYears" },
  {
    name: "Catalogs",
    icon: FolderOpen,
    moduleKey: "gradesCatalog",
    subItems: [
      { name: "GradesCatalog", href: "/grades-catalog", icon: BookMarked, moduleKey: "gradesCatalog" },
    ],
  },
  { name: "Groups", href: "/groups", icon: Layers, moduleKey: "groups" },
  { name: "Students", href: "/students", icon: Users, moduleKey: "students" },
  { name: "Teachers", href: "/teachers", icon: ClipboardList, moduleKey: "teachers" },
  { name: "Parents", href: "/parents", icon: UserCheck, moduleKey: "parents" },
  { name: "Attendance", href: "/attendance", icon: Calendar, moduleKey: "attendance" },
  { name: "Grades", href: "/grades", icon: Award, moduleKey: "grades" },
  { name: "Planning", href: "/planning", icon: Compass, moduleKey: "planning" },
  { name: "Enrollments", href: "/enrollments", icon: BookOpen, moduleKey: "enrollments" },
  { name: "Scholarships", href: "/scholarships", icon: FileText, moduleKey: "scholarships" },
  { name: "Communications", href: "/communications", icon: MessageSquare, moduleKey: "communications" },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language];
  const { user, clear } = useAuthStore();
  const { modules, isLoading } = useActiveModules();
  const queryClient = useQueryClient();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    catalogs: true,
  });

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Invalidate the active modules cache so that the next login always fetches fresh data
    queryClient.removeQueries({ queryKey: ACTIVE_MODULES_QUERY_KEY });
    clear();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-50 flex flex-col glass-panel border border-[var(--border-glass)] transition-all duration-300 ease-in-out print:hidden
          left-5 top-5 bottom-5 overflow-hidden
          ${isCollapsed ? "w-20" : "w-[260px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+20px)] lg:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-[var(--border-glass)] overflow-hidden white-space-nowrap">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-glow flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} color="#fff" />
          </div>

          {!isCollapsed && (
            <span className="font-extrabold text-xl tracking-wide gradient-accent-text transition-opacity duration-200">
              Menntun
            </span>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-2 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            // Determine if the user has access to this core item based on role
            if (
              item.href &&
              (item.href === "/schools" ||
                item.href === "/school-years" ||
                item.href === "/grades-catalog" ||
                item.href === "/groups") &&
              user?.role !== UserRole.SUPER_ADMIN &&
              user?.role !== UserRole.SCHOOL_ADMIN
            ) {
              return null;
            }

            // Handle sub-items filtering dynamically
            let visibleSubItems = item.subItems || [];
            if (item.subItems) {
              visibleSubItems = item.subItems.filter((sub) => {
                if (
                  sub.href === "/grades-catalog" &&
                  user?.role !== UserRole.SUPER_ADMIN &&
                  user?.role !== UserRole.SCHOOL_ADMIN
                ) {
                  return false;
                }
                return true;
              });

              if (visibleSubItems.length === 0) {
                return null;
              }
            }

            // Filter optional modules based on what is active (except for SUPER_ADMIN)
            const isOptional = !item.isCore;
            const moduleName = item.moduleKey || item.name.toLowerCase();

            if (isOptional && user?.role !== UserRole.SUPER_ADMIN) {
              // Hide optional modules while loading to prevent flickering of unauthorized modules
              if (isLoading) {
                return null;
              }
              if (!modules.includes(moduleName)) {
                return null;
              }
              // If teacher, check their allowedModules (only restricts when non-empty)
              if (user?.role === UserRole.TEACHER) {
                const allowedModules = user.teacherProfile?.allowedModules || [];
                if (allowedModules.length > 0) {
                  const isAllowed = allowedModules
                    .map((m: string) => m.toLowerCase())
                    .includes(moduleName);
                  if (!isAllowed) {
                    return null;
                  }
                }
              }
            }

            const hasSubItems = !!item.subItems;

            if (hasSubItems) {
              const isMenuOpen = openMenus[item.name.toLowerCase()] !== false;
              const Icon = item.icon;
              const sidebarKey = item.name.toLowerCase() as keyof typeof t.sidebar;
              const translatedName = t.sidebar[sidebarKey] || item.name;

              // Check if any sub-item is active to highlight the parent
              const isAnySubActive = visibleSubItems.some((sub) => pathname.startsWith(sub.href));

              return (
                <div key={item.name} className="flex flex-col space-y-1">
                  <button
                    onClick={() => toggleMenu(item.name.toLowerCase())}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all duration-200 relative whitespace-nowrap overflow-hidden group
                      ${
                        isAnySubActive
                          ? "bg-[hsla(263,90%,60%,0.08)] border-[hsla(263,90%,65%,0.15)] text-[var(--text-primary)] font-semibold"
                          : "border-transparent text-[var(--text-secondary)] hover:bg-white/5 sidebar-nav-link"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isAnySubActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`} />
                      {!isCollapsed && (
                        <span className="text-sm font-medium tracking-wide transition-opacity duration-200">{translatedName}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      isMenuOpen ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />
                    )}
                    {/* Collapsed Tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-16 z-50 hidden group-hover:block px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[var(--text-primary)] shadow-main whitespace-nowrap">
                        {translatedName}
                      </div>
                    )}
                  </button>

                  {isMenuOpen && (
                    <div className={`flex flex-col space-y-1 ${isCollapsed ? "pl-0 border-l-0 ml-0" : "pl-6 border-l border-[var(--border-glass)] ml-6.5"}`}>
                      {visibleSubItems.map((subItem) => {
                        const isSubActive = pathname.startsWith(subItem.href);
                        const SubIcon = subItem.icon;
                        const subSidebarKey = (subItem.name === "GradesCatalog" ? "gradesCatalog" : subItem.name.toLowerCase()) as keyof typeof t.sidebar;
                        const subTranslatedName = t.sidebar[subSidebarKey] || subItem.name;

                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-200 relative whitespace-nowrap overflow-hidden group
                              ${
                                isSubActive
                                  ? "bg-[hsla(263,90%,60%,0.12)] border-[hsla(263,90%,65%,0.2)] text-[var(--text-primary)] font-semibold"
                                  : "border-transparent text-[var(--text-secondary)] hover:bg-white/5"
                              }
                            `}
                          >
                            <SubIcon className={`w-4 h-4 flex-shrink-0 ${isSubActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`} />
                            {!isCollapsed && (
                              <span className="text-xs font-medium tracking-wide transition-opacity duration-200">{subTranslatedName}</span>
                            )}
                            {isCollapsed && (
                              <div className="absolute left-16 z-50 hidden group-hover:block px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[var(--text-primary)] shadow-main whitespace-nowrap">
                                {subTranslatedName}
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href || "");
            const Icon = item.icon;
            const sidebarKey = (
              item.name === "SchoolYears"
                ? "schoolYears"
                : item.name === "GradesCatalog"
                ? "gradesCatalog"
                : item.name.toLowerCase()
            ) as keyof typeof t.sidebar;
            const translatedName = t.sidebar[sidebarKey] || item.name;

            return (
              <Link
                key={item.name}
                href={item.href || ""}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-200 relative whitespace-nowrap overflow-hidden group
                  ${
                    isActive
                      ? "bg-[hsla(263,90%,60%,0.15)] border-[hsla(263,90%,65%,0.25)] text-[var(--text-primary)] font-semibold"
                      : "border-transparent text-[var(--text-secondary)] sidebar-nav-link"
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`} />

                {!isCollapsed && (
                  <span className="text-sm font-medium tracking-wide transition-opacity duration-200">{translatedName}</span>
                )}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-16 z-50 hidden group-hover:block px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[var(--text-primary)] shadow-main whitespace-nowrap">
                    {translatedName}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Collapse Toggle & Logout */}
        <div className="border-t border-[var(--border-glass)] p-3 space-y-2 flex flex-col">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-[var(--accent-danger)] hover:bg-red-500/10 transition-all duration-200 text-left"
          >
            <LogOut size={20} className="text-[var(--accent-danger)] flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">{t.sidebar.logout}</span>}
          </button>

          {/* Desktop Toggler */}
          <div className="hidden lg:flex justify-end pt-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="bg-white/[0.03] border border-[var(--border-glass)] text-[var(--text-secondary)] w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-white/[0.08] hover:text-[var(--text-primary)]"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
