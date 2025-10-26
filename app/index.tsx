import { ImgLogo } from "@/assets/images/images";
import tw from "@/lib/tailwind";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

const index = () => {
  useEffect(() => {
    setTimeout(() => {
      router.replace("/home/(tabs)/landingPage");
    }, 1000);
  }, []);

  return (
    <View style={tw`flex-1 py-16 bg-white justify-between items-center `}>
      <View></View>
      <Image style={tw`w-56 h-16 `} source={ImgLogo} />
      <ActivityIndicator color={"red"} size={"large"} />
    </View>
  );
};

export default index;
