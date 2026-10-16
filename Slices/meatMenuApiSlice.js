import { BACKEND_URL } from "@constants/constant";
import { getAuthToken } from "./authSlice";
import { apiSlice } from "./apiSlice";

const API_PATH = "/api/subscription/meat-menu";

const meatMenuRequest = async (path, { method = "GET", body } = {}, api) => {
  const token = getAuthToken(api.getState()?.auth?.userInfo);
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      credentials: "include",
      cache: "no-store",
      headers,
      ...(body === undefined
        ? {}
        : { body: isFormData ? body : JSON.stringify(body) }),
    });
    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      return {
        error: {
          status: response.status,
          data: data?.message || data?.error
            ? data
            : { ...data, message: `Request failed (${response.status})` },
        },
      };
    }

    if (
      data?.success === false ||
      (data?.status && !["Success", "success"].includes(data.status))
    ) {
      return { error: { status: "CUSTOM_ERROR", data } };
    }

    return { data };
  } catch (error) {
    return {
      error: {
        status: "FETCH_ERROR",
        error: error instanceof Error ? error.message : "Network request failed",
      },
    };
  }
};

export const meatMenuApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMeatMenuPackages: builder.query({
      queryFn: (filters = {}, api) => {
        const query = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            query.set(key, String(value));
          }
        });
        const queryString = query.toString();
        return meatMenuRequest(
          `${API_PATH}/get${queryString ? `?${queryString}` : ""}`,
          {},
          api,
        );
      },
      providesTags: ["MeatMenu"],
    }),
    createMeatMenuPackage: builder.mutation({
      queryFn: (body, api) =>
        meatMenuRequest(API_PATH, { method: "POST", body }, api),
      invalidatesTags: ["MeatMenu"],
    }),
    updateMeatMenuPackage: builder.mutation({
      queryFn: ({ id, body, ...changes }, api) =>
        meatMenuRequest(`${API_PATH}/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: body === undefined ? changes : body,
        }, api),
      invalidatesTags: ["MeatMenu"],
    }),
    deleteMeatMenuPackage: builder.mutation({
      queryFn: (id, api) =>
        meatMenuRequest(`${API_PATH}/${encodeURIComponent(id)}`, {
          method: "DELETE",
        }, api),
      invalidatesTags: ["MeatMenu"],
    }),
  }),
});

export const {
  useGetMeatMenuPackagesQuery,
  useCreateMeatMenuPackageMutation,
  useUpdateMeatMenuPackageMutation,
  useDeleteMeatMenuPackageMutation,
} = meatMenuApiSlice;
