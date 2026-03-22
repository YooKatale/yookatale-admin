"use client";

import { useLoginMutation } from "@/Slices/userApiSlice";
import { setCredentials } from "@Slices/authSlice";
import { useToast } from "@components/ui/use-toast";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";

const Signin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const { toast } = useToast();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    router.prefetch("/");
    if (userInfo) {
      // already logged in
    } else {
      router.replace("/signin");
    }
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = { username, password };
      const res = await login(data).unwrap();
      dispatch(setCredentials({ ...res }));
      setLoading(false);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      toast({
        title: "Logged In",
        description: `Successfully logged in as ${res?.lastname}`,
      });
    } catch (err) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error occured",
        description: err.data?.message ? err.data?.message : err.data || err.error,
      });
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Bricolage Grotesque', 'Inter', system-ui, sans-serif",
      background: "#f4f5f7",
    }}>
      {/* Left panel — branding (hidden on mobile) */}
      <div style={{
        display: "none",
        width: "50%",
        background: "#111",
        position: "relative",
        overflow: "hidden",
        flexDirection: "column",
        justifyContent: "center",
        padding: "48px",
      }} className="signin-left">
        {/* Subtle background pattern */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 20% 80%, rgba(13,124,59,0.15), transparent 50%), radial-gradient(circle at 80% 20%, rgba(217,119,6,0.1), transparent 50%)",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: "#0d7c3b",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Y</span>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>Yookatale</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: 2 }}>Admin Panel</div>
            </div>
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16, letterSpacing: -0.5 }}>
            Manage.<br />
            <span style={{ color: "#0d7c3b" }}>Monitor.</span><br />
            <span style={{ color: "#d97706" }}>Grow.</span>
          </h1>
          <p style={{ fontSize: 15, color: "#9ca3af", lineHeight: 1.6, maxWidth: 360 }}>
            Your command center for managing orders, vendors, riders, and everything that keeps Yookatale running.
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
            {[
              { v: "1,200+", l: "Active Users" },
              { v: "500+", l: "Daily Orders" },
              { v: "98%", l: "Uptime" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: "14px 18px", flex: 1,
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{s.v}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "32px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }} className="animate-fadeIn">
          {/* Mobile logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }} className="signin-mobile-logo">
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: "#0d7c3b",
              display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
            }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>Y</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>Yookatale</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: 2 }}>Admin Panel</div>
          </div>

          {/* Card */}
          <div style={{
            background: "#fff", borderRadius: 14, padding: "32px 28px",
            border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 4 }}>Welcome back</h2>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Sign in to access the admin dashboard</p>
            </div>

            <form onSubmit={submitHandler}>
              {/* Username */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 8,
                    border: "1.5px solid #e5e7eb", fontSize: 14, fontWeight: 500,
                    outline: "none", transition: "border-color 0.2s",
                    fontFamily: "inherit", background: "#f9fafb",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0d7c3b"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: "100%", padding: "12px 44px 12px 14px", borderRadius: 8,
                      border: "1.5px solid #e5e7eb", fontSize: 14, fontWeight: 500,
                      outline: "none", transition: "border-color 0.2s",
                      fontFamily: "inherit", background: "#f9fafb",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#0d7c3b"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", padding: 2,
                    }}
                  >
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword ? (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      ) : (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 01-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%", padding: "13px", borderRadius: 10, border: "none",
                  background: "#0d7c3b", color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  opacity: isLoading ? 0.7 : 1, transition: "opacity 0.2s, transform 0.1s",
                }}
              >
                {isLoading && (
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 019.95 9" />
                  </svg>
                )}
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Footer */}
            <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
              <p style={{ fontSize: 11, color: "#9ca3af" }}>
                Yookatale Admin Dashboard v2.0
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (min-width: 768px) {
          .signin-left { display: flex !important; }
          .signin-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Signin;
