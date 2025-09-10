import Card from "@/components/landing_page/Card";
import HeaderBar from "@/components/shear/HeaderBar";
import { IconErowred } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { useLazyPromotionalCatagoryQuery } from "@/redux/apiSlices/Promotion/promotionSlices";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
  // ...................... PAGINATION STATE ........................//
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [promotedData, setPromotedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [allCategoriesLoaded, setAllCategoriesLoaded] =
    useState<boolean>(false);

  // ...................... API CALL........................//
  const [fetchPromoted, { isLoading, isFetching }] =
    useLazyPromotionalCatagoryQuery();

  // Track already loaded category IDs to prevent duplicates
  const [loadedCategoryIds, setLoadedCategoryIds] = useState<Set<number>>(
    new Set()
  );

  const loadPromoted = async (pageNum = 1, isRefresh = false) => {
    try {
      if ((isLoading || isFetching || loadingMore) && !isRefresh) return;
      if (allCategoriesLoaded && !isRefresh) return;

      setLoadingMore(true);
      setError(null);

      console.log("Loading page:", pageNum);

      const res = await fetchPromoted({
        page: pageNum,
      }).unwrap();

      console.log("API Response received");

      const responseData = res.data || res;
      const newData = Array.isArray(responseData) ? responseData : [];

      if (isRefresh) {
        // First load or refresh - reset everything
        setPromotedData(newData);
        const newIds = new Set(newData.map((cat) => cat.id));
        setLoadedCategoryIds(newIds);
        setAllCategoriesLoaded(false);
      } else {
        // Load more - check for new categories
        const newCategories = newData.filter(
          (cat) => !loadedCategoryIds.has(cat.id)
        );

        if (newCategories.length === 0) {
          // No new categories found, we've loaded everything
          setAllCategoriesLoaded(true);
          setHasMore(false);
          return;
        }

        // Add new categories to the list
        setPromotedData((prev) => [...prev, ...newCategories]);

        // Update the set of loaded category IDs
        const newIds = new Set(loadedCategoryIds);
        newCategories.forEach((cat) => newIds.add(cat.id));
        setLoadedCategoryIds(newIds);
      }

      setHasMore(true);
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

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setAllCategoriesLoaded(false);
    loadPromoted(1, true);
  };

  const handleLoadMore = () => {
    if (
      !loadingMore &&
      hasMore &&
      !isFetching &&
      !refreshing &&
      !allCategoriesLoaded
    ) {
      console.log("Loading more data...");
      loadPromoted(page);
    }
  };

  useEffect(() => {
    loadPromoted(1, true);
  }, []);

  // Debug logs
  useEffect(() => {
    console.log("Promoted data length:", promotedData.length);
    console.log("Has more:", hasMore);
    console.log("All categories loaded:", allCategoriesLoaded);
  }, [promotedData, hasMore, allCategoriesLoaded]);

  if (isLoading && promotedData.length === 0) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-primary`}>
        <ActivityIndicator size="large" />
        <Text style={tw`mt-2`}>Loading promotions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-primary`}>
        <Text style={tw`text-red-500 text-lg mb-4`}>Error: {error}</Text>
        <TouchableOpacity
          onPress={handleRefresh}
          style={tw`bg-blue-500 px-4 py-2 rounded`}
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
        keyExtractor={(item) => `category-${item.id}-${Math.random()}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1} // Lower threshold for better detection
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <HeaderBar />
            <Text style={tw`text-3xl font-bold text-center mb-4`}>
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
                    style={tw`py-1 flex-row gap-4 items-center px-3 rounded-full border border-secondary`}
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
                keyExtractor={(video) => `video-${video.id}-${Math.random()}`}
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
              <ActivityIndicator size="small" color="#0000ff" />
              <Text style={tw`mt-2 text-gray-500`}>
                Loading more promotions...
              </Text>
            </View>
          ) : allCategoriesLoaded ? (
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
