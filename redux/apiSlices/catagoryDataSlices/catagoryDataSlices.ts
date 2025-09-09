
import { api } from "../../api/baseApi";

// authApiSlices.ts
export const homeApiSlices = api.injectEndpoints({
    endpoints: (builder) => ({
        catagoryDetails: builder.query<any, { id: any; page?: number }>({
            query: ({ id, page = 1 }) => ({
                url: `/get-related-video/${id}?page=${page}&per_page=5`,
                method: "GET",
            }),
            providesTags: ["catagoryDetails"],
        }),
    }),
});

export const { useCatagoryDetailsQuery, useLazyCatagoryDetailsQuery } = homeApiSlices;