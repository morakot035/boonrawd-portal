"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.token);
      router.push("/dashboard/pallet-standards");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "#0D1B3E", fontFamily: "Kanit, sans-serif" }}
    >
      {/* Background watermark lion */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ opacity: 0.04 }}
      >
        <svg
          viewBox="0 0 300 300"
          style={{ width: "70vmin", height: "70vmin" }}
          fill="#C9A227"
        >
          <path
            d="M150 20 C110 20 80 50 80 85 C80 105 90 122 105 133
            L95 175 C93 185 100 195 110 195 L110 245
            C110 255 118 263 128 263 L172 263
            C182 263 190 255 190 245 L190 195
            C200 195 207 185 205 175 L195 133
            C210 122 220 105 220 85 C220 50 190 20 150 20Z
            M135 85 C135 78 142 73 150 73 C158 73 165 78 165 85
            C165 92 158 97 150 97 C142 97 135 92 135 85Z
            M120 50 C125 40 138 35 150 35 C162 35 175 40 180 50
            L175 65 C168 58 160 54 150 54 C140 54 132 58 125 65Z"
          />
        </svg>
      </div>

      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          backgroundColor: "rgba(201,162,39,0.04)",
          transform: "translate(40%, -40%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          backgroundColor: "rgba(201,162,39,0.04)",
          transform: "translate(-40%, 40%)",
        }}
      />

      {/* Card */}
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          maxWidth: 440,
          backgroundColor: "#F5F0E8",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Gold top bar */}
        <div style={{ height: 4, backgroundColor: "#C9A227" }} />

        <div className="p-8 sm:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/singha.png"
              alt="Logo"
              className="w-24 h-24 object-contain mb-4"
            />
            <h1
              className="text-xl font-bold tracking-wide"
              style={{ color: "#0D1B3E" }}
            >
              Boon Rawd Brewery
            </h1>
            <p
              className="text-xs mt-1 tracking-widest uppercase"
              style={{ color: "#C9A227" }}
            >
              Production Portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#0D1B3E" }}
              >
                อีเมล
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9CA3AF" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    border: "1.5px solid #D1C9B8",
                    backgroundColor: "#fff",
                    color: "#0D1B3E",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#C9A227";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(201,162,39,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#D1C9B8";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#0D1B3E" }}
              >
                รหัสผ่าน
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9CA3AF" }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    border: "1.5px solid #D1C9B8",
                    backgroundColor: "#fff",
                    color: "#0D1B3E",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#C9A227";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(201,162,39,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#D1C9B8";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#9CA3AF" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#C9A227")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#9CA3AF")
                  }
                >
                  {showPw ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: "#FEE2E2",
                  color: "#991B1B",
                  border: "1px solid #FECACA",
                }}
              >
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 mt-2"
              style={{
                backgroundColor: loading ? "#A89030" : "#C9A227",
                color: "#0D1B3E",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.08em",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "#E8C547";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = loading
                  ? "#A89030"
                  : "#C9A227";
                e.currentTarget.style.transform = "none";
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: "#9CA3AF" }}>
            © {new Date().getFullYear()} บริษัท บุญรอด บริวเวอรี่ จำกัด
          </p>
        </div>
      </div>
    </div>
  );
}
