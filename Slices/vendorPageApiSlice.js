import { BACKEND_URL } from '@constants/constant';
import { apiSlice } from './apiSlice';

export const vendorPageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchVendors: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/api/vendors`,
        method: 'GET',
      }),
      transformResponse: (response) => {
        if (response.status === 'Success') {
          return response.data;
        } else {
          throw new Error('Failed to fetch vendors');
        }
      },
    }),
    activateVendor: builder.mutation({
      query: (vendorId) => ({
        url: `${BACKEND_URL}/api/vendors/activate/${vendorId}`,
        method: 'POST',
      }),
      transformResponse: (response) => {
        if (response.status === 'Success') {
          return response.data;
        } else {
          throw new Error('Failed to activate vendor');
        }
      },
    }),
  }),
});

export const { useFetchVendorsQuery, useActivateVendorMutation } = vendorPageApiSlice;
