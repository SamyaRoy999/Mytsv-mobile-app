
import { api } from "../../api/baseApi";

// authApiSlices.ts
export const myvideoSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        myVideo: builder.query<any, any>({
            query: ({page}) => ({
                url: `/videos?per_page=3&page=${page}`,
                method: "GET",
            }),
            providesTags: ["home"],
        }),
        my_videos_details: builder.query<any, { id: any }>({
            query: ({ id }) => ({
                url: `/videos/${id}`,
                method: "GET",
            }),
            providesTags: ["home"],
        }),
        updateVideo: builder.mutation<any, any>({
            query: ({ id, data }) => ({
                url: `/videos/${id}`,
                method: "POST",
                body: data,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
        }),
        myProfile: builder.query<any, any>({
            query: () => ({
                url: `/profile`,
                method: "GET",
            }),
            providesTags: ["home"],
        }),
    }),
});

export const { useMyVideoQuery, useLazyMyVideoQuery, useMy_videos_detailsQuery, useUpdateVideoMutation, useMyProfileQuery } = myvideoSlice;