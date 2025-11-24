import { api } from "../../api/baseApi";

// authApiSlices.ts
export const videoDetailsSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    videodetail: builder.query<any, string>({
      query: (slug) => ({
        url: `/videos/${slug}`,
        method: "GET",
      }),
      providesTags: ["singleVideo"],
    }),
    watchVideo: builder.mutation<any, { id: any }>({
      query: (id) => ({
        url: `/watch-history`,
        method: "POST",
        body: { video_id: id },
      }),
      invalidatesTags: ["singleVideo"],
    }),
    likeVideo: builder.mutation<any, { action: string; video_id: any }>({
      query: (data) => ({
        url: `/add_like_dislike`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["singleVideo"],
    }),

    //............. comment .................//

    comments: builder.query<
      any[],
      { video_id: any; page?: number; per_page?: number }
    >({
      query: ({ video_id }) => ({
        url: `/comments?per_page=500&video_id=${video_id}`,
        // params: { video_id },
      }),
      providesTags: ["singleVideo"],
    }),

    commentsPost: builder.mutation<any, { video_id: number; comment: string }>({
      query: (data) => ({
        url: `/comments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["singleVideo"],
    }),
    comment_reaction: builder.mutation<any, any>({
      query: (data) => ({
        url: `/add-remove-comment-reaction`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["singleVideo"],
    }),
    commentDelete: builder.mutation<any, any>({
      query: (id) => ({
        url: `/comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["singleVideo"],
    }),

    //............. replies .................//

    replies: builder.query<any, any>({
      query: ({ comment_id }) => ({
        url: "/replies",
        params: { comment_id },
      }),
      providesTags: ["singleVideo"],
    }),
    replies_reaction: builder.mutation<any, any>({
      query: (data) => ({
        url: `/add-remove-reply-reaction`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["singleVideo"],
    }),
    repliesPost: builder.mutation<any, { video_id: number; comment: string }>({
      query: (data) => ({
        url: `/replies`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["singleVideo"],
    }),
    reportPost: builder.mutation<any, any>({
      query: (data) => ({
        url: `/add-report`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["singleVideo"],
    }),
  }),
});

export const {
  useVideodetailQuery,
  useLikeVideoMutation,
  useWatchVideoMutation,
  useCommentsQuery,
  useLazyCommentsQuery,
  useCommentsPostMutation,
  useComment_reactionMutation,
  useRepliesQuery,
  useReplies_reactionMutation,
  useRepliesPostMutation,
  useReportPostMutation,
  useCommentDeleteMutation,
} = videoDetailsSlice;
