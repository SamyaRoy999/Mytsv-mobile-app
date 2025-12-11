import { IconPayment } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { usePriceGetAllQuery } from "@/redux/apiSlices/Home/homeApiSlices";
import { useMyProfileQuery } from "@/redux/apiSlices/MyVideo/myvideoSlice";
import {
  usePaymentMutation,
  usePaymentSuccessMutation,
} from "@/redux/apiSlices/payment/paymentSlice";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { SvgXml } from "react-native-svg";

const paymentOnside = () => {
  const [payment] = usePaymentMutation();
  const [paymentSuccess] = usePaymentSuccessMutation();
  const { data: priceOnSide } = usePriceGetAllQuery({});
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);
  // const { email, userId, amount } = useLocalSearchParams();
  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useMyProfileQuery({});
  const userId = userData?.data?.id;
  const handleSetupInitialPayment = async () => {
    try {
      const paymentData = {
        reason: "Onsite account creation",
        amount: priceOnSide?.data?.onsite_account_creation || "0",
        // payment_method: "pm_card_visa",
      };

      const res = await payment(paymentData).unwrap();

      const successData = {
        id: res?.data?.id,
        amount: res?.data?.amount,
        reason: "Onsite account creation",
      };

      const client_secret = res?.data?.client_secret;
      if (!client_secret)
        throw new Error("Client secret not found in response");

      const { error } = await initPaymentSheet({
        merchantDisplayName: "MyTSV App",
        paymentIntentClientSecret: client_secret,
      });

      if (error) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: error?.message,
          autoClose: 2000,
        });
      } else {
        await checkout(successData); // Pass successData directly
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
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
          title: "Error",
          textBody: error?.message,
          autoClose: 2000,
        });
        return;
      }

      const data = {
        user_id: userId,
        payment_intent_id: paymentData.id,
        reason: paymentData.reason,
        amount: paymentData.amount,
      };

      const res = await paymentSuccess(data).unwrap();

      if (res?.status) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: "Payment successful! Account created successfully.",
          autoClose: 2000,
        });
        // Navigate to home or success screen
        router.push("/auth/login");
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: (error as any)?.message || "Payment processing failed",
        autoClose: 2000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={tw`flex-grow bg-white p-5 justify-center`}
    >
      <View style={tw`items-center`}>
        <View style={tw`mb-5`}>
          <SvgXml xml={IconPayment} />
        </View>

        <Text
          style={tw`text-2xl font-poppinsMedium text-gray-800 text-center mb-4`}
        >
          Complete Your Account Setup
        </Text>

        <Text
          style={tw`text-base font-poppins text-gray-600 text-center mb-8 leading-6`}
        >
          Thank you for creating your account! To unlock all features and start
          using our services, please complete your payment for onsite account
          creation.
        </Text>

        <TouchableOpacity
          style={tw`bg-[#EF4444] py-4  px-10 rounded-full mb-5 w-4/5 items-center`}
          onPress={handleSetupInitialPayment}
        >
          <Text style={tw`text-white text-lg font-poppinsSemiBold`}>
            Pay Now
          </Text>
        </TouchableOpacity>

        <Text
          style={tw`text-xs font-poppinsLight text-gray-500 text-center mt-3`}
        >
          🔒 Secure payment processed through trusted payment gateway
        </Text>
      </View>
    </ScrollView>
  );
};

export default paymentOnside;
