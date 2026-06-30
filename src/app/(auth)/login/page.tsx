"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Globe, Sun, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";
import { ApiResponse, RequestUser, UserRole } from "@/types";
import { useThemeStore } from "@/store/theme.store";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { language, setLanguage } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const t = translations[language];

  // Use a state to avoid hydration mismatch for the theme icon
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg(t.login.errorFields);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        setErrorMsg(t.login.errorGeneric);
        setLoading(false);
        return;
      }

      // Extract user details from metadata with fallbacks
      const userMetadata = data.user.user_metadata || {};
      const schoolId = userMetadata.schoolId || "DEMO-001";
      const role = (userMetadata.role as UserRole) || UserRole.SUPER_ADMIN;
      const firstName = userMetadata.firstName || "John";
      const lastName = userMetadata.lastName || "Doe";

      // 2. Synchronize user with our database
      // The Axios interceptor will automatically fetch the session we just created
      // and attach the Bearer Authorization header to this request.
      const syncResponse = await api.post<ApiResponse<RequestUser>>("/auth/sync", {
        schoolId,
        role,
        firstName,
        lastName,
      });

      const syncedUser = syncResponse.data.data;

      // 3. Update Zustand auth store
      const store = useAuthStore.getState();
      store.setUser(syncedUser);
      store.setSession(data.session);
      store.setLoading(false);

      // 4. Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login flow error:", err);
      setErrorMsg(t.login.errorGeneric);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4 font-sans relative z-0 overflow-hidden">
      {/* Background glow backdrops */}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />

      {/* Floating Toggles (Language & Theme) */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-xl border border-[var(--border-glass)] bg-white/[0.03] text-[var(--text-primary)] transition-all duration-200 hover:bg-white/[0.08]"
        >
          {!mounted ? null : theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button
          onClick={() => setLanguage(language === "en" ? "es" : "en")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-glass)] bg-white/[0.03] text-xs font-bold uppercase transition-all duration-200 hover:bg-white/[0.08]"
        >
          <Globe size={14} />
          {language}
        </button>
      </div>

      {/* Login Card Panel */}
      <div className="w-full max-w-md glass-panel p-10 flex flex-col gap-6 shadow-2xl relative z-10">
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-glow flex items-center justify-center">
            <Sparkles size={24} color="#fff" />
          </div>
          <h1 className="font-extrabold text-3xl tracking-wide gradient-accent-text">
            {t.login.title}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            {t.login.subtitle}
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] tracking-wide uppercase">
              {t.login.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
              placeholder="admin@menntun.com"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] tracking-wide uppercase">
              {t.login.passwordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="text-xs font-semibold text-[var(--accent-danger)] bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center animate-fade-in">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="glass-button w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{t.login.signingButton}</span>
              </>
            ) : (
              <span>{t.login.signinButton}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
