import HeaderBar from "@/components/shear/HeaderBar";
import {
  IconAdd,
  IconBack,
  IconBackLeft,
  IconClose,
  IconUpload,
  IconWorld,
  IconYoutub,
} from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { useLazyMyVideoQuery } from "@/redux/apiSlices/MyVideo/myvideoSlice";
import { _HIGHT, _Width } from "@/utils/utils";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { SvgXml } from "react-native-svg";

const MyVideos = () => {
  const [history, setHistory] = React.useState(false);
  const [uploadModalVisible, setUploadModalVisible] = React.useState(false);

  // ......................PAGINATION LOGIC ..................//
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [fetchVideos, { isLoading, isFetching }] = useLazyMyVideoQuery();

  const loadVideos = async (pageNum = 1, isRefresh = false) => {
    try {
      if ((isLoading || isFetching || loadingMore) && !isRefresh) return;
      setLoadingMore(true);

      const res = await fetchVideos({ page: pageNum }).unwrap();

      // Extract the nested data structure correctly
      const responseData = res.data || res;
      const currentPage = responseData.current_page || pageNum;
      const lastPage = responseData.last_page || 1;
      const newVideos = responseData.data || []; // This is the nested array

      if (isRefresh) {
        setVideos(newVideos);
      } else {
        // Filter out duplicates before adding new videos
        const existingIds = new Set(videos.map((video) => video.id));
        const uniqueNewVideos = newVideos.filter(
          (video: any) => !existingIds.has(video.id)
        );
        setVideos((prev) => [...prev, ...uniqueNewVideos]);
      }

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
    loadVideos(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !isFetching) {
      setLoadingMore(true);
      loadVideos(page);
    }
  };

  useEffect(() => {
    loadVideos(1, true);
  }, []);

  if (isLoading && videos.length === 0) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-primary`}>
        <ActivityIndicator size="large" />
        <Text style={tw`mt-2`}>Loading videos...</Text>
      </View>
    );
  }

  return (
    <View style={tw`bg-primary flex-1`}>
      <HeaderBar />

      <View
        style={tw`flex-row justify-between items-center gap-5 px-5 mb-4 mt-4`}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <View
            style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
          >
            <SvgXml xml={IconBackLeft} />
          </View>
        </TouchableOpacity>

        <Text style={tw`font-poppinsMedium text-xl`}>My videos</Text>

        <TouchableOpacity onPress={() => setUploadModalVisible(true)}>
          <View
            style={tw`bg-secondary w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
          >
            <SvgXml xml={IconAdd} />
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        keyExtractor={(item) => `video-${item.id}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`px-5 pb-4`}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/details/Videodetails/${item.id}`)}
            style={tw`mb-4`}
          >
            <View style={tw`flex-row gap-4`}>
              <Image
                style={[
                  tw`rounded-xl`,
                  { width: _Width * 0.4, height: _HIGHT * 0.16 },
                ]}
                source={{ uri: item?.thumbnail }}
                contentFit="cover"
              />
              <View style={tw`flex-1`}>
                <Text
                  style={tw`text-base font-poppinsMedium py-1 text-secondaryBlack`}
                  numberOfLines={2}
                >
                  {item?.title}
                </Text>
                <Text
                  style={tw`text-sm py-1 text-secondaryBlack`}
                  numberOfLines={2}
                >
                  {item?.description}
                </Text>
                <TouchableOpacity
                  style={tw`py-2 flex-row gap-2 items-center border border-primaryGray px-4 rounded-full bg-primary mt-2`}
                >
                  <SvgXml xml={IconWorld} />
                  <Text style={tw`font-poppins text-sm text-secondaryBlack`}>
                    {item?.visibility || "Everyone"}
                  </Text>
                </TouchableOpacity>

                {/* Additional video info */}
                <View style={tw`flex-row gap-3 mt-2`}>
                  <Text style={tw`text-xs text-gray-500`}>
                    {item?.views_count_formated} views
                  </Text>
                  <Text style={tw`text-xs text-gray-500`}>
                    {item?.created_at_format}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          loadingMore ? (
            <View style={tw`py-4 flex justify-center items-center`}>
              <ActivityIndicator size="small" color="#0000ff" />
              <Text style={tw`mt-2 text-gray-500`}>Loading more videos...</Text>
            </View>
          ) : !hasMore && videos.length > 0 ? (
            <View style={tw`py-4 flex justify-center items-center`}>
              <Text style={tw`text-gray-500`}>No more videos to load</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !refreshing ? (
            <View style={tw`py-20 flex justify-center items-center`}>
              <Text style={tw`text-gray-500 text-center`}>
                No videos found{"\n"}
                <Text style={tw`text-sm`}>
                  Upload your first video to get started!
                </Text>
              </Text>
            </View>
          ) : null
        }
      />

      {/* Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={tw`bg-primary rounded-t-3xl absolute bottom-0 w-full h-2/6`}
          >
            <View
              style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between p-5`}
            >
              <View></View>
              <Text style={tw`text-primary text-xl font-poppins`}>Upload</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <SvgXml xml={IconClose} />
              </TouchableOpacity>
            </View>

            <View style={tw`px-4 py-6 flex-1 justify-center`}>
              <View style={tw`flex-col justify-center gap-3`}>
                <TouchableOpacity
                  onPress={() => {
                    setUploadModalVisible(false);
                    router.push("/(allPages)/uploadVideo");
                  }}
                  style={tw`py-4 bg-primaryText flex-row rounded-2xl justify-between px-4 items-center gap-3`}
                >
                  <View style={tw`flex-row items-center gap-3`}>
                    <SvgXml xml={IconUpload} />
                    <Text style={tw`text-lg font-poppins`}>
                      Upload video{" "}
                      <Text style={tw`text-sm`}>($9.99 / month)</Text>
                    </Text>
                  </View>
                  <SvgXml xml={IconBack} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setUploadModalVisible(false);
                    router.push("/(allPages)/youTubeLink");
                  }}
                  style={tw`py-4 bg-primaryText flex-row rounded-2xl justify-between px-4 items-center gap-3`}
                >
                  <View style={tw`flex-row items-center gap-3`}>
                    <SvgXml xml={IconYoutub} />
                    <Text style={tw`text-lg font-poppins`}>
                      YouTube Link <Text style={tw`text-sm`}>(Free)</Text>
                    </Text>
                  </View>
                  <SvgXml xml={IconBack} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyVideos;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
