
import { api } from "../../api/baseApi";

// .........authApiSlices.ts..........//
export const dashboardSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        // .................. dashboard................//
         dashboard: builder.query<any, any>({
            query: () => ({
                url: `/dashboard?type=monthly`,
                method: "GET",
            }),
            providesTags: ["dashboard"],
        }),

    }),

});

export const {useDashboardQuery } = dashboardSlice;