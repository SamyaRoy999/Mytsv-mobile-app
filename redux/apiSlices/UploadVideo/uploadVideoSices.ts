import { api } from "../../api/baseApi";

//................ uploadVideoSices..................//

export const uploadVideoSices = api.injectEndpoints({

    endpoints: (builder) => ({
        upload_video: builder.mutation<any, any>({
            query: (data) => ({
                url: `/videos`,
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: data,

            }),
            invalidatesTags: ["uploadVideo"],
        }),

        categories: builder.query<any, any>({
            query: () => ({
                url: "/categories?per_page=500",
                method: "GET",
            }),
            providesTags: ["uploadVideo"],
        }),
        stateGet: builder.query<any, any>({
            query: () => ({
                url: "/states",
                method: "GET",
            }),
            providesTags: ["uploadVideo"],
        }),
        cityGet: builder.query<any, any>({
            query: (id) => ({
                url: `/cities/${id}`,
                method: "GET",
            }),
            providesTags: ["uploadVideo"],
        }),
    })
});

export const {
    useUpload_videoMutation,
    useCategoriesQuery,
    useStateGetQuery,
    useCityGetQuery
} = uploadVideoSices;