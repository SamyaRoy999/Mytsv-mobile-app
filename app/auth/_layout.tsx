import { Stack } from "expo-router";
import React from "react";

const authLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signUp" />
      <Stack.Screen name="forgotPass" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="newPass" />
      <Stack.Screen name="onSiteOtp" />
    </Stack>
  );
};

export default authLayout;
