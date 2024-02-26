import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const advertismentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAdvertisementPackage: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/advertisementpackages/create`,
        method: "POST",
        body: data,
      }),
    }),

    fetchAdvertisementPackages: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/advertisement/packages`,
        method: "GET",
      }),
    }),

    getAdvertisementPosts: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/advertisment`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateAdvertisementPackageMutation,
  useFetchAdvertisementPackagesMutation,
  useGetAdvertisementPostsMutation,
} = advertismentApiSlice;
