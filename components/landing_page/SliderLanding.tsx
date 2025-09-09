import { IconNextLeft, IconNextRight } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { useBannerQuery } from "@/redux/apiSlices/Home/homeApiSlices";
import { _Width } from "@/utils/utils";
import { Image } from "expo-image";
import * as React from "react";
import { TouchableOpacity, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { SvgXml } from "react-native-svg";

const SliderLanding = () => {
  const progress = useSharedValue<number>(0);
  const carouselRef = React.useRef<any>(null);
  // ------GET DATA -----------
  const {
    data: banner,
    isFetching,
    isLoading,
    refetch,
  } = useBannerQuery({
    params: {
      per_page: 500,
    },
  });


  return (
    <View style={tw`w-full relative `}>
      <Carousel
        ref={carouselRef}
        autoPlayInterval={3000}
        data={banner?.data?.data} // backend images used here
        height={230}
        width={_Width}
       
        loop
        pagingEnabled
        snapEnabled
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.95,
          parallaxScrollingOffset: 50,
        }}
        onProgressChange={progress}
        renderItem={({ item }: any) => (
          <View style={tw`flex-1 rounded-3xl items-center  justify-center`}>
            <Image
              source={{ uri: item.image }}
              style={[tw`h-[200px]  rounded-2xl`,{
                width: _Width * 0.92,
              }]}
              contentFit="cover"
            />
          </View>
        )}
      />


      {/* Navigation Buttons */}
      <View
        style={tw`flex-row w-full justify-between items-center px-9 absolute top-[40%] `}
      >
        <TouchableOpacity onPress={() => carouselRef.current?.prev()}>
          <SvgXml xml={IconNextLeft} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => carouselRef.current?.next()}>
          <SvgXml xml={IconNextRight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SliderLanding;
