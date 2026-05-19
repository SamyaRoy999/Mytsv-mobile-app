import { api } from "../../api/baseApi";

// authApiSlices.ts
export const homeApiSlices = api.injectEndpoints({
  endpoints: (builder) => ({
    banner: builder.query<any, any>({
      query: () => ({
        url: `/banners?per_page=7`,
        method: "GET",
      }),
      providesTags: ["home"],
    }),
    promotedVideo: builder.query<any, { category_id: any }>({
      query: ({ category_id }) => ({
        url: `/get-promotional-video?category_id=${category_id}`,
        method: "GET",
      }),
      providesTags: ["home"],
    }),
    promotedVideoHome: builder.query<any, any>({
      query: () => ({
        url: `/get-promotional-video?per_page=10`,
        method: "GET",
      }),
      providesTags: ["home"],
    }),

    caragoryVideos: builder.query<any, any>({
      query: ({ page }) => ({
        url: `/home-video?page=${page}&video_limit=3`,
        method: "GET",
      }),
      providesTags: ["home"],
    }),

    //  shear price

    priceGetAll: builder.query<any, any>({
      query: () => ({
        url: `/get-price`,
        method: "GET",
      }),
      providesTags: ["uploadVideo"],
    }),

    // In your homeApiSlices.ts
    channelProfile: builder.query<any, any>({
      query: ({ id, page = 1, per_page = 6 }) => ({
        url: `/channel-details/${id}?per_page=${per_page}&page=${page}`,
        method: "GET",
      }),
      providesTags: ["uploadVideo"],
    }),
    homePage: builder.query<any, any>({
      query: ({ id, page = 1 }) => {
        let url = `/all-videos?per_page=10&page=${page}
        &device_type=app`;
        if (id) {
          url += `&category_id=${id}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["uploadVideo"],
    }),
  }),
});

export const {
  useBannerQuery,
  usePromotedVideoQuery,
  useCaragoryVideosQuery,
  useLazyCaragoryVideosQuery,
  usePromotedVideoHomeQuery,
  usePriceGetAllQuery,
  useChannelProfileQuery,
  useLazyChannelProfileQuery,
  useLazyHomePageQuery,
} = homeApiSlices;
