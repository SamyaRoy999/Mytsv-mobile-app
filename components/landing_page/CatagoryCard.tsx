import { IconErowred, IconPrmt } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { _Width } from "@/utils/utils";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";

const CategoryCard = ({
  data,
  isLoading,
}: {
  data: any;
  isLoading?: boolean;
}) => {
  const { id: categoryId, name: categoryName, videos = [] } = data || {};

  if (isLoading) {
    return (
      <View style={tw`bg-primary mb-4 overflow-hidden p-4`}>
        <View style={tw`flex-row w-full justify-between items-center mb-4`}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!videos || videos.length === 0) {
    return null;
  }
  return (
    <View style={tw`bg-primary  overflow-hidden`}>
      {/* Category header with "See all" button */}
      <View style={tw`flex-row w-full justify-between items-center px-5 pb-4`}>
        <View style={tw`bg-secondaryRed100 py-3 px-4 rounded-lg`}>
          <Text style={tw`font-poppinsMedium text-sm text-secondaryBlack`}>
            {categoryName}
          </Text>
        </View>
        <View>
          <TouchableOpacity
            style={tw`py-1 flex-row gap-4 items-center px-3 rounded-full border border-secondary`}
            onPress={() =>
              router.push({
                pathname: "/details/catagoryVideoDetails/[id]",
                params: { id: String(categoryId) },
              })
            }
          >
            <Text style={tw`font-poppinsMedium text-sm text-secondary`}>
              See all
            </Text>
            <SvgXml xml={IconErowred} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Videos list */}
      <FlatList
        data={videos}
        keyExtractor={(item) => item?.id}
        renderItem={({ item }) => {
          const isPromoted = item?.is_promoted === 1;
          return (
            <TouchableOpacity
              onPress={() => router.push(`/details/video/${item?.id}`)}
              style={tw`mb-4`}
            >
              {/* Thumbnail with promoted badge */}
              <View style={tw`relative`}>
                <Image
                  source={{ uri: item?.thumbnail }}
                  style={tw`w-full h-48`}
                />
                {isPromoted && (
                  <View
                    style={tw`absolute top-2 flex-row items-center gap-2 right-2 bg-secondary px-4 py-1 rounded-full`}
                  >
                    <SvgXml xml={IconPrmt} />
                    <Text style={tw`text-primaryText text-sm font-poppinsBold`}>
                      Promoted
                    </Text>
                  </View>
                )}
              </View>

              {/* Video details */}
              <View style={tw`flex-row px-2 py-2 items-start`}>
                {/* Channel profile image */}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/details/channelProfile/[id]",
                      params: { id: item?.user?.id },
                    })
                  }
                >
                  <Image
                    source={{ uri: item.user?.avatar }}
                    style={tw`w-10 h-10 rounded-full mr-3`}
                  />
                </TouchableOpacity>

                {/* Text info */}
                <View>
                  <Text
                    style={[
                      tw`font-poppinsMedium text-sm text-secondaryBlack`,
                      { width: _Width * 0.8 },
                    ]}
                  >
                    {item?.title}
                  </Text>
                  <View style={tw`flex-row items-center gap-2 flex-wrap`}>
                    <Text
                      style={tw`text-secondaryBlack text-sm font-poppinsMedium`}
                    >
                      {item?.user?.channel_name}
                    </Text>
                    <View style={tw`bg-primaryGray rounded-full h-2 w-2`} />
                    <Text
                      style={tw`text-secondaryBlack text-sm font-poppinsLight`}
                    >
                      {item?.views_count_formated} views
                    </Text>
                    <View style={tw`bg-primaryGray rounded-full h-2 w-2`} />
                    <Text
                      style={tw`text-secondaryBlack text-sm font-poppinsLight`}
                    >
                      {item?.created_at_format}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default CategoryCard;
