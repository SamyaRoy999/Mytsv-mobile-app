import Promotional from "@/app/(allPages)/promotional";
import Card from "@/components/landing_page/Card";

import HeaderBar from "@/components/shear/HeaderBar";
import CategorySkeleton from "@/components/skeletons/Categoryskeleton";
import HeaderSkeleton from "@/components/skeletons/Headerskeleton";
import VideoCardSkeleton from "@/components/skeletons/VideoCardSkeleton";

import tw from "@/lib/tailwind";
import { useLazyHomePageQuery } from "@/redux/apiSlices/Home/homeApiSlices";
import { useCategoriesQuery } from "@/redux/apiSlices/UploadVideo/uploadVideoSices";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";

const LandingPage = () => {
  const { data: categories } = useCategoriesQuery({});
  const categoryData = categories?.data?.data || [];

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [homePagedata, setHomePagedata] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [fetchHomePage, { isLoading, isFetching }] = useLazyHomePageQuery();

  const loadPosts = async (pageNum = 1, isRefresh = false) => {
    try {
      if ((isLoading || isFetching || loadingMore) && !isRefresh) return;
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoadingMore(true);
      }
      const res = await fetchHomePage({
        page: pageNum,
        id: selectedCategory,
      }).unwrap();
      const responseData = res.data;
      const newPosts = responseData?.data || [];
      if (isRefresh) {
        setHomePagedata(newPosts);
      } else {
        const existingIds = new Set(homePagedata.map((post) => post.id));
        const uniqueNewPosts = newPosts.filter(
          (post: any) => !existingIds.has(post.id),
        );
        setHomePagedata((prev) => [...prev, ...uniqueNewPosts]);
      }
      const currentPage = responseData.current_page || pageNum;
      const lastPage = responseData.last_page || 1;
      setHasMore(currentPage < lastPage);
      setPage(currentPage + 1);
    } catch (err) {
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
      setInitialLoad(false);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    loadPosts(1, true);
  };
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !isFetching && !isLoading) loadPosts(page);
  };

  useEffect(() => {
    loadPosts(1, true);
  }, []);
  useEffect(() => {
    setHomePagedata([]);
    setPage(1);
    setHasMore(true);
    loadPosts(1, true);
  }, [selectedCategory]);

  const renderCategoryItem = ({ item }: any) => (
    <TouchableOpacity
      key={item.id}
      style={tw.style(
        `px-4 py-2 rounded-xl mx-1`,
        selectedCategory === item.id
          ? `bg-secondaryRed100`
          : `border border-secondary`,
      )}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text
        style={tw.style(
          `text-sm font-poppinsMedium`,
          selectedCategory === item.id
            ? `text-gray-900`
            : `text-secondaryBlack text-secondary`,
        )}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (initialLoad) {
    return (
      <View style={tw`flex-1 bg-primary`}>
        <HeaderSkeleton />
        <CategorySkeleton />
        {[0, 1, 2, 3].map((i) => (
          <VideoCardSkeleton key={i} index={i} />
        ))}
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-primary`}>
      <HeaderBar />

      <FlatList
        data={homePagedata}
        keyExtractor={(item) => `video-${item.id}-${item.slug}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View>
            <View style={tw`py-3`}>
              <View style={tw`flex-row items-center px-4`}>
                <TouchableOpacity
                  style={tw.style(
                    `px-4 py-2 rounded-xl mx-1`,
                    selectedCategory === null
                      ? `bg-secondaryRed100`
                      : `border border-secondary`,
                  )}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text
                    style={tw.style(
                      `text-sm font-poppinsMedium`,
                      selectedCategory === null
                        ? `text-gray-900`
                        : `text-secondary`,
                    )}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <FlatList
                  data={categoryData}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>
            <Promotional />
          </View>
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <Card data={item} />}
        ListFooterComponent={
          loadingMore ? (
            <View style={tw`py-4`}>
              <VideoCardSkeleton />
            </View>
          ) : !hasMore && homePagedata.length > 0 ? (
            <View style={tw`py-4 flex justify-center items-center`}>
              <Text style={tw`text-gray-500`}>No more videos to load</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !refreshing ? (
            <View style={tw`py-10 flex justify-center items-center`}>
              <Text style={tw`text-gray-500`}>No videos found</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default LandingPage;
