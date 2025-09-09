import { api } from "../../api/baseApi";

//................ uploadVideoSices..................//

export const paymentSlice = api.injectEndpoints({

    endpoints: (builder) => ({
        payment: builder.mutation<any, any>({
            query: (data) => ({
                url: `/payment-intent`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["uploadVideo"],
        }),
        paymentSuccess: builder.mutation<any, any>({
            query: (data) => ({
                url: `/payment-success`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["uploadVideo"],
        }),

    })
});

export const {
    usePaymentMutation,
    usePaymentSuccessMutation
} = paymentSlice;