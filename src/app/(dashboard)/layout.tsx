"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Settings,
  Sparkles,
  BookMarked,
  Layers,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";
import { ApiResponse, RequestUser, UserRole } from "@/types";
import Sidebar from "@/components/shared/Sidebar";
import { useQueryClient } from "@tanstack/react-query";
import { ACTIVE_MODULES_QUERY_KEY } from "@/hooks/useActiveModules";
import { useThemeStore } from "@/store/theme.store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { language, setLanguage } = useLanguageStore();
  const t = translations[language];

  const { user, setUser, setSession, setLoading, clear } = useAuthStore();
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useThemeStore();

  // Use a state to avoid hydration mismatch for the theme icon
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync session and backend user profile on mount
  useEffect(() => {
    const syncUserSession = async () => {
      const supabase = createClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        clear();
        router.push("/login");
        return;
      }
      
      setSession(session);

      if (!useAuthStore.getState().user) {
        try {
          const userMetadata = session.user.user_metadata || {};
          const schoolId = userMetadata.schoolId || "DEMO-001";
          const role = (userMetadata.role as UserRole) || UserRole.SUPER_ADMIN;
          const firstName = userMetadata.firstName || "John";
          const lastName = userMetadata.lastName || "Doe";

          const syncResponse = await api.post<ApiResponse<RequestUser>>("/auth/sync", {
            schoolId,
            role,
            firstName,
            lastName,
          });
          
          setUser(syncResponse.data.data);
        } catch (error) {
          console.error("Failed to sync user session on layout mount:", error);
          clear();
          router.push("/login");
          return;
        }
      }
      
      setLoading(false);
    };

    syncUserSession();

    // Listen for sign out / session state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === "SIGNED_OUT" || !newSession) {
        clear();
        router.push("/login");
      } else if (newSession) {
        setSession(newSession);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clear, router, setUser, setSession, setLoading]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ACTIVE_MODULES_QUERY_KEY });
    clear();
    router.push("/login");
  };

  const userInitials = user
    ? `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase()
    : "JD";
  const userFullName = user ? `${user.firstName} ${user.lastName}` : "John Doe";
  const userRoleDisplay = user
    ? (user.role === UserRole.SUPER_ADMIN ? t.header.roleLabel : user.role)
    : "School Admin";

  const mockNotifications = [
    { id: 1, title: t.header.notifications.notif1_title, desc: t.header.notifications.notif1_desc, time: t.header.notifications.notif1_time, unread: true },
    { id: 2, title: t.header.notifications.notif2_title, desc: t.header.notifications.notif2_desc, time: t.header.notifications.notif2_time, unread: true },
    { id: 3, title: t.header.notifications.notif3_title, desc: t.header.notifications.notif3_desc, time: t.header.notifications.notif3_time, unread: false },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans overflow-x-hidden relative z-0 print:bg-white print:text-black">
      {/* Decorative ambient glowing backdrops */}
      <div className="ambient-glow ambient-glow-1 print:hidden" />
      <div className="ambient-glow ambient-glow-2 print:hidden" />

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ml-0 relative z-10 print:ml-0 print:p-0 ${
          isCollapsed ? "lg:ml-[100px]" : "lg:ml-[280px]"
        }`}
      >
        {/* Top Header Navbar */}
        <header className="flex items-center justify-between h-[var(--header-height)] px-10 bg-transparent backdrop-blur-md border-b border-[var(--border-glass)] sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-4">
            {/* Mobile Open Sidebar Button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[var(--border-glass)] hover:bg-[var(--bg-panel-hover)]"
            >
              <Menu size={20} />
            </button>

            {/* Header Search (Glassmorphic) */}
            <div className="relative w-[300px] hidden sm:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search size={18} className="text-[var(--text-muted)]" />
              </span>
              <input
                type="text"
                placeholder={t.header.searchPlaceholder}
                className="glass-input"
                style={{
                  paddingLeft: "44px",
                  height: "42px",
                }}
              />
            </div>
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-5">
            {/* School Logo/Name Selector Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-glass)] bg-black/10">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-secondary)] animate-pulse" />
              <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-wider uppercase">
                {user ? user.schoolId : t.header.schoolLabel}
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-[42px] h-[42px] rounded-lg border border-[var(--border-glass)] bg-white/[0.03] flex items-center justify-center cursor-pointer text-[var(--text-primary)] transition-all duration-200 hover:bg-white/[0.08] hover:border-[var(--accent-primary-light)]"
            >
              {!mounted ? null : theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === "en" ? "es" : "en")}
              className="w-[42px] h-[42px] rounded-lg border border-[var(--border-glass)] bg-white/[0.03] flex items-center justify-center cursor-pointer text-xs font-extrabold uppercase transition-all duration-200 hover:bg-white/[0.08] hover:border-[var(--accent-primary-light)]"
            >
              {language}
            </button>

            {/* Notifications Bell */}
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-[42px] h-[42px] rounded-lg border border-[var(--border-glass)] bg-white/[0.03] flex items-center justify-center cursor-pointer text-[var(--text-primary)] transition-all duration-200 hover:bg-white/[0.08] hover:border-[var(--accent-primary-light)] relative"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-glow" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-panel p-2 z-50 flex flex-col gap-1 max-h-[360px] overflow-y-auto">
                  <div className="px-3 py-2 border-b border-[var(--border-glass)] flex justify-between items-center">
                    <span className="font-bold text-sm">{t.header.notifications.title}</span>
                    <span className="text-xs text-[var(--accent-primary-light)] cursor-pointer">{t.header.notifications.markAllRead}</span>
                  </div>
                  {mockNotifications.map((notif) => (
                    <div key={notif.id} className="p-3 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer text-left">
                      <div className="flex justify-between items-start">
                        <span className={`font-semibold text-xs ${notif.unread ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1">{notif.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/[0.04] transition-all duration-200 border border-transparent hover:border-[var(--border-glass)]"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center font-bold text-white text-sm uppercase">
                  {userInitials}
                </div>
                <div className="hidden md:block text-left pr-2">
                  <div className="text-xs font-semibold text-[var(--text-primary)]">{userFullName}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{userRoleDisplay}</div>
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 glass-panel p-1 z-50">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <User size={16} />
                    {t.header.profile.settings}
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <Settings size={16} />
                    {t.header.profile.admin}
                  </Link>
                  <div className="border-t border-[var(--border-glass)] my-1" />
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[var(--accent-danger)] hover:bg-red-500/10 transition-colors text-left"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    {t.header.profile.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 p-10 bg-transparent print:p-0">
          <div className="max-w-[1600px] mx-auto space-y-6 print:max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
