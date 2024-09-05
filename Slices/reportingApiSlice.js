import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const reportingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/reporting/task/new`,
        method: "POST",
        body: data
      }),
    }),
    getTask: builder.mutation({
        query: () => ({
          url: `${BACKEND_URL}/reporting/tasks`,
          method: "GET",
        }),
      }),
      updateTask: builder.mutation({
        query: (data) => ({
          url: `${BACKEND_URL}/reporting/tasks/${data.id}`,
          method: "PUT",
          body: data.data
        }),
      }),
      deleteTask: builder.mutation({
        query: (id) => ({
          url: `${BACKEND_URL}/reporting/tasks/${id}`,
          method: "DELETE",
        }),
      }),
      submitForReview: builder.mutation({
        query: (data) => ({
          url: `${BACKEND_URL}/reporting/tasks/${data.id}`,
          method: "PUT",
          body: data.data
        }),
      }),
  }),

});

export const { useCreateTaskMutation, useGetTaskMutation, 
    useUpdateTaskMutation, useDeleteTaskMutation, useSubmitForReviewMutation

} = reportingApiSlice;
