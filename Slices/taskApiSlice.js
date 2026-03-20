import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.mutation({
      query: () => ({ url: `${BACKEND_URL}/admin/tasks`, method: "GET" }),
    }),
    createTask: builder.mutation({
      query: (data) => ({ url: `${BACKEND_URL}/admin/tasks`, method: "POST", body: data }),
    }),
    updateTask: builder.mutation({
      query: ({ id, ...data }) => ({ url: `${BACKEND_URL}/admin/tasks/${id}`, method: "PUT", body: data }),
    }),
    deleteTask: builder.mutation({
      query: (id) => ({ url: `${BACKEND_URL}/admin/tasks/${id}`, method: "DELETE" }),
    }),
    getTeamMembers: builder.mutation({
      query: () => ({ url: `${BACKEND_URL}/admin/team/members`, method: "GET" }),
    }),
    getVisitStats: builder.mutation({
      query: (days = 30) => ({ url: `${BACKEND_URL}/admin/visits/stats?days=${days}`, method: "GET" }),
    }),
  }),
});

export const {
  useGetTasksMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTeamMembersMutation,
  useGetVisitStatsMutation,
} = taskApiSlice;
