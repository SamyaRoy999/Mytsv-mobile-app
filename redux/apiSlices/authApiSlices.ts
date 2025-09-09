import { api } from "../api/baseApi";

// authApiSlices.ts
export const authSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        registerUser: builder.mutation<any, any>({
            query: (data) => ({
                url: `/auth/register`,
                method: "POST",
                body: data,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }),
            invalidatesTags: ["user","account"],
        }),
        verifyOtp: builder.mutation<any, { email: string; otp: string }>({
            query: (data) => ({
                url: `/auth/otp-verification`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["user","account"],
        }),
        loginUser: builder.mutation<any, any>({
            query: (data) => ({
                url: `/auth/login`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["user","account"],
        }),
        forgotPassword: builder.mutation<any, any>({
            query: (data) => ({
                url: `/auth/forget-password`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["user"],
        }),
        resetPassword: builder.mutation<any, any>({
            query: (data) => ({
                url: `/auth/reset-password`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["user"],
        }),
        socialLogin: builder.mutation<any, any>({
            query: (data) => ({
                url: `/auth/social-login`,
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: data,
            }),
            invalidatesTags: ["user"],
        }),

    }),
    overrideExisting: true
});

export const { useRegisterUserMutation, useVerifyOtpMutation, useLoginUserMutation, useForgotPasswordMutation, useResetPasswordMutation, useSocialLoginMutation } = authSlice;