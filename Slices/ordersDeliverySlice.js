import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const ordersDeliveryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchAllOrders: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/api/products/orders/`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (response.status === "Success") return response.data || [];
        throw new Error(response.message || "Failed to fetch orders");
      },
      providesTags: ["Orders"],
    }),
    fetchOpenOrders: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/api/delivery/orders/open`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (response.status === "Success") return response.data || [];
        throw new Error(response.message || "Failed to fetch open orders");
      },
      providesTags: ["Orders"],
    }),
    fetchAllDeliveries: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/api/delivery`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (response.status === "Success") return response.data || [];
        throw new Error(response.message || "Failed to fetch deliveries");
      },
    }),
    fetchDrivers: builder.query({
      query: (params = {}) => {
        const { lat, lng } = params;
        const q = lat != null && lng != null ? `?lat=${lat}&lng=${lng}` : "";
        return {
          url: `${BACKEND_URL}/api/partners/drivers${q}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        if (response.status === "Success") return response.data || [];
        throw new Error(response.message || "Failed to fetch drivers");
      },
    }),
    assignDelivery: builder.mutation({
      query: (body) => ({
        url: `${BACKEND_URL}/api/delivery/assign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders", "Deliveries"],
    }),
    acceptDelivery: builder.mutation({
      query: (body) => ({
        url: `${BACKEND_URL}/api/delivery/accept`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders", "Deliveries"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `${BACKEND_URL}/api/products/order/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Orders"],
    }),
    updateDeliveryStatus: builder.mutation({
      query: ({ deliveryId, status }) => ({
        url: `${BACKEND_URL}/api/delivery/${deliveryId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Orders", "Deliveries"],
    }),
  }),
});

export const {
  useFetchAllOrdersQuery,
  useFetchOpenOrdersQuery,
  useFetchAllDeliveriesQuery,
  useFetchDriversQuery,
  useAssignDeliveryMutation,
  useAcceptDeliveryMutation,
  useUpdateOrderStatusMutation,
  useUpdateDeliveryStatusMutation,
} = ordersDeliveryApiSlice;
