import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import "react-native-reanimated";

import tw from "@/lib/tailwind";
import store from "@/redux/store";
import { StripeProvider } from "@stripe/stripe-react-native";
import { LogBox, StatusBar } from "react-native";
import { AlertNotificationRoot } from "react-native-alert-notification";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { useDeviceContext } from "twrnc";
import ThemeProvider from "../context/ThemeProvider";

LogBox.ignoreLogs([
  "Ignoring DevTools app debug target",
  "setLayoutAnimationEnabledExperimental is currently a no-op",
]);
export default function RootLayout() {
  const [loaded] = useFonts({
    PoppinsBlack: require("@/assets/fonts/Poppins-Black.ttf"),
    PoppinsBlackItalic: require("@/assets/fonts/Poppins-BlackItalic.ttf"),
    PoppinsBold: require("@/assets/fonts/Poppins-Bold.ttf"),
    PoppinsBoldItalic: require("@/assets/fonts/Poppins-BoldItalic.ttf"),
    PoppinsExtraBold: require("@/assets/fonts/Poppins-ExtraBold.ttf"),
    PoppinsExtraBoldItalic: require("@/assets/fonts/Poppins-ExtraBoldItalic.ttf"),
    PoppinsExtraLight: require("@/assets/fonts/Poppins-ExtraLight.ttf"),
    PoppinsExtraLightItalic: require("@/assets/fonts/Poppins-ExtraLightItalic.ttf"),
    PoppinsItalic: require("@/assets/fonts/Poppins-Italic.ttf"),
    PoppinsLight: require("@/assets/fonts/Poppins-Light.ttf"),
    PoppinsLightItalic: require("@/assets/fonts/Poppins-LightItalic.ttf"),
    PoppinsMedium: require("@/assets/fonts/Poppins-Medium.ttf"),
    PoppinsMediumItalic: require("@/assets/fonts/Poppins-MediumItalic.ttf"),
    PoppinsRegular: require("@/assets/fonts/Poppins-Regular.ttf"),
    PoppinsSemiBold: require("@/assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsSemiBoldItalic: require("@/assets/fonts/Poppins-SemiBoldItalic.ttf"),
    PoppinsThin: require("@/assets/fonts/Poppins-Thin.ttf"),
    PoppinsThinItalic: require("@/assets/fonts/Poppins-ThinItalic.ttf"),
  });
  useDeviceContext(tw);
  if (!loaded) {
    return null;
  }

  const PublishableKey = process.env.EXPO_PUBLIC_PUBLISHABLE_KEY;

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={"dark-content"}
      />
      <StripeProvider publishableKey={PublishableKey as string}>
        <AlertNotificationRoot>
          <GestureHandlerRootView>
            <Provider store={store}>
              <ThemeProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    statusBarStyle: "dark",
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="home/(tabs)" />
                  <Stack.Screen name="auth" />
                  <Stack.Screen name="details/video/[id]" />
                  <Stack.Screen name="details/Blog/[id]" />
                  <Stack.Screen name="details/promotion/[id]" />
                  <Stack.Screen name="details/editVideoDetails/[id]" />
                  <Stack.Screen name="details/videoAnalytics/[id]" />
                  <Stack.Screen name="details/channelProfile/[id]" />
                  <Stack.Screen name="details/search/[results]" />
                  <Stack.Screen name="(allPages)" />
                </Stack>
              </ThemeProvider>
            </Provider>
          </GestureHandlerRootView>
        </AlertNotificationRoot>
      </StripeProvider>
    </>
  );
}
