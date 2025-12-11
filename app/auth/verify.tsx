import { ImgLogo } from "@/assets/images/images";
import { IconBackAuth, IconForgetNest } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import React from "react";
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

// import { Image } from "expo-image";
import { useVerifyOtpMutation } from "@/redux/apiSlices/authApiSlices";
import { router, useLocalSearchParams } from "expo-router";
import {
  ALERT_TYPE,
  AlertNotificationRoot,
  Toast,
} from "react-native-alert-notification";
import { OtpInput } from "react-native-otp-entry";

const Verify = () => {
  const [verifyOtp] = useVerifyOtpMutation();
  const { email, flow } = useLocalSearchParams();

  const handleOtpVerification = async (otp: string) => {
    try {
      const data = {
        email: email as string,
        otp,
      };

      const res = await verifyOtp(data).unwrap();

      if (res.status) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: res?.message,
          autoClose: 2000,
        });

        setTimeout(() => {
          // Determine where to navigate based on the flow type
          if (flow === "register") {
            // Navigate to login page after successful registration
            router.replace("/auth/login");
          } else if (flow === "forgot") {
            // Navigate to new password page for forgot password flow
            router.push(`/auth/newPass?email=${email}`);
          }
        }, 1000);
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: res?.message,
          autoClose: 2000,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Error",
        textBody: error?.message || "An error occurred during OTP verification",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 `}
      enabled={true}
      behavior={"padding"}
    >
      <ScrollView
        contentContainerStyle={tw`flex-grow justify-center dark:bg-base-dark  `}
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`h-full bg-secondary`}>
          <AlertNotificationRoot>
            <View style={tw`flex-row justify-between mt-12`}>
              <TouchableOpacity style={tw`p-5`} onPress={() => router.back()}>
                <SvgXml xml={IconBackAuth} />
              </TouchableOpacity>
              <View>
                <SvgXml xml={IconForgetNest} />
              </View>
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
              {/* OTP input */}
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

              <TouchableOpacity
                style={tw`bg-secondary rounded-full mx-6 mb-8`}
                onPress={() => {
                  // Resend OTP functionality can be implemented here
                }}
              >
                <Text
                  style={tw`text-primary  text-center  text-lg py-4  font-poppinsBold`}
                >
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>
          </AlertNotificationRoot>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Verify;
