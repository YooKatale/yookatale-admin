"use client";

import { useDashboardDataMutation } from "@Slices/userApiSlice";
import { useVendorGetMutation } from "@Slices/vendorApiSlice";
import { usePartnerGetMutation } from "@Slices/partnersApiSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import moment from "moment/moment";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Product from "@components/product";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* ── Icons ── */
const Icons = {
  Package: ({ s = 18, c = "currentColor" }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Users: ({ s = 18, c = "currentColor" }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Cart: ({ s = 18, c = "currentColor" }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  Dollar: ({ s = 18, c = "currentColor" }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  Up: ({ s = 18, c = "currentColor" }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Clock: ({ s = 14, c = "currentColor" }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Truck: ({ s = 18, c = "currentColor" }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  Store: ({ s = 18, c = "currentColor" }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1-4h16l1 4" /><path d="M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9" />
      <path d="M9 21V9" /><path d="M3 9h18" />
    </svg>
  ),
};

export default function Home() {
  const [Dashboard, setDashboard] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [partners, setPartners] = useState([]);
  const [searchPartner, setSearchPartner] = useState("");
  const [loading, setLoading] = useState(true);

  const [fetchDashboardData] = useDashboardDataMutation();
  const [vendorGet] = useVendorGetMutation();
  const [partnerGet] = usePartnerGetMutation();

  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);
  const accountType = userInfo?.accountType ?? userInfo?.account ?? "";
  const isEditor = accountType === "editor";

  const handleDataFetch = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardData().unwrap();
      if (res?.status === "Success") {
        setDashboard(res?.data);
        setFilteredOrders(res?.data?.PendingOrders?.orders || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorFetch = async () => {
    try {
      const res = await vendorGet().unwrap();
      if (res?.status === "Success") setVendors(res?.data);
    } catch (error) { console.error("Error fetching vendor data: ", error); }
  };

  const handlePartnerFetch = async () => {
    try {
      const res = await partnerGet().unwrap();
      if (res?.status === "Success") setPartners(res?.data);
    } catch (error) { console.error("Error fetching partner data: ", error); }
  };

  useEffect(() => { handleDataFetch(); handleVendorFetch(); handlePartnerFetch(); }, []);

  useEffect(() => {
    if (!searchInput) {
      setFilteredOrders(Dashboard?.PendingOrders?.orders || []);
    } else {
      setFilteredOrders(
        (Dashboard?.PendingOrders?.orders || []).filter((order) =>
          order.deliveryAddress?.address1?.toLowerCase().includes(searchInput.toLowerCase())
        )
      );
    }
  }, [searchInput, Dashboard]);

  const processOrderData = () => {
    if (Dashboard?.ordermonthlycounts && Array.isArray(Dashboard.ordermonthlycounts)) {
      return Dashboard.ordermonthlycounts.slice(-7).map((item) => ({
        date: item.month || item._id?.month || "Month", count: item.count || 0,
      }));
    }
    const orders = Dashboard?.PendingOrders?.orders || [];
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        count: orders.filter((o) => new Date(o.createdAt).toDateString() === date.toDateString()).length,
      });
    }
    return last7Days;
  };

  const orderData = processOrderData();

  const ordersChartOptions = {
    chart: { type: "area", height: 280, toolbar: { show: false }, zoom: { enabled: false }, fontFamily: "'Bricolage Grotesque', sans-serif" },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 90, 100] } },
    colors: ["#0d7c3b"],
    xaxis: { categories: orderData.map((d) => d.date), labels: { style: { fontSize: "11px", fontWeight: 500 } } },
    yaxis: { labels: { style: { fontSize: "11px", fontFamily: "'Azeret Mono', monospace" } } },
    tooltip: { theme: "light", style: { fontSize: "12px" } },
    grid: { borderColor: "#f3f4f6", strokeDashArray: 3 },
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#0d7c3b", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>Loading dashboard...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const stats = [
    { label: "Products", value: Dashboard?.Products?.count || 0, unit: "Total", icon: <Icons.Package s={16} c="#0d7c3b" />, bg: "#f0fdf4", always: true },
    { label: "Customers", value: Dashboard?.Users?.count || 0, unit: "Registered", icon: <Icons.Users s={16} c="#2563eb" />, bg: "#eff6ff" },
    { label: "Pending Orders", value: Dashboard?.PendingOrders?.count || 0, unit: "Awaiting", icon: <Icons.Cart s={16} c="#d97706" />, bg: "#fffbeb" },
    { label: "Revenue", value: `UGX ${(Dashboard?.AllTimeOrders?.allorderscashvalue || 0).toLocaleString()}`, unit: "All-time", icon: <Icons.Dollar s={16} c="#7c3aed" />, bg: "#f5f3ff" },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#111", marginTop: 2 }}>Dashboard Overview</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f0fdf4", border: "1px solid #dcfce7", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "#0d7c3b" }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: "#22c55e" }} /> Live
          </span>
          <span style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
            <Icons.Clock s={11} c="#9ca3af" /> {moment().format("MMM DD, YYYY")}
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: isEditor ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 20 }}>
        {stats.filter((s) => s.always || !isEditor).map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              {s.icon}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#111", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>{s.unit} · {s.label}</div>
          </div>
        ))}
      </div>

      {/* Orders Trend */}
      {!isEditor && orderData.length > 0 && orderData.some((d) => d.count > 0) && (
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f3f4f6", marginBottom: 20, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Orders Trend</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                {Dashboard?.ordermonthlycounts ? "Monthly statistics" : "Last 7 days"}
              </div>
            </div>
            <Icons.Up s={16} c="#0d7c3b" />
          </div>
          <div style={{ padding: "0 8px" }}>
            <Chart options={ordersChartOptions} series={[{ name: "Orders", data: orderData.map((d) => d.count) }]} type="area" height={280} />
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {!isEditor && (
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f3f4f6", marginBottom: 20 }}>
          <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, borderBottom: "1px solid #f3f4f6" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Recent Orders</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>Latest customer orders</div>
            </div>
            <input
              placeholder="Search by location..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #e5e7eb", fontSize: 12, outline: "none", maxWidth: 220, background: "#f9fafb", fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "#0d7c3b")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
          <div style={{ padding: "0 16px 12px", overflowX: "auto" }}>
            {filteredOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Customer", "Items", "Payment", "Total", "Date", "Address"].map((h) => (
                      <TableHead key={h} style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.slice(0, 10).map((order, i) => (
                    <TableRow key={i}>
                      <TableCell style={{ fontWeight: 600, fontSize: 12, color: "#111" }}>{order?.user?.firstname} {order?.user?.lastname}</TableCell>
                      <TableCell style={{ fontSize: 12 }}>{order?.productItems}</TableCell>
                      <TableCell>
                        <span style={{
                          display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                          background: order?.paymentMethod === "card" ? "#eff6ff" : order?.paymentMethod === "mobileMoney" ? "#f0fdf4" : "#fffbeb",
                          color: order?.paymentMethod === "card" ? "#2563eb" : order?.paymentMethod === "mobileMoney" ? "#0d7c3b" : "#d97706",
                        }}>{order?.paymentMethod || order?.payment?.paymentMethod || "N/A"}</span>
                      </TableCell>
                      <TableCell style={{ fontWeight: 700, fontSize: 12, color: "#0d7c3b" }}>UGX {order?.total?.toLocaleString()}</TableCell>
                      <TableCell style={{ fontSize: 11, color: "#6b7280" }}>{moment(order?.createdAt).fromNow()}</TableCell>
                      <TableCell style={{ fontSize: 11, color: "#6b7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order?.deliveryAddress?.address1}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 16px" }}>
                <Icons.Cart s={32} c="#d1d5db" />
                <div style={{ fontWeight: 600, fontSize: 13, color: "#111", marginTop: 8 }}>No orders found</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products */}
      <div style={{ marginBottom: 20 }}><Product /></div>

      {/* Vendors & Partners */}
      <div style={{ display: "grid", gridTemplateColumns: isEditor ? "1fr" : "repeat(auto-fit, minmax(380px, 1fr))", gap: 12 }}>
        {!isEditor && vendors.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f3f4f6" }}>
            <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.Store s={13} c="#d97706" /></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Vendors</div>
              </div>
              <input placeholder="Search..." value={searchVendor} onChange={(e) => setSearchVendor(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 11, outline: "none", maxWidth: 180, background: "#f9fafb", fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.borderColor = "#0d7c3b")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
            </div>
            <div style={{ padding: "0 16px 12px", overflowX: "auto" }}>
              <Table>
                <TableHeader><TableRow>
                  {["Name", "Address", "Phone", "Joined"].map((h) => <TableHead key={h} style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>{h}</TableHead>)}
                </TableRow></TableHeader>
                <TableBody>
                  {vendors.filter((v) => !searchVendor || v.address?.toLowerCase().includes(searchVendor.toLowerCase())).slice(0, 5).map((v, i) => (
                    <TableRow key={i}>
                      <TableCell style={{ fontWeight: 600, fontSize: 12, color: "#111" }}>{v.name}</TableCell>
                      <TableCell style={{ fontSize: 11, color: "#6b7280" }}>{v.address}</TableCell>
                      <TableCell style={{ fontSize: 11 }}>{v.phone}</TableCell>
                      <TableCell style={{ fontSize: 11, color: "#6b7280" }}>{moment(v?.createdAt).fromNow()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {partners.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f3f4f6" }}>
            <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.Truck s={13} c="#0d7c3b" /></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Delivery Partners</div>
              </div>
              <input placeholder="Search..." value={searchPartner} onChange={(e) => setSearchPartner(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 11, outline: "none", maxWidth: 180, background: "#f9fafb", fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.borderColor = "#0d7c3b")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
            </div>
            <div style={{ padding: "0 16px 12px", overflowX: "auto" }}>
              <Table>
                <TableHeader><TableRow>
                  {["Name", "Location", "Phone", "Joined"].map((h) => <TableHead key={h} style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>{h}</TableHead>)}
                </TableRow></TableHeader>
                <TableBody>
                  {partners.filter((p) => !searchPartner || p.location?.toLowerCase().includes(searchPartner.toLowerCase())).slice(0, 5).map((p, i) => (
                    <TableRow key={i}>
                      <TableCell style={{ fontWeight: 600, fontSize: 12, color: "#111" }}>{p.fullname || "N/A"}</TableCell>
                      <TableCell style={{ fontSize: 11, color: "#6b7280" }}>{p.location || "N/A"}</TableCell>
                      <TableCell style={{ fontSize: 11 }}>{p.phone || "N/A"}</TableCell>
                      <TableCell style={{ fontSize: 11, color: "#6b7280" }}>{moment(p?.createdAt).fromNow()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
