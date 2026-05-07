import { api } from "../../api/baseApi";

//................ uploadVideoSices..................//

export const uploadVideoSices = api.injectEndpoints({
  endpoints: (builder) => ({
    upload_video: builder.mutation<any, any>({
      query: (data) => ({
        url: `/videos`,
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: data,
      }),
      invalidatesTags: ["uploadVideo"],
    }),

    categories: builder.query<any, any>({
      query: () => ({
        url: "/categories?per_page=1500",
        method: "GET",
      }),
      providesTags: ["uploadVideo"],
      transformResponse: (response: any) => {
        const sorted = [...(response?.data?.data || [])].sort(
          (a: any, b: any) => a.name.localeCompare(b.name),
        );
        return {
          ...response,
          data: {
            ...response?.data,
            data: sorted,
          },
        };
      },
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
  }),
});

export const {
  useUpload_videoMutation,
  useCategoriesQuery,
  useStateGetQuery,
  useCityGetQuery,
} = uploadVideoSices;
