
import { api } from "../../api/baseApi";

// authApiSlices.ts
export const promotedApiSlices = api.injectEndpoints({
    endpoints: (builder) => ({
        promotionalCatagory: builder.query<any, any>({
            query: () => ({
                url: `/promotional-video-with-limitation?video_limit=3`,
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
        })
    }),
});

export const { usePromotionalCatagoryQuery, useAllPromotionalCatagoryQuery } = promotedApiSlices;