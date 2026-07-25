"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Sun, Moon, Globe, Menu, X } from "lucide-react";
import { useLanguageStore } from "@/store/language.store";
import { useThemeStore } from "@/store/theme.store";
import { translations } from "@/lib/translations";

export default function LandingNavbar() {
  const { language, setLanguage } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[language];

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 h-[var(--header-height)] z-50 bg-[var(--bg-panel)]/80 backdrop-blur-md border-b border-[var(--border-glass)] transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight gradient-accent-text">
              Menntun
            </span>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Características</a>
            <a href="#roadmap" className="hover:text-[var(--text-primary)] transition-colors">Futuro</a>
            <a href="#pricing" className="hover:text-[var(--text-primary)] transition-colors">Planes</a>
            <a href="#contact" className="hover:text-[var(--text-primary)] transition-colors">Contacto</a>
          </nav>

          {/* Right Actions & Hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border-glass)] bg-white/[0.03] text-[var(--text-primary)] transition-all duration-200 hover:bg-white/[0.08]"
                aria-label="Toggle Theme"
              >
                {!mounted ? null : theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={() => setLanguage(language === "en" ? "es" : "en")}
                className="flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-xl border border-[var(--border-glass)] bg-white/[0.03] text-xs font-bold uppercase transition-all duration-200 hover:bg-white/[0.08]"
              >
                <Globe size={14} />
                {language}
              </button>
            </div>
            <Link href="/login" className="glass-button h-9 px-5 text-sm hidden sm:inline-flex items-center justify-center">
              Ingresar
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[var(--bg-base)] pt-[var(--header-height)] md:hidden"
          >
            <div className="flex flex-col px-6 py-8 gap-6">
              <nav className="flex flex-col gap-6 text-lg font-bold text-[var(--text-primary)]">
                <a href="#features" onClick={toggleMobileMenu} className="border-b border-[var(--border-glass)] pb-4">Características</a>
                <a href="#roadmap" onClick={toggleMobileMenu} className="border-b border-[var(--border-glass)] pb-4">Futuro</a>
                <a href="#pricing" onClick={toggleMobileMenu} className="border-b border-[var(--border-glass)] pb-4">Planes</a>
                <a href="#contact" onClick={toggleMobileMenu} className="border-b border-[var(--border-glass)] pb-4">Contacto</a>
              </nav>

              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={toggleTheme}
                  className="flex flex-1 items-center justify-center gap-2 h-12 rounded-xl border border-[var(--border-glass)] bg-white/[0.03] text-[var(--text-primary)] font-medium"
                >
                  {!mounted ? null : theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  Tema
                </button>
                <button
                  onClick={() => setLanguage(language === "en" ? "es" : "en")}
                  className="flex flex-1 items-center justify-center gap-2 h-12 rounded-xl border border-[var(--border-glass)] bg-white/[0.03] font-bold uppercase"
                >
                  <Globe size={18} />
                  {language}
                </button>
              </div>

              <Link href="/login" onClick={toggleMobileMenu} className="glass-button h-14 w-full flex items-center justify-center text-lg mt-4">
                Ingresar al Sistema
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
