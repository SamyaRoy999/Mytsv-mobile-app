import { api } from "../../api/baseApi";

// authApiSlices.ts
export const globalSearchSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        globalSearch: builder.query<any, any>({
            query: ({ city, state, service,hashtag }) => ({
                url: `/global-search-videos?search=${hashtag}&city=${city}&service=${service}&state=${state}`,
                method: "GET",
            }),
            providesTags: ["globalSearch"],
        }),
    }),
});

export const { useLazyGlobalSearchQuery } = globalSearchSlice;