import { IconLogin, IconSplash } from "@/icons/Icon";

import { SvgXml } from "react-native-svg";
import { View } from "react-native";
import { router } from "expo-router";
import tw from "@/lib/tailwind";
import { useEffect } from "react";

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
