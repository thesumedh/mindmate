/**
 * Header & Navigation Component
 *
 * Concept Explanation:
 * --------------------
 * The application navigation header provides:
 * 1. **Responsive Dual Navigation**:
 *    - Desktop: Horizontal pill-style route buttons with active route highlight.
 *    - Mobile: Full-screen blurred backdrop modal drawer with accessible hamburger toggle.
 * 2. **Next.js App Router Integration**:
 *    - Uses `usePathname()` hook to dynamically detect the current URL and highlight the active link.
 * 3. **Accessibility**: Includes ARIA labels and clean focus states.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * Primary navigation route definitions.
 */
const NAV_ITEMS = [
  { href: "/",          label: "Home" },
  { href: "/chat",      label: "Chat" },
  { href: "/games",     label: "Games" },
  { href: "/journal",   label: "Journal" },
  { href: "/resources", label: "Resources" },
  { href: "/docs",      label: "Docs" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="relative z-20 flex items-center justify-between p-4 sm:p-6">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <svg
            fill="none"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
            className="size-9 text-white transition-transform duration-300 group-hover:scale-105"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="header-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#header-logo-gradient)" />
            <text x="20" y="27" textAnchor="middle" fontSize="16" fontWeight="bold" fill="black" fontFamily="system-ui">
              MM
            </text>
          </svg>
          <span className="text-white font-semibold text-base hidden sm:block">MindMate</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`text-xs font-light px-3 py-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-white/15 text-white font-normal"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Mobile Trigger */}
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="hidden sm:flex px-5 py-2 rounded-full bg-white text-black font-medium text-xs transition-all hover:bg-white/90 hover:scale-105 active:scale-95 shadow-sm"
          >
            Start Chat
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 flex flex-col"
          style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center justify-between p-4">
            <span className="text-white font-semibold">MindMate</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 px-4 py-6">
            {NAV_ITEMS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-5 py-4 rounded-2xl text-lg font-light transition-all ${
                  pathname === href ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="px-4 mt-auto pb-8">
            <Link
              href="/chat"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full py-4 rounded-2xl bg-white text-black font-medium text-center text-lg hover:bg-white/90 transition-all"
            >
              Start Chatting →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
