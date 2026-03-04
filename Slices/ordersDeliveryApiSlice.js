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
        const query = q.toString();
        return {
          url: `${BACKEND_URL}/api/partners/drivers${query ? `?${query}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (res) => (res?.status === "Success" ? res.data : []),
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
  }),
});

export const {
  useOrdersAllQuery,
  useOpenOrdersQuery,
  useDriversByLocationQuery,
  useDeliveryAcceptMutation,
  useOrderStatusUpdateMutation,
  useDeliveryAssignMutation,
} = ordersDeliveryApiSlice;
