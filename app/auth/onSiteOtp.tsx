import { ImgLogo } from "@/assets/images/images";
import { IconBackAuth, IconForgetNest } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { usePriceGetAllQuery } from '@/redux/apiSlices/Home/homeApiSlices';
import { useVerifyOtpMutation } from "@/redux/apiSlices/authApiSlices";
import { usePaymentMutation, usePaymentSuccessMutation } from '@/redux/apiSlices/payment/paymentSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStripe } from '@stripe/stripe-react-native';
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";
import { OtpInput } from "react-native-otp-entry";
import { SvgXml } from "react-native-svg";

const onSiteOtp = () => {
    const [verifyOtp] = useVerifyOtpMutation();
    const [payment] = usePaymentMutation();
    const [paymentSuccess] = usePaymentSuccessMutation();
    const { data: priceOnSide } = usePriceGetAllQuery({});
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [isProcessing, setIsProcessing] = useState(false);
    const { email, userId, amount } = useLocalSearchParams();

    const handleSetupInitialPayment = async () => {
        try {
            const paymentData = {
                reason: "Onsite account creation",
                amount: amount || priceOnSide?.data?.onsite_account_creation || "0",
                payment_method: "pm_card_visa",
            }

            const res = await payment(paymentData).unwrap();
            const successData = {
                id: res?.data?.id,
                amount: res?.data?.amount,
                reason: "Onsite account creation"
            };

            const client_secret = res?.data?.client_secret;
            if (!client_secret) throw new Error("Client secret not found in response");

            const { error } = await initPaymentSheet({
                merchantDisplayName: "MyTSV App",
                paymentIntentClientSecret: client_secret,
            });

            if (error) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: error?.message,
                    autoClose: 2000,
                });
            } else {
                await checkout(successData); // Pass successData directly
            }
        } catch (error) {

            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: (error as any)?.message || "Payment setup failed",
                autoClose: 2000,
            });
        }
    };

    const checkout = async (paymentData: any) => {
        setIsProcessing(true);
        try {
            const { error } = await presentPaymentSheet();

            if (error) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: error?.message,
                    autoClose: 2000,
                });
                return;
            }

            const data = {
                user_id: userId,
                payment_intent_id: paymentData.id,
                reason: paymentData.reason,
                amount: paymentData.amount
            }

            const res = await paymentSuccess(data).unwrap();

            if (res?.status) {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    textBody: 'Payment successful! Account created successfully.',
                    autoClose: 2000,
                });
                // Navigate to home or success screen
                router.push('/home/(tabs)/landingPage');
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: (error as any)?.message || "Payment processing failed",
                autoClose: 2000,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOtpVerification = async (otp: string) => {
        try {
            const data = {
                email: email as string,
                otp,
            }
            const res = await verifyOtp(data).unwrap();

            if (res.status) {
                // Store the token in AsyncStorage
                if (res.data?.access_token) {
                    await AsyncStorage.setItem('token', res.data.access_token);
                }

                // After successful OTP verification, initiate payment
                await handleSetupInitialPayment();
            } else {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Error',
                    textBody: res?.message || "OTP verification failed",
                });
            }
        } catch (error: any) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Error',
                textBody: error?.data?.message || error?.message || "OTP verification failed",
            });
        }
    };

    return (
        <KeyboardAvoidingView style={tw`flex-1 bg-secondary`}>
            <ScrollView showsVerticalScrollIndicator={false} style={tw``}>
                <AlertNotificationRoot>
                    <View style={tw`flex-row justify-end`}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <SvgXml xml={IconBackAuth} />
                        </TouchableOpacity>
                        <SvgXml xml={IconForgetNest} />
                    </View>
                    <View
                        style={tw`flex-col justify-center w-full pt-44 items-center my-11`}
                    >
                        <Text style={tw`font-poppinsBold text-3xl  text-primaryText`}>
                            Verify Code
                        </Text>
                        <Text
                            style={tw`text-primaryText font-poppins text-center text-sm py-2 px-6`}
                        >
                            Enter the 6 digit code that we sent you to your provided email.
                        </Text>
                    </View>
                    <View style={tw`bg-primary w-full h-full rounded-t-[40px] `}>
                        <View style={tw`flex-row justify-center `}>
                            <Image
                                source={ImgLogo}
                                style={{ height: 100, width: 162, objectFit: "contain" }}
                            />
                        </View>

                        {/* OTP Input */}
                        <View>
                            <View style={tw`py-3 px-6 mb-2`}>
                                <OtpInput
                                    numberOfDigits={6}
                                    onFilled={handleOtpVerification}
                                    theme={{
                                        pinCodeContainerStyle: {
                                            width: 50,
                                            height: 50,
                                            borderWidth: 1,
                                            borderRadius: 9999,
                                        },
                                        pinCodeTextStyle: {
                                            fontSize: 20,
                                            fontWeight: "bold",
                                        },
                                    }}
                                />
                            </View>
                        </View>

                        {isProcessing && (
                            <View style={tw`flex-row justify-center items-center my-4`}>
                                <ActivityIndicator size="large" color="#0000ff" />
                                <Text style={tw`ml-2 font-poppins`}>Processing payment...</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={tw`bg-secondary rounded-full mx-6 mt-4`}
                            onPress={() => handleOtpVerification}
                        >
                            <Text
                                style={tw`text-primary  text-center  text-lg py-4  font-poppinsBold`}
                            >
                                Resend Code
                            </Text>
                        </TouchableOpacity>
                    </View>
                </AlertNotificationRoot>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default onSiteOtp;