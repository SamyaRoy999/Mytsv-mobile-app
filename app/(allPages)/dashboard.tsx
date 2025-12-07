import HeaderBar from "@/components/shear/HeaderBar";
import {
  IconBackLeft,
  IconErow,
  IconLikes,
  IconLoction,
  IconPhoto,
  IconVideo,
} from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { useDashboardQuery } from "@/redux/apiSlices/Account/dashboardSlice";
import { _HIGHT, _Width } from "@/utils/utils";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { SvgXml } from "react-native-svg";

const dashboard = () => {
  const { data: dashboardData, isLoading, error } = useDashboardQuery({});
  if (isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Loading...</Text>
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
  const {
    user: { bio, avatar, cover_image, channel_name, locations, services },
    videos,
    views,
    likes,
    analytics,
  } = dashboardData?.data;

  const barData = analytics?.views?.map((item: any) => ({
    label: item.day.toString().padStart(2, "0"),
    value: item.total_watch,
  }));

  return (
    <View>
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
          <Text style={tw`font-poppinsMedium text-xl `}>Dashboard</Text>
          <View></View>
        </View>

        <View style={tw`px-8 pt-5 flex-row justify-center items-center`}>
          {/* Profile banner */}
          <Image
            source={cover_image}
            style={[
              tw`w-full rounded-2xl relative`,
              {
                height: _HIGHT * 0.19,
              },
            ]}
          />
          {/* Profile  */}
          <View
            style={tw`bg-primary rounded-full h-28 w-28 flex-row items-center justify-center  right-[45%] -bottom-10 absolute`}
          >
            <Image source={avatar} style={tw`rounded-full h-24 w-24 `} />
          </View>
        </View>
        <View style={tw`mt-14 flex-row justify-center  `}>
          <View style={tw`flex-1 items-center justify-center`}>
            <Text style={tw`font-poppinsMedium text-xl pb-4`}>
              {channel_name}
            </Text>
            {locations?.find((loc: any) => loc.type === "head-office") && (
              <View
                style={[
                  tw`flex-row gap-3  items-center`,
                  {
                    width: _Width * 0.9,
                  },
                ]}
              >
                <SvgXml xml={IconLoction} />
                <Text style={tw`text-base font-poppins`}>
                  {
                    locations?.find((loc: any) => loc.type === "head-office")
                      ?.location
                  }{" "}
                  (Head Office)
                </Text>
              </View>
            )}
          </View>
        </View>
        <View
          style={tw`mt-10 mx-5 p-5 flex-row justify-between items-center border border-primaryGray rounded-xl`}
        >
          <SvgXml xml={IconVideo} />
          <View style={tw`flex-col justify-center items-center`}>
            <Text style={tw`text-base font-poppins`}>Videos</Text>
            <Text style={tw`text-3xl font-poppinsSemiBold py-5`}>{videos}</Text>
          </View>
        </View>
        <View style={tw`flex-row items-center gap-4 pt-2 w-full px-5`}>
          <View
            style={[
              tw` items-center flex-1  p-5 pt-4 border border-primaryGray rounded-xl`,
              {
                width: _Width * 0.43,
              },
            ]}
          >
            <SvgXml xml={IconPhoto} />
            <View style={tw`flex-col justify-center items-center`}>
              <Text style={tw`text-base font-poppins pt-4`}>Views</Text>
              <Text style={tw`text-3xl font-poppinsSemiBold py-5`}>
                {views}
              </Text>
            </View>
          </View>
          <View
            style={[
              tw` items-center flex-1 p-5 pt-4 border border-primaryGray rounded-xl`,
              {
                width: _Width * 0.43,
              },
            ]}
          >
            <SvgXml xml={IconLikes} />
            <View style={tw`flex-col justify-center items-center`}>
              <Text style={tw`text-base font-poppins pt-4`}>Likes</Text>
              <Text style={tw`text-3xl font-poppinsSemiBold py-5`}>
                {likes}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(allPages)/analytics")}
          style={tw`border rounded-full w-3/6 justify-center  border-primaryGray flex-row items-center mx-5 mt-3 gap-2 px-3 py-2`}
        >
          <Text style={tw`font-poppins text-base`}>See full analytics</Text>
          <SvgXml xml={IconErow} />
        </TouchableOpacity>
        {/* About section */}
        {bio?.length && (
          <View
            style={tw`mt-10 mx-5 p-5  border border-primaryGray rounded-xl`}
          >
            <Text style={tw`font-poppinsMedium text-xl pb-3`}>About</Text>
            <Text style={tw`font-poppins text-sm `}>{bio}</Text>
          </View>
        )}
        {/* Services */}
        {services?.length && (
          <View
            style={tw`mt-10 mx-5 p-5 flex-col justify-start  border border-primaryGray rounded-xl`}
          >
            <Text style={tw`font-poppinsMedium text-xl pb-3`}>Services</Text>
            {services?.map((item: any, index: any) => (
              <Text key={index} style={tw`font-poppins text-base pb-2 `}>
                {" "}
                {item}
              </Text>
            ))}
          </View>
        )}

        <Text style={tw`font-poppins text-xl mx-5 pt-7 pb-3`}>
          Views analytics
        </Text>
        {/* Bar Chart */}
        <View style={tw`px-4 pb-3`}>
          <BarChart
            data={barData}
            height={250}
            width={_Width}
            barWidth={16}
            spacing={20}
            roundedTop
            frontColor="#8979FF"
            noOfSections={5}
            maxValue={10000}
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisTextStyle={tw`text-xs text-gray-500`}
            xAxisLabelTextStyle={tw`text-xs text-gray-500 mt-1`}
            rulesType="solid"
            rulesColor="#E5E7EB"
            showReferenceLine1
            referenceLine1Position={8000}
            referenceLine1Config={{
              color: "#9CA3AF",
              dashWidth: 2,
              dashGap: 3,
            }}
            showReferenceLine2
            referenceLine2Position={6000}
            referenceLine2Config={{
              color: "#9CA3AF",
              dashWidth: 2,
              dashGap: 3,
            }}
            showReferenceLine3
            referenceLine3Position={4000}
            referenceLine3Config={{
              color: "#9CA3AF",
              dashWidth: 2,
              dashGap: 3,
            }}
            renderTooltip={(item: { value: number }) => (
              <View style={tw`bg-gray-800 px-2 py-1 rounded`}>
                <Text style={tw`text-white text-xs`}>
                  {item?.value?.toString()}
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default dashboard;
