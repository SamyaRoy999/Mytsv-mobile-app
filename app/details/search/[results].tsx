import Card from "@/components/landing_page/Card";
import HeaderBar from "@/components/shear/HeaderBar";
import { IconBackLeft } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

const Results = () => {
  const { results: searchResult } = useLocalSearchParams();

  // Parse the search results
  let resultData;
  try {
    resultData =
      typeof searchResult === "string"
        ? JSON.parse(searchResult)
        : searchResult;
  } catch (error) {
    resultData = null;
  }

  // Extract videos based on the actual API response structure
  // The API returns videos at data.data.videos.data
  const videos = resultData?.data?.videos?.data || [];

  return (
    <View style={tw`flex-1`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderBar />
        <View style={tw`flex-row justify-between items-center gap-5 px-5 mb-8`}>
          <TouchableOpacity onPress={() => router.back()}>
            <View
              style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
            >
              <SvgXml xml={IconBackLeft} />
            </View>
          </TouchableOpacity>
          <Text style={tw`font-poppinsMedium text-xl `}>Search Results</Text>
          <View></View>
        </View>

        {videos.length > 0 ? (
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <Card data={item} />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        ) : (
          <View style={tw`p-4`}>
            <Text style={tw`text-center text-2xl`}>
              {resultData?.message || "No videos found"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Results;
