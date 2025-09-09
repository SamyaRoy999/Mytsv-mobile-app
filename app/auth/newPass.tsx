import { ImgLogo, Imgsuccess } from "@/assets/images/images";
import { IconBackAuth, IconNewPass } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
// import success from "@/assets/images/success.gif";
import Entypo from "@expo/vector-icons/Entypo";

// import { Image } from "expo-image";
import { useResetPasswordMutation } from "@/redux/apiSlices/authApiSlices";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import * as Yup from "yup";
const newPass = () => {
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [confirmPassword, SetConfirmPassword] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  //-----------get email----------
  const { email } = useLocalSearchParams();
  // ----------api-----------
  const [resetPassword] = useResetPasswordMutation();

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
        <View style={tw` bg-secondary`}>
          <Formik
            initialValues={{ password: "", confirm_password: "" }}
            onSubmit={async (values) => {
              const data = {
                email: email,
                password: values.password,
                c_password: values.confirm_password,
              };
              try {
                const res = await resetPassword(data).unwrap();
                if (res.status) {
                  Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "Success",
                    textBody: res?.message,
                    autoClose: 2000,
                  });
                  setTimeout(() => {
                    router.push("/auth/login");
                  }, 1000);
                } else {
                  Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: "Error",
                    textBody:
                      res?.message?.email?.[0] || "Something went wrong!",
                    autoClose: 2000,
                  });
                }
              } catch (error: any) {
                Toast.show({
                  type: ALERT_TYPE.WARNING,
                  title: "Error",
                  textBody: error?.message,
                });
              }
            }}
            validationSchema={Yup.object({
              password: Yup.string()
                .min(4, "Password is too sort ")
                .required("email is required")
                .uppercase("1 lowercase letter added"),
              confirm_password: Yup.string()
                .min(4, "Password is too sort ")
                .required("email is required")
                .uppercase("1 lowercase letter added"),
            })}
          >
            {({ values, setFieldValue, handleSubmit, errors }) => {
              return (
                <View>
                  <View style={tw`flex-row justify-end `}>
                    <TouchableOpacity
                      style={tw`absolute left-5 top-10`}
                      onPress={() => router.back()}
                    >
                      <SvgXml xml={IconBackAuth} />
                    </TouchableOpacity>
                    <SvgXml xml={IconNewPass} />
                  </View>
                  <View
                    style={tw`flex-col justify-center w-full items-center my-16`}
                  >
                    <Text
                      style={tw`font-poppinsBold text-3xl  text-primaryText`}
                    >
                      Enter new password
                    </Text>
                    <Text
                      style={tw`text-primaryText font-poppins text-sm text-center py-1 px-6`}
                    >
                      Enter the 6 digit code that we sent you to your provided
                      email.
                    </Text>
                  </View>
                  <View style={tw`bg-primary w-full h-[50%] rounded-t-[40px] `}>
                    <View style={tw`flex-row justify-center `}>
                      <Image
                        source={ImgLogo}
                        style={{
                          height: 100,
                          width: 162,
                          objectFit: "contain",
                        }}
                      />
                    </View>
                    {/* login from */}
                    <View>
                      <View style={tw`py-3 px-6 relative`}>
                        <TextInput
                          style={tw`border border-primaryGray rounded-full font-poppins text-base px-5 h-14`}
                          placeholder="Enter new password"
                          secureTextEntry={!showNewPassword}
                          placeholderTextColor="black"
                          value={values.password}
                          onChangeText={(txt) => setFieldValue("password", txt)}
                        />
                        <Entypo
                          name={showNewPassword ? "eye" : "eye-with-line"}
                          style={tw`absolute right-12 top-7 `}
                          size={20}
                          color="#777"
                          onPress={() => setShowNewPassword(!showNewPassword)}
                        />
                      </View>
                      {errors.password && (
                        <Text style={tw`text-center text-red-700 font-poppins`}>
                          {errors.password}
                        </Text>
                      )}
                      <View style={tw`py-3 px-6 relative`}>
                        <TextInput
                          style={tw`border border-primaryGray rounded-full font-poppins text-base px-5 h-14`}
                          placeholder="Confirm new password"
                          placeholderTextColor="black"
                          secureTextEntry={!confirmPassword}
                          value={values.confirm_password}
                          onChangeText={(txt) =>
                            setFieldValue("confirm_password", txt)
                          }
                        />
                        <Entypo
                          name={confirmPassword ? "eye" : "eye-with-line"}
                          style={tw`absolute right-12 top-7 `}
                          size={20}
                          color="#777"
                          onPress={() => SetConfirmPassword(!confirmPassword)}
                        />
                      </View>
                    </View>
                    {errors.password && (
                      <Text style={tw`text-center text-red-700 font-poppins`}>
                        {errors.password}
                      </Text>
                    )}

                    <TouchableOpacity
                      style={tw`bg-secondary rounded-full mt-3 mx-6`}
                      onPress={() => {
                        handleSubmit();
                        // router.replace("/auth/newPass");
                        setIsVisible(true);
                      }}
                    >
                      <Text
                        style={tw`text-primary  text-center  text-lg py-4 font-poppinsBold`}
                      >
                        Set new password
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* <TouchableOpacity onPress={() => setIsVisible(false)}> */}
                  <Modal
                    visible={isVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsVisible(false)}
                  >
                    <View style={styles.modalContainer}>
                      <View
                        style={tw`bg-white flex-col  justify-center items-center w-96 dark:bg-darkSecoundary rounded-xl `}
                      >
                        <Image source={Imgsuccess} />
                        <Text
                          style={tw`font-poppins text-xl py-8 text-secondaryGren`}
                        >
                          Password change successful
                        </Text>
                      </View>
                    </View>
                  </Modal>
                  {/* </TouchableOpacity> */}
                </View>
              );
            }}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default newPass;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    height: 500,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
