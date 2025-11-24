import HeaderBar from "@/components/shear/HeaderBar";
import { IconBackLeft, IconCansel, IconPlay } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import {
  useLazyLikeVideosQuery,
  useLikeVideosDeleteMutation,
} from "@/redux/apiSlices/Account/accountSlice";
import { _HIGHT, _Width } from "@/utils/utils";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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

const LikedVideosScreen = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [fetchPosts, { isLoading, isFetching }] = useLazyLikeVideosQuery();
  const [likeVideosDelete] = useLikeVideosDeleteMutation();

  const loadPosts = async (pageNum = 1, isRefresh = false) => {
    try {
      // Prevent multiple simultaneous request
      if ((isLoading || isFetching || loadingMore) && !isRefresh) return;

      setLoadingMore(true);
      const res = await fetchPosts(pageNum).unwrap();
      const responseData = res.data || res;
      const newPosts = responseData?.data || responseData || [];

      if (isRefresh) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      const currentPage = responseData.current_page || pageNum;
      const lastPage = responseData.last_page || 1;
      const total = responseData.total || 0;

      setHasMore(currentPage < lastPage);
      setPage(currentPage + 1);
    } catch (err) {
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadPosts(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !isFetching) {
      setLoadingMore(true);
      loadPosts(page);
    }
  };

  useEffect(() => {
    loadPosts(1, true);
  }, []);

  const handleDelete = async (videoId: number) => {
    try {
      await likeVideosDelete(videoId as any).unwrap();
      setPosts((prev) => prev.filter((item) => item.id !== videoId));
    } catch (err) {}
  };

  if (isLoading && posts.length === 0) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1`}>
      {/* Videos List with RefreshControl */}
      <FlatList
        data={posts}
        keyExtractor={(item, index) => `liked-video-${item.id}-${index}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <HeaderBar />

            {/* Header Section */}
            <View
              style={tw`flex-row justify-between items-center gap-5 px-5 mb-8 mt-4`}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <View
                  style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
                >
                  <SvgXml xml={IconBackLeft} />
                </View>
              </TouchableOpacity>
              <Text style={tw`font-poppinsMedium text-xl`}>Liked videos</Text>
              <View />
            </View>

            {/* Banner Section */}
            <View style={tw`p-5 relative`}>
              <LinearGradient
                style={[
                  tw`rounded-2xl absolute`,
                  { height: _HIGHT * 0.6, width: _Width },
                ]}
                colors={[
                  "#753A88",
                  "#EF4444E5",
                  "#eb7a82",
                  "transparent",
                  "transparent",
                ]}
              />
              <Image
                source={posts[0]?.video?.thumbnail}
                style={{
                  width: _Width * 0.9,
                  height: _HIGHT * 0.3,
                  borderRadius: 20,
                }}
              />
              <View
                style={tw`flex-row items-center justify-between pt-5 pb-20`}
              >
                <View>
                  <Text style={tw`font-poppinsMedium text-2xl text-primary`}>
                    Liked videos
                  </Text>
                  <Text style={tw`font-poppinsMedium text-base text-primary`}>
                    {posts.length} videos
                  </Text>
                </View>
                <TouchableOpacity
                  style={tw`py-3 flex-row gap-4 items-center px-6 rounded-full bg-primary`}
                >
                  <SvgXml xml={IconPlay} />
                  <Text style={tw`font-poppins text-base text-secondaryBlack`}>
                    Play all
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={tw`py-4 flex justify-center items-center`}>
              <ActivityIndicator size="small" color="#0000ff" />
              <Text style={tw`mt-2 text-gray-500`}>Loading more videos...</Text>
            </View>
          ) : !hasMore && posts.length > 0 ? (
            <View style={tw`py-4 flex justify-center items-center`}>
              <Text style={tw`text-gray-500`}>No more videos to load</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/details/video/[id]",
                params: { id: item.video?.id, slug: item.video?.slug },
              })
            }
          >
            <View
              style={tw`flex-row gap-4 px-5 py-3 items-start border-b border-gray-200`}
            >
              <Image
                style={[
                  tw`rounded-xl`,
                  { width: _Width * 0.3, height: _HIGHT * 0.1 },
                ]}
                source={{ uri: item?.video?.thumbnail }}
              />
              <View style={tw`flex-1`}>
                <Text
                  style={tw`text-base font-poppinsMedium text-secondaryBlack`}
                >
                  {item?.video?.title?.split(" ").slice(0, 5).join(" ")}...
                </Text>
                <View style={tw`flex-row justify-between items-center mt-2`}>
                  <Text style={tw`text-sm text-secondaryBlack`}>
                    {item?.video?.views_count || 0} views
                  </Text>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <SvgXml xml={IconCansel} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default LikedVideosScreen;
