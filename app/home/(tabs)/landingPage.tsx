import HeaderBar from "@/components/shear/HeaderBar";
import tw from "@/lib/tailwind";
import { useCategoriesQuery } from "@/redux/apiSlices/UploadVideo/uploadVideoSices";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const landingPage = () => {
  const { data: categories, isLoading } = useCategoriesQuery({});
  const categoryData = categories?.data?.data || [];

  const [selectedCategory, setSelectedCategory] = useState(null);

  const renderCategoryItem = ({ item }: any) => (
    <TouchableOpacity
      key={item.id}
      style={tw.style(
        `px-4 py-2 rounded-xl mx-1`,
        selectedCategory === item.id
          ? `bg-secondaryRed100`
          : `border border-secondary `
      )}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text
        style={tw.style(
          `text-sm font-poppinsMedium`,
          selectedCategory === item.id
            ? `text-gray-900`
            : `text-secondaryBlack text-secondary `
        )}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-primary`}>
      <HeaderBar />
      {isLoading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={tw.color("gray-400")} />
        </View>
      ) : (
        <View style={tw`py-3`}>
          {/* "All" button */}
          <View style={tw`flex-row items-center px-4`}>
            <TouchableOpacity
              style={tw.style(
                `px-4 py-2 rounded-xl mx-1`,
                selectedCategory === null
                  ? `bg-secondaryRed100`
                  : `border border-secondary`
              )}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={tw.style(
                  `text-sm font-poppinsMedium`,
                  selectedCategory === null
                    ? `text-gray-900`
                    : `text-secondary `
                )}
              >
                All
              </Text>
            </TouchableOpacity>

            {/* Horizontal FlatList for categories */}
            <FlatList
              data={categoryData}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default landingPage;
