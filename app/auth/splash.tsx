import { IconLogin, IconSplash } from "@/icons/Icon";

import tw from "@/lib/tailwind";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";

const splash = () => {
  useEffect(() => {
    setTimeout(() => {
      router.replace("/auth/login");
    }, 1000);
  }, []);
  return (
    <View style={tw`bg-secondary flex-1 justify-between`}>
      <SvgXml xml={IconLogin} />
      <SvgXml xml={IconSplash} />
    </View>
  );
};

export default splash;

// eas build --platform ios --auto-submit
