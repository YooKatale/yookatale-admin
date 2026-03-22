"use client";

import UpdateAccount from "@components/modals/UpdateAccount";
import ChangePassword from "@components/modals/ChangePassword";
import { useGetAppSettingsQuery, useUpdateAppSettingsMutation } from "@Slices/ordersDeliveryApiSlice";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useToast } from "@components/ui/use-toast";

/* ── Icons ── */
const IC = {
  User: ({ s = 18, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Shield: ({ s = 18, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Mail: ({ s = 18, c = "#6b7280" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  Phone: ({ s = 18, c = "#6b7280" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
  Key: ({ s = 18, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>,
  Edit: ({ s = 18, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  Gear: ({ s = 18, c = "#6b7280" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  Truck: ({ s = 18, c = "#6b7280" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  Save: ({ s = 14, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
};

/* ── Toggle Switch ── */
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: 40, height: 22, borderRadius: 11, position: "relative",
        background: checked ? "#0d7c3b" : "rgba(0,0,0,0.08)",
        border: "none", cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s", flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 8, background: "#fff",
        position: "absolute", top: 3, left: checked ? 21 : 3,
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }} />
    </button>
  );
}

/* ── Number Input ── */
function NumInput({ value, onChange, unit, min = 0, max = 999, disabled }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="number" value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min} max={max} disabled={disabled}
        style={{
          width: 80, padding: "7px 10px", borderRadius: 7,
          border: "1.5px solid #e5e7eb", fontSize: 13, fontWeight: 600,
          fontFamily: "'Azeret Mono', monospace", outline: "none",
          textAlign: "center", background: disabled ? "#f3f4f6" : "#f9fafb",
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={(e) => !disabled && (e.target.style.borderColor = "#0d7c3b")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
      />
      {unit && <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{unit}</span>}
    </div>
  );
}

const Settings = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const accountType = userInfo?.accountType ?? userInfo?.account ?? "";
  const isAdmin = accountType === "admin";
  const [modalState, setModalState] = useState(false);
  const [modal, setModal] = useState("");
  const { toast } = useToast();

  // App settings via RTK Query
  const { data: settingsRes, isLoading: settingsLoading, refetch } = useGetAppSettingsQuery(undefined, { skip: !isAdmin });
  const [updateAppSettings, { isLoading: saving }] = useUpdateAppSettingsMutation();

  const serverSettings = settingsRes?.data || {};

  const [appSettings, setAppSettings] = useState({
    autoConfirmPaidOrders: true,
    autoAssignDriver: true,
    codRequiresApproval: true,
    driverSearchRadiusKm: 15,
    driverSearchExpandedRadiusKm: 25,
    driverAcceptTimeoutSeconds: 60,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(null);

  useEffect(() => {
    if (serverSettings && Object.keys(serverSettings).length > 0) {
      const s = {
        autoConfirmPaidOrders: serverSettings.autoConfirmPaidOrders ?? true,
        autoAssignDriver: serverSettings.autoAssignDriver ?? true,
        codRequiresApproval: serverSettings.codRequiresApproval ?? true,
        driverSearchRadiusKm: serverSettings.driverSearchRadiusKm ?? 15,
        driverSearchExpandedRadiusKm: serverSettings.driverSearchExpandedRadiusKm ?? 25,
        driverAcceptTimeoutSeconds: serverSettings.driverAcceptTimeoutSeconds ?? 60,
      };
      setAppSettings(s);
      setOriginalSettings(s);
    }
  }, [serverSettings]);

  const updateSetting = (key, value) => {
    setAppSettings((prev) => {
      const updated = { ...prev, [key]: value };
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalSettings));
      return updated;
    });
  };

  const saveSettings = async () => {
    try {
      const res = await updateAppSettings(appSettings).unwrap();
      if (res?.status === "Success") {
        setOriginalSettings({ ...appSettings });
        setHasChanges(false);
        toast({ title: "Settings saved", description: "App settings updated successfully" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error?.data?.message || "Failed to save settings" });
    }
  };

  const handleModal = (m) => {
    setModalState((prev) => !prev);
    setModal(m);
  };

  const initials = `${(userInfo?.firstname?.charAt(0) || "A").toUpperCase()}${(userInfo?.lastname?.charAt(0) || "").toUpperCase()}`;

  return (
    <>
      {modalState && modal === "updateAccount" && <UpdateAccount closeModal={setModalState} />}
      {modalState && modal === "changePassword" && <ChangePassword closeModal={setModalState} />}

      <div style={{ animation: "fadeIn 0.3s ease-out", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>Settings</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Manage your profile and platform settings</div>
        </div>

        {/* Profile Card */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 30,
                  background: "linear-gradient(135deg, #0d7c3b, #d97706)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 800, color: "#fff",
                  boxShadow: "0 4px 12px rgba(13,124,59,0.2)",
                }}>
                  {initials}
                </div>
                <div style={{
                  position: "absolute", bottom: -2, right: -2,
                  width: 22, height: 22, borderRadius: 11,
                  background: "#0d7c3b", border: "2.5px solid #fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IC.Shield s={10} c="#fff" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#111" }}>
                  {`${userInfo?.firstname || ""} ${userInfo?.lastname || ""}`.trim() || userInfo?.username || "Admin"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 3,
                    fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                    background: "#f0fdf4", color: "#0d7c3b", textTransform: "uppercase",
                  }}>
                    <IC.Shield s={9} c="#0d7c3b" />
                    {accountType || "admin"}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: "#9ca3af", fontFamily: "'Azeret Mono', monospace" }}>
                    ID: {userInfo?._id?.slice(-8) || "---"}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleModal("changePassword")} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "9px 14px", borderRadius: 8,
                border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer",
                fontWeight: 600, fontSize: 12, color: "#111", fontFamily: "inherit",
              }}>
                <IC.Key s={13} c="#6b7280" /> Change Password
              </button>
              <button onClick={() => handleModal("updateAccount")} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "9px 14px", borderRadius: 8,
                border: "none", background: "#0d7c3b", cursor: "pointer",
                fontWeight: 600, fontSize: 12, color: "#fff", fontFamily: "inherit",
              }}>
                <IC.Edit s={13} c="#fff" /> Update Details
              </button>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f3f4f6", padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IC.User s={13} c="#2563eb" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>Personal Information</span>
            </div>
            {[
              { l: "First Name", v: userInfo?.firstname || "-" },
              { l: "Last Name", v: userInfo?.lastname || "-" },
              { l: "Gender", v: userInfo?.gender || "-" },
              { l: "Username", v: userInfo?.username || "-" },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: i < 3 ? 10 : 0 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>{f.l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginTop: 1, textTransform: f.l === "Gender" ? "capitalize" : "none" }}>{f.v}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f3f4f6", padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IC.Mail s={13} c="#7c3aed" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>Contact Information</span>
            </div>
            {[
              { l: "Email Address", v: userInfo?.email || "-", ic: <IC.Mail s={11} c="#9ca3af" /> },
              { l: "Phone Number", v: userInfo?.phone || "-", ic: <IC.Phone s={11} c="#9ca3af" /> },
              { l: "Account Type", v: (accountType || "-").toUpperCase(), ic: <IC.Shield s={11} c="#9ca3af" /> },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: i < 2 ? 10 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {f.ic} {f.l}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginTop: 1, wordBreak: "break-all" }}>{f.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Settings — admin only */}
        {isAdmin && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f3f4f6", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IC.Gear s={15} c="#6b7280" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Platform Settings</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>Configure order handling, driver assignment, and delivery</div>
                </div>
              </div>
              {hasChanges && (
                <button onClick={saveSettings} disabled={saving} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "9px 16px", borderRadius: 8,
                  border: "none", background: "#0d7c3b", cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 700, fontSize: 12, color: "#fff", fontFamily: "inherit",
                  opacity: saving ? 0.7 : 1,
                }}>
                  {saving ? (
                    <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  ) : <IC.Save s={13} c="#fff" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>

            {settingsLoading ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#0d7c3b", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
                <div style={{ fontSize: 12, color: "#6b7280" }}>Loading settings...</div>
              </div>
            ) : (
              <div style={{ padding: "4px 0" }}>
                {/* Order Settings */}
                <div style={{ padding: "12px 20px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Order Processing</div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>Auto-confirm paid orders</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Automatically confirm orders when payment is received (card, MoMo)</div>
                    </div>
                    <Toggle checked={appSettings.autoConfirmPaidOrders} onChange={(v) => updateSetting("autoConfirmPaidOrders", v)} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>COD requires admin approval</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Cash-on-delivery orders must be manually approved before driver assignment</div>
                    </div>
                    <Toggle checked={appSettings.codRequiresApproval} onChange={(v) => updateSetting("codRequiresApproval", v)} />
                  </div>
                </div>

                <div style={{ height: 1, background: "#f3f4f6", margin: "0 20px" }} />

                {/* Driver Settings */}
                <div style={{ padding: "12px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <IC.Truck s={13} c="#9ca3af" />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>Driver & Delivery</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>Auto-assign nearest driver</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Automatically pair the nearest available driver when an order is ready</div>
                    </div>
                    <Toggle checked={appSettings.autoAssignDriver} onChange={(v) => updateSetting("autoAssignDriver", v)} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>Primary search radius</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Initial area to search for available drivers</div>
                    </div>
                    <NumInput value={appSettings.driverSearchRadiusKm} onChange={(v) => updateSetting("driverSearchRadiusKm", v)} unit="km" min={1} max={100} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>Expanded search radius</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Fallback area if no drivers found in primary radius</div>
                    </div>
                    <NumInput value={appSettings.driverSearchExpandedRadiusKm} onChange={(v) => updateSetting("driverSearchExpandedRadiusKm", v)} unit="km" min={1} max={200} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>Driver accept timeout</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Time a driver has to accept an order before it expires</div>
                    </div>
                    <NumInput value={appSettings.driverAcceptTimeoutSeconds} onChange={(v) => updateSetting("driverAcceptTimeoutSeconds", v)} unit="sec" min={10} max={300} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security tip */}
        <div style={{ background: "#f0fdf4", borderRadius: 10, border: "1px solid #dcfce7", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#0d7c3b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            <IC.Shield s={13} c="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>Security Tip</div>
            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
              For your security, change your password regularly and use a strong, unique password that combines letters, numbers, and special characters.
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  );
};

export default Settings;
