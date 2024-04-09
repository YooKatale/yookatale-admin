import { BACKEND_URL } from '@constants/constant';
import { apiSlice } from './apiSlice';

export const partnersPageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchPartners: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/api/partners`,
        method: 'GET',
      }),
      transformResponse: (response) => {
        if (response.status === 'Success') {
          return response.data; 
        } else {
          throw new Error('Failed to fetch partners'); 
        }
      },
    }),
  }),
});

export const { useFetchPartnersQuery } = partnersPageApiSlice;
