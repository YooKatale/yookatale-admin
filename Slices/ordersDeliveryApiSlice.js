import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const ordersDeliveryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    ordersAll: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/api/products/orders/`,
        method: "GET",
      }),
      transformResponse: (res) => (res?.status === "Success" ? res.data : []),
    }),
    adminOrders: builder.query({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params.status) q.set("status", params.status);
        if (params.page) q.set("page", params.page);
        if (params.limit) q.set("limit", params.limit);
        return {
          url: `${BACKEND_URL}/api/orders/admin/all${q.toString() ? `?${q}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (res) => (res?.status === "Success" ? res.data : { orders: [], total: 0, stats: {} }),
    }),
    orderStats: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/api/orders/admin/stats`,
        method: "GET",
      }),
      transformResponse: (res) => (res?.status === "Success" ? res.data : {}),
    }),
    approveOrder: builder.mutation({
      query: ({ orderId, notes }) => ({
        url: `${BACKEND_URL}/api/orders/${orderId}/approve`,
        method: "PATCH",
        body: { notes },
      }),
    }),
    assignDriverToOrder: builder.mutation({
      query: ({ orderId, driverId }) => ({
        url: `${BACKEND_URL}/api/orders/${orderId}/assign-driver`,
        method: "PATCH",
        body: { driverId },
      }),
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status, note }) => ({
        url: `${BACKEND_URL}/api/orders/${orderId}/update-status`,
        method: "PATCH",
        body: { status, note },
      }),
    }),
    adminCancelOrder: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `${BACKEND_URL}/api/orders/${orderId}/admin-cancel`,
        method: "PATCH",
        body: { reason },
      }),
    }),
    adminDeleteOrder: builder.mutation({
      query: ({ orderId }) => ({
        url: `${BACKEND_URL}/api/orders/${orderId}/admin-delete`,
        method: "DELETE",
      }),
    }),
    getOrderDeliveryTracking: builder.query({
      query: ({ orderId }) => ({
        url: `${BACKEND_URL}/api/delivery/order/${orderId}`,
        method: "GET",
      }),
      transformResponse: (res) => (res?.status === "Success" ? res.data : {}),
    }),
    openOrders: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/api/delivery/orders/open`,
        method: "GET",
      }),
      transformResponse: (res) => (res?.status === "Success" ? res.data : []),
    }),
    driversByLocation: builder.query({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params.lat != null) q.set("lat", params.lat);
        if (params.lng != null) q.set("lng", params.lng);
        return {
          url: `${BACKEND_URL}/api/partners/drivers${q.toString() ? `?${q}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (res) => (res?.status === "Success" ? res.data : []),
    }),
    adminDrivers: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/api/driver/admin/all`,
        method: "GET",
      }),
      transformResponse: (res) => (res?.status === "Success" ? res.data : []),
    }),
    adminVendors: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/api/vendor/admin/all`,
        method: "GET",
      }),
      transformResponse: (res) => (res?.status === "Success" ? res.data : []),
    }),
    runDriverPayouts: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/partners/drivers/payouts/run`,
        method: "POST",
      }),
    }),
    runVendorPayouts: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/vendor/payouts/run`,
        method: "POST",
      }),
    }),
    deliveryAccept: builder.mutation({
      query: (body) => ({
        url: `${BACKEND_URL}/api/delivery/accept`,
        method: "POST",
        body,
      }),
    }),
    orderStatusUpdate: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `${BACKEND_URL}/api/products/order/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
    }),
    deliveryAssign: builder.mutation({
      query: (body) => ({
        url: `${BACKEND_URL}/api/delivery/assign`,
        method: "POST",
        body,
      }),
    }),
    setDriverCredentials: builder.mutation({
      query: ({ driverId, password, sendEmail }) => ({
        url: `${BACKEND_URL}/admin/drivers/${driverId}/set-credentials`,
        method: "PATCH",
        body: { password, sendEmail },
      }),
    }),
  }),
});

export const {
  useOrdersAllQuery,
  useAdminOrdersQuery,
  useOrderStatsQuery,
  useApproveOrderMutation,
  useAssignDriverToOrderMutation,
  useUpdateOrderStatusMutation,
  useAdminCancelOrderMutation,
  useAdminDeleteOrderMutation,
  useGetOrderDeliveryTrackingQuery,
  useOpenOrdersQuery,
  useDriversByLocationQuery,
  useAdminDriversQuery,
  useAdminVendorsQuery,
  useRunDriverPayoutsMutation,
  useRunVendorPayoutsMutation,
  useDeliveryAcceptMutation,
  useOrderStatusUpdateMutation,
  useDeliveryAssignMutation,
  useSetDriverCredentialsMutation,
} = ordersDeliveryApiSlice;