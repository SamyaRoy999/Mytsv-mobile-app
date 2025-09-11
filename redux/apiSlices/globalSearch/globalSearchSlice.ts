import { api } from "../../api/baseApi";

// authApiSlices.ts
export const globalSearchSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    globalSearch: builder.query<any, any>({
      query: ({ city, state, service, search }) => {
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        if (city) params.append("city", city);
        if (service) params.append("service", service);
        if (state) params.append("state", state);

        return {
          url: `/global-search-videos?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["globalSearch"],
    }),
  }),
});

export const { useLazyGlobalSearchQuery } = globalSearchSlice;
