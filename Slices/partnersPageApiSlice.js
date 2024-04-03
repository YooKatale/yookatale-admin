import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const partnersPageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    partnerGet: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/api/partners`,
        method: "GET",
      }),
      onError: (error) => {
        console.error('Error fetching partners:', error);
        throw error;
      },
    }),
  }),
});

export const {
  usePartnerGetQuery,
} = partnersPageApiSlice;






// import { BACKEND_URL } from "@constants/constant";
// import { apiSlice } from "./apiSlice";

// export const partnersPageApiSlice = apiSlice.injectEndpoints({
//   endpoints: (builder) => ({
//     partnerGet: builder.query({
//       query: () => ({
//         url: `${BACKEND_URL}/api/partners`,
//         method: "GET",
//       }),
//       async onQueryStarted(_, { dispatch, queryFulfilled, queryRejected }) {
//         try {
//           const response = await fetch(`${BACKEND_URL}/api/partners`, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//           });

//           if (!response.ok) {
//             throw new Error('Failed to fetch partners');
//           }

//           const data = await response.json();
//           dispatch(queryFulfilled(data));
//         } catch (error) {
//           dispatch(queryRejected(error));
//         }
//       },
//     }),
//   }),
// });

// export const {
//   usePartnerGetQuery,
// } = partnersPageApiSlice;
