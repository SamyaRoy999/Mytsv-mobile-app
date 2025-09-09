
import { api } from "../../api/baseApi";

// authApiSlices.ts
export const blogsSlices = api.injectEndpoints({
    endpoints: (builder) => ({
        blogs: builder.query<any, { page?: number }>({
            query: ({ page }) => ({
                url: `/blogs?per_page=5&page=${page}`,
                method: "GET",
            }),
            providesTags: ["blogs"],
        }),
        blogsDetail: builder.query<any, { id: any }>({
            query: ({ id }) => ({
                url: `/blogs/${id}`,
                method: "GET",
            }),
            providesTags: ["blogs"],
        }),
    }),

});

export const { useBlogsQuery, useBlogsDetailQuery, useLazyBlogsQuery } = blogsSlices;