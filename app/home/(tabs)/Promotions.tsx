import Card from "@/components/landing_page/Card";
import HeaderBar from "@/components/shear/HeaderBar";
import { IconErowred } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { useLazyPromotionalCatagoryQuery } from "@/redux/apiSlices/Promotion/promotionSlices";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

const Promotions = () => {
  // State management
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [promotedData, setPromotedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // API call
  const [fetchPromoted, { isLoading, isFetching }] =
    useLazyPromotionalCatagoryQuery();

  // Load promoted content
  const loadPromoted = async (pageNum = 1, isRefresh = false) => {
    try {
      // Prevent multiple simultaneous requests
      if ((isLoading || isFetching || loadingMore) && !isRefresh) return;
      if (!hasMore && !isRefresh) return;

      setLoadingMore(true);
      setError(null);

      const res = await fetchPromoted({
        page: pageNum,
      }).unwrap();

      // Handle API response
      const responseData = res.data || [];

      if (isRefresh) {
        // Replace data on refresh
        setPromotedData(responseData);
      } else {
        // Merge new data with existing, avoiding duplicates
        const mergedData = [...promotedData];

        responseData.forEach((newCategory: any) => {
          const existingIndex = mergedData.findIndex(
            (cat) => cat.id === newCategory.id
          );

          if (existingIndex >= 0) {
            // Category exists, merge videos
            const existingVideos = mergedData[existingIndex].videos || [];
            const newVideos = newCategory.videos || [];

            // Filter out duplicate videos
            const existingVideoIds = new Set(
              existingVideos.map((v: any) => v.id)
            );
            const uniqueNewVideos = newVideos.filter(
              (video: any) => !existingVideoIds.has(video.id)
            );

            mergedData[existingIndex] = {
              ...mergedData[existingIndex],
              videos: [...existingVideos, ...uniqueNewVideos],
            };
          } else {
            // New category
            mergedData.push(newCategory);
          }
        });

        setPromotedData(mergedData);
      }

      setHasMore(responseData.length > 0);
      setPage(pageNum + 1);
    } catch (err: any) {
      console.error("Error loading promoted data:", err);
      setError(err?.data?.message || "Failed to load promotions");
      setHasMore(false);
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadPromoted(1, true);
  }, []);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !isFetching && !refreshing) {
      loadPromoted(page);
    }
  }, [loadingMore, hasMore, isFetching, refreshing, page]);

  // Initial load
  useEffect(() => {
    loadPromoted(1, true);
  }, []);

  // Render loading state
  if (isLoading && promotedData.length === 0) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-primary`}>
        <ActivityIndicator size="large" color={tw.color("secondaryRed100")} />
        <Text style={tw`mt-2 text-gray-500`}>Loading promotions...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-primary`}>
        <Text style={tw`text-red-500 text-lg mb-4`}>Error: {error}</Text>
        <TouchableOpacity
          onPress={handleRefresh}
          style={tw`bg-secondaryRed100 px-4 py-2 rounded`}
        >
          <Text style={tw`text-white`}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={tw`bg-primary flex-1`}>
      <FlatList
        data={promotedData}
        keyExtractor={(item) => `category-${item.id}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <HeaderBar />
            <Text
              style={tw`text-3xl font-bold text-center my-4 text-secondaryBlack`}
            >
              Promotions
            </Text>
          </>
        }
        renderItem={({ item }) => {
          if (!item?.videos || item?.videos?.length === 0) {
            return null;
          }
          return (
            <View style={tw`mb-6`}>
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
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/details/promotion/${item?.id}`)
                    }
                    style={tw`py-1 flex-row gap-2 items-center px-3 rounded-full border border-secondary`}
                  >
                    <Text style={tw`font-poppinsMedium text-sm text-secondary`}>
                      See all
                    </Text>
                    <SvgXml xml={IconErowred} />
                  </TouchableOpacity>
                </View>
              </View>

              <FlatList
                data={item.videos}
                keyExtractor={(video) => `video-${video.id}`}
                renderItem={({ item: video }) => <Card data={video} />}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            </View>
          );
        }}
        ListFooterComponent={
          loadingMore ? (
            <View style={tw`py-4 flex justify-center items-center`}>
              <ActivityIndicator
                size="small"
                color={tw.color("secondaryRed100")}
              />
              <Text style={tw`mt-2 text-gray-500`}>
                Loading more promotions...
              </Text>
            </View>
          ) : !hasMore && promotedData.length > 0 ? (
            <View style={tw`py-4 flex justify-center items-center`}>
              <Text style={tw`text-gray-500`}>No more promotions to load</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !refreshing ? (
            <View style={tw`py-20 flex justify-center items-center`}>
              <Text style={tw`text-gray-500`}>No promotions found</Text>
            </View>
          ) : null
        }
        contentContainerStyle={tw`pb-10`}
      />
    </View>
  );
};

export default Promotions;
