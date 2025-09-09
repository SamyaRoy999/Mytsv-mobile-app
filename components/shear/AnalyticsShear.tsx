import { IconBackLeft } from '@/icons/Icon';
import tw from '@/lib/tailwind';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { LogBox, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { SvgXml } from 'react-native-svg';
import HeaderBar from './HeaderBar';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Ignoring DevTools app debug target',
  'setLayoutAnimationEnabledExperimental',
]);

interface AnalyticsDataItem {
  day: number;
  total_watch: number;
}

interface AnalyticsData {
  analytics: AnalyticsDataItem[];
  total_dislikes: number;
  total_likes: number;
  total_views: number;
}

interface AnalyticsShearProps {
  analytics?: {
    data: AnalyticsData;
  };
}

const AnalyticsShear: React.FC<AnalyticsShearProps> = ({ analytics: analyticsData }) => {
  // Safely extract data with fallbacks
  const { analytics, total_dislikes, total_likes, total_views } = analyticsData?.data || {
    analytics: [],
    total_dislikes: 0,
    total_likes: 0,
    total_views: 0,
  };

  // Memoize bar data to prevent unnecessary recalculations
  const barData = useMemo(() => {
    return analytics.map((item: AnalyticsDataItem) => ({
      label: item.day.toString().padStart(2, '0'),
      value: item.total_watch,
    }));
  }, [analytics]);

  return (
    <View>
      <HeaderBar />
      <View style={tw`flex-row justify-between items-center gap-5 px-5 mb-8`}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}>
            <SvgXml xml={IconBackLeft} />
          </View>
        </TouchableOpacity>
        <Text style={tw`font-poppinsMedium text-xl`}>Analytics</Text>
        <View style={tw`w-13`}></View>
      </View>

      {/* Stats Cards */}
      <View style={tw`flex-row w-full justify-center items-center mb-8`}>
        <View style={tw`border w-32 h-32 flex-col items-center justify-center border-gray-200 rounded-tl-lg rounded-bl-lg`}>
          <Text style={tw`font-poppins text-sm text-black`}>Views</Text>
          <Text style={tw`font-poppinsSemiBold text-xl`}>{total_views}</Text>
        </View>
        <View style={tw`border w-32 h-32 flex-col items-center justify-center border-gray-200 `}>
          <Text style={tw`font-poppins text-sm text-black`}>Likes</Text>
          <Text style={tw`font-poppinsSemiBold text-xl`}>
            {total_likes}
          </Text>
        </View>
        <View style={tw`border w-32 h-32 flex-col items-center justify-center border-gray-200 rounded-tr-lg rounded-br-lg`}>
          <Text style={tw`font-poppins text-sm text-black`}>Dislikes</Text>
          <Text style={tw`font-poppinsSemiBold text-xl`}>{total_dislikes}</Text>
        </View>
      </View>

      <Text style={tw`text-xl font-poppins px-12 py-6 text-center`}>
        Your channel got {total_views} views in this month
      </Text>
      
      {/* Bar Chart */}
      <View style={tw`px-4`}>
        <BarChart
          data={barData}
          height={250}
          width={350}
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
            color: '#9CA3AF',
            dashWidth: 2,
            dashGap: 3,
          }}
          showReferenceLine2
          referenceLine2Position={6000}
          referenceLine2Config={{
            color: '#9CA3AF',
            dashWidth: 2,
            dashGap: 3,
          }}
          showReferenceLine3
          referenceLine3Position={4000}
          referenceLine3Config={{
            color: '#9CA3AF',
            dashWidth: 2,
            dashGap: 3,
          }}
          renderTooltip={(item: { value: number }) => (
            <View style={tw`bg-gray-800 px-2 py-1 rounded`}>
              <Text style={tw`text-white text-xs`}>{item.value.toString()}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default AnalyticsShear;