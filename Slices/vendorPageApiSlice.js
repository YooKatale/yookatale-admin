import { BACKEND_URL } from '@constants/constant';
import { apiSlice } from './apiSlice';

export const vendorPageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    vendorGet: builder.query({
      queryFn: async () => {
        const response = await fetch(`${BACKEND_URL}/api/vendors`);
        if (!response.ok) {
          throw new Error('Failed to fetch vendors');
        }
        return response.json();
      },
    }),
  }),
});

export const { useVendorGetQuery } = vendorPageApiSlice;
