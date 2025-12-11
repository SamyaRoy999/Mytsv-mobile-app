// import { IconEyeClose, IconEyeShow } from "@/assets/icons";
// import { ImgSuccessGIF } from "@/assets/images/image";
import BackTitleButton from "@/components/shear/BackTitleButton";
import PrimaryButton from "@/components/shear/PrimaryButton";
import { IconEyeClose, IconEyeShow } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { useChangePasswordMutation } from "@/redux/apiSlices/authApiSlices";
// import PrimaryButton from "@/src/Components/PrimaryButton";
// import BackTitleButton from "@/src/lib/HeaderButtons/BackTitleButton";

// import { useChangePasswordMutation } from "@/src/redux/apiSlices/authSlices";
import { router } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ALERT_TYPE,
  AlertNotificationRoot,
  Toast,
} from "react-native-alert-notification";
import { SvgXml } from "react-native-svg";

const Change_Pass = () => {
  const [isVisibleCurrent, setIsVisibleCurrent] = useState(true);
  const [isVisibleNew, setIsVisibleNew] = useState(true);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(true);

  const [isEyeShowCurrent, setIsEyeShowCurrent] = useState(false);
  const [isEyeShowNew, setIsEyeShowNew] = useState(false);
  const [isEyeShowConfirm, setIsEyeShowConfirm] = useState(false);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const validate = (values: any) => {
    const errors: any = {};
    if (!values.current_password) {
      errors.current_password = "Current password is required";
    }
    if (!values.new_password) {
      errors.new_password = "New password is required";
    }
    if (values.new_password && values.new_password.length < 6) {
      errors.new_password = "Password must be at least 6 characters";
    }
    if (!values.retype_password) {
      errors.retype_password = "Confirm password is required";
    } else if (values.new_password !== values.retype_password) {
      errors.retype_password = "Passwords do not match";
    }
    return errors;
  };

  const handleChangePassword = async (values: any) => {
    try {
      const response: any = await changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
        c_password: values.retype_password,
      });
      if (response?.data?.status) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: response?.data.message,
          autoClose: 2000,
        });
        router.back();
      } else {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: response?.message,
          autoClose: 2000,
        });
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        textBody: "Password change failed!",
        autoClose: 2000,
      });
    }
  };

  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="interactive"
      style={tw` px-5`}
      contentContainerStyle={tw`pb-6 flex-1`}
    >
      <AlertNotificationRoot>
        <BackTitleButton
          pageName={"Change password"}
          onPress={() => router.back()}
          titleTextStyle={tw`text-xl`}
        />

        <Formik
          initialValues={{
            current_password: "",
            new_password: "",
            retype_password: "",
          }}
          validate={validate}
          onSubmit={handleChangePassword}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            touched,
            errors,
          }) => (
            <View style={tw`flex-1 justify-between`}>
              {/* ---------- current password ---------- */}
              <View style={tw`mt-4`}>
                <View
                  style={tw`flex-row items-center gap-2 border border-gray-400 h-14 rounded-full mb-3 px-3`}
                >
                  <TextInput
                    secureTextEntry={isVisibleCurrent}
                    style={tw`flex-1 text-base font-PoppinsMedium`}
                    placeholderTextColor="#777777"
                    placeholder="Current password"
                    value={values.current_password}
                    onChangeText={handleChange("current_password")}
                    onBlur={handleBlur("current_password")}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setIsVisibleCurrent(!isVisibleCurrent);
                      setIsEyeShowCurrent(!isEyeShowCurrent);
                    }}
                  >
                    <SvgXml
                      xml={isEyeShowCurrent ? IconEyeShow : IconEyeClose}
                    />
                  </TouchableOpacity>
                </View>
                {touched.current_password && errors.current_password && (
                  <Text style={tw`text-red-500 ml-3 mt-[-12px] mb-4 text-sm`}>
                    {errors.current_password}
                  </Text>
                )}

                {/* ---------- new password ---------- */}
                <View
                  style={tw`flex-row items-center gap-2 border border-gray-400 h-14 rounded-full mb-3 px-3`}
                >
                  <TextInput
                    secureTextEntry={isVisibleNew}
                    style={tw`flex-1 text-base font-PoppinsMedium`}
                    placeholderTextColor="#777777"
                    placeholder="New password"
                    value={values.new_password}
                    onChangeText={handleChange("new_password")}
                    onBlur={handleBlur("new_password")}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setIsVisibleNew(!isVisibleNew);
                      setIsEyeShowNew(!isEyeShowNew);
                    }}
                  >
                    <SvgXml xml={isEyeShowNew ? IconEyeShow : IconEyeClose} />
                  </TouchableOpacity>
                </View>
                {touched.new_password && errors.new_password && (
                  <Text style={tw`text-red-500 ml-3 mt-[-12px] mb-4 text-sm`}>
                    {errors.new_password}
                  </Text>
                )}

                {/* ---------- confirm password ---------- */}
                <View
                  style={tw`flex-row items-center gap-2 border border-gray-400 h-14 rounded-full mb-3 px-3`}
                >
                  <TextInput
                    secureTextEntry={isVisibleConfirm}
                    style={tw`flex-1 text-base font-PoppinsMedium`}
                    placeholderTextColor="#777777"
                    placeholder="Confirm password"
                    value={values.retype_password}
                    onChangeText={handleChange("retype_password")}
                    onBlur={handleBlur("retype_password")}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setIsVisibleConfirm(!isVisibleConfirm);
                      setIsEyeShowConfirm(!isEyeShowConfirm);
                    }}
                  >
                    <SvgXml
                      xml={isEyeShowConfirm ? IconEyeShow : IconEyeClose}
                    />
                  </TouchableOpacity>
                </View>
                {touched.retype_password && errors.retype_password && (
                  <Text style={tw`text-red-500 ml-3 mt-[-12px] mb-4 text-sm`}>
                    {errors.retype_password}
                  </Text>
                )}
              </View>

              {/* ---------- submit ---------- */}
              <PrimaryButton
                onPress={() => handleSubmit()}
                titleProps="Update password"
                contentStyle={tw`mt-4`}
              />
            </View>
          )}
        </Formik>
      </AlertNotificationRoot>
    </ScrollView>
  );
};

export default Change_Pass;
