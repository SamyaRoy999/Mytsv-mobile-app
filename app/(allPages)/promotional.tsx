import Card from "@/components/landing_page/Card";
import tw from "@/lib/tailwind";
import { usePromotedVideoHomeQuery } from "@/redux/apiSlices/Home/homeApiSlices";
import React from "react";
import { Dimensions, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width: screenWidth } = Dimensions.get("window");

const Promotional = () => {
  const { data, isLoading } = usePromotedVideoHomeQuery({});
  const videos = data?.data?.data ?? [];

  if (isLoading) {
    return (
      <View style={tw`h-64 bg-gray-200 dark:bg-gray-800 rounded-xl mx-4`} />
    );
  }

  if (!videos.length) return null;
  return (
    <View style={tw`my-2`}>
      <Carousel
        loop
        width={screenWidth}
        height={280}
        autoPlay
        autoPlayInterval={3500}
        scrollAnimationDuration={800}
        data={videos}
        renderItem={({ item }) => <Card data={item} />}
      />
    </View>
  );
};

export default Promotional;
