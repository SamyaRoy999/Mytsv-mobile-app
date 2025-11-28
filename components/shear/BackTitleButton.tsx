// import { IconBackLeftArrow } from "@/assets/icons";
import { IconBackLeftArrow } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import React, { JSX } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";

interface IProps {
  onPress?: () => void;
  pageName?: string;
  titleTextStyle?: any;
  contentStyle?: any;
}

const BackTitleButton = ({
  onPress,
  pageName,
  titleTextStyle = "",
  contentStyle = "",
}: IProps): JSX.Element => {
  return (
    <View
      style={[tw`flex-row justify-between items-center py-2`, contentStyle]}
    >
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={onPress}
        style={tw`w-12 h-12 bg-white rounded-full justify-center items-center`}
      >
        <SvgXml xml={IconBackLeftArrow} />
      </TouchableOpacity>
      <Text style={[tw`font-medium text-base text-black`, titleTextStyle]}>
        {pageName}
      </Text>
      <Text style={tw`pl-6`}> </Text>
    </View>
  );
};

export default BackTitleButton;
