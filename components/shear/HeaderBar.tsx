import { ImgLogo } from "@/assets/images/images";
import { IconSearch } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";

const HeaderBar = () => {
  return (
    <View style={tw`flex-row w-full justify-between items-center px-5 py-3`}>
      <TouchableOpacity onPress={() => router.push("/home/(tabs)/landingPage")}>
        <Image source={ImgLogo} style={tw`w-[151px] h-[42px]`} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(allPages)/search")}>
        <View style={tw`bg-secondaryRed100 p-4 rounded-full`}>
          <SvgXml xml={IconSearch} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HeaderBar;
