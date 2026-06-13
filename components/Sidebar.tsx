"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

const MENU = [
  {
    href: "/dashboard/pallet-standards",
    label: "Pallet Standards",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/sku-master",
    label: "SKU Master",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/budget-production",
    label: "Budget Production",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
];

// ── ย้าย SidebarContent ออกมาข้างนอก Sidebar function ──
function SidebarContent({
  pathname,
  onLinkClick,
  onLogout,
}: {
  pathname: string;
  onLinkClick: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <Image
          src="/singha.png"
          alt="Logo"
          width={40}
          height={40}
          className="object-contain shrink-0"
        />
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold leading-tight truncate">
            Boon Rawd
          </p>
          <p className="text-xs truncate" style={{ color: "#C9A227" }}>
            Production Portal
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {MENU.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative group"
              style={{
                backgroundColor: active
                  ? "rgba(201,162,39,0.12)"
                  : "transparent",
                color: active ? "#C9A227" : "rgba(255,255,255,0.65)",
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ backgroundColor: "#C9A227" }}
                />
              )}
              <span className="shrink-0">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="p-3 border-t"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FC8181")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
          }
        >
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          ออกจากระบบ
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 lg:w-60 min-h-screen shrink-0"
        style={{ backgroundColor: "#0D1B3E" }}
      >
        <SidebarContent
          pathname={pathname}
          onLinkClick={() => {}}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{
          backgroundColor: "#0D1B3E",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "rgba(201,162,39,0.15)",
              border: "1px solid #C9A227",
            }}
          >
            <svg viewBox="0 0 64 64" className="w-4 h-4" fill="#C9A227">
              <path
                d="M32 8 C24 8 18 14 18 20 C18 24 20 27 22 29 L20 38 C20 40 22 42 24 42
                L24 52 C24 54 26 56 28 56 L36 56 C38 56 40 54 40 52 L40 42
                C42 42 44 40 44 38 L42 29 C44 27 46 24 46 20 C46 14 40 8 32 8Z"
              />
            </svg>
          </div>
          <span className="text-white text-sm font-semibold">
            Boon Rawd Portal
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Logout — mobile */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
            title="ออกจากระบบ"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FC8181")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative flex flex-col w-64 min-h-screen z-10"
            style={{ backgroundColor: "#0D1B3E" }}
          >
            <div
              className="flex items-center justify-between px-4 h-14 border-b"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <span className="text-white text-sm font-semibold">เมนู</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              onLinkClick={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}
    </>
  );
}
