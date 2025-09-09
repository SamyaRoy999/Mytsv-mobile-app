import Card from "@/components/landing_page/Card";
import HeaderBar from "@/components/shear/HeaderBar";
import { IconErowred } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { usePromotionalCatagoryQuery } from "@/redux/apiSlices/Promotion/promotionSlices";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

const Promotions = () => {
  const { data: promoted, isLoading, error } = usePromotionalCatagoryQuery({});
  if (isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!promoted?.data) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Blog post not found</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Error loading Promoted post</Text>
      </View>
    );
  }

  return (
    <View style={tw`bg-primary flex-1`}>
      <ScrollView
        contentContainerStyle={tw`pb-10`}
        showsVerticalScrollIndicator={false}
      >
        <HeaderBar />
        <Text style={tw`text-3xl font-bold text-center mb-4`}>Promotions</Text>
        {/* Beauty esthetics btn */}
        {promoted?.data?.map((item: any) => {
          if (!item?.videos || item?.videos?.length === 0) {
            return null;
          }
          return (
            <View key={item?.id}>
              <View
                style={tw`flex-row w-full justify-between items-center px-5 pb-4`}
              >
                <View style={tw`bg-secondaryRed100 py-2 px-4 rounded-lg`}>
                  <Text
                    style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                  >
                    {item?.name}
                  </Text>
                </View>
                <View style={tw``}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/details/promotion/${item?.id}`)
                    }
                    style={tw`py-1 flex-row gap-4 items-center  px-3 rounded-full border border-secondary`}
                  >
                    <Text style={tw`font-poppinsMedium text-sm text-secondary`}>
                      See all
                    </Text>
                    <SvgXml xml={IconErowred} />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Beauty esthetics end */}
              <FlatList
                data={item?.videos}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item }) => <Card data={item} />}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Promotions;
