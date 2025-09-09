import { api } from "../../api/baseApi";

// authApiSlices.ts
export const promotedApiSlices = api.injectEndpoints({
  endpoints: (builder) => ({
    promotionalCatagory: builder.query<any, any>({
      query: ({ page }) => ({
        url: `/promotional-video-with-limitation?video_limit=1&page=${page}`,
        method: "GET",
      }),
      providesTags: ["promotion"],
    }),
    allPromotionalCatagory: builder.query<any, any>({
      query: ({ id }) => ({
        url: `/get-promoted-related-video/${id}`,
        method: "GET",
      }),
      providesTags: ["promotion"],
    }),
  }),
});

export const {
  usePromotionalCatagoryQuery,
  useLazyPromotionalCatagoryQuery,
  useAllPromotionalCatagoryQuery,
} = promotedApiSlices;
