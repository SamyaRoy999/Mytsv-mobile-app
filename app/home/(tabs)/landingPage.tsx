import CatagoryCard from "@/components/landing_page/CatagoryCard";
import SliderLanding from "@/components/landing_page/SliderLanding";
import HeaderBar from "@/components/shear/HeaderBar";
import tw from "@/lib/tailwind";
import { useProfileQuery } from "@/redux/apiSlices/Account/accountSlice";
import {
  useLazyCaragoryVideosQuery,
  usePromotedVideoHomeQuery,
} from "@/redux/apiSlices/Home/homeApiSlices";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

const LandingPage = () => {
  const {
    data: defouldData,
    isLoading: userLoading,
    refetch: userRef,
  } = useProfileQuery({});

  // ................promoted video api.................//
  const { data: promoted, isLoading: lodingPromoted } =
    usePromotedVideoHomeQuery({});
  const promotedVideo = promoted?.data?.data;

  // .............caragoryVideo with pagination ................//
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [fetchCategories, { isLoading, isFetching }] =
    useLazyCaragoryVideosQuery();

  const loadCategories = async (pageNum = 1, isRefresh = false) => {
    try {
      if ((isLoading || isFetching || loadingMore) && !isRefresh) return;

      setLoadingMore(true);
      const res = await fetchCategories({ page: pageNum }).unwrap();

      // Extract the nested data structure
      const responseData = res.data || res;
      const currentPage = responseData.current_page || pageNum;
      const lastPage = responseData.last_page || 1;
      const newCategories = responseData.data || [];

      if (isRefresh) {
        setCategories(newCategories);
      } else {
        // Filter out duplicates before adding new categories
        const existingIds = new Set(categories.map((cat) => cat.id));
        const uniqueNewCategories = newCategories.filter(
          (cat: any) => !existingIds.has(cat.id)
        );
        setCategories((prev) => [...prev, ...uniqueNewCategories]);
      }

      setHasMore(currentPage < lastPage);
      setPage(currentPage + 1);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadCategories(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !isFetching) {
      setLoadingMore(true);
      loadCategories(page);
    }
  };

  useEffect(() => {
    loadCategories(1, true);
  }, []);

  useEffect(() => {
    userRef();
    if (
      defouldData?.data?.registration_type === "on_site" &&
      defouldData?.data?.is_pay === 0
    ) {
      router.push("/(allPages)/paymentOnside");
    }
  }, [defouldData]);

  if (userLoading || lodingPromoted || isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" />
        <Text style={tw`mt-2`}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1`}>
      <FlatList
        data={categories}
        keyExtractor={(item) => `category-${item.id}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <HeaderBar />
            <SliderLanding />
          </>
        }
        renderItem={({ item }) => (
          <CatagoryCard data={item} isLoading={isLoading} />
        )}
        ListFooterComponent={
          loadingMore ? (
            <View style={tw`py-4 flex justify-center items-center`}>
              <ActivityIndicator size="small" color="#0000ff" />
              <Text style={tw`mt-2 text-gray-500`}>
                Loading more categories...
              </Text>
            </View>
          ) : !hasMore && categories.length > 0 ? (
            <View style={tw`py-4 flex justify-center items-center`}>
              <Text style={tw`text-gray-500`}>No more categories to load</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !refreshing ? (
            <View style={tw`py-10 flex justify-center items-center`}>
              <Text style={tw`text-gray-500`}>No categories found</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default LandingPage;
