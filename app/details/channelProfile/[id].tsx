import Card from "@/components/landing_page/Card";
import HeaderBar from "@/components/shear/HeaderBar";
import SimpleMapView from "@/components/shear/SimpleMapView";
import {
  IconBackLeft,
  IconGmail,
  IconLikes,
  IconLoction,
  IconPhone,
  IconPhoto,
  IconVideo,
} from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { useLazyChannelProfileQuery } from "@/redux/apiSlices/Home/homeApiSlices";
import { _HIGHT, _Width } from "@/utils/utils";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

const ChannelProfile = () => {
  const { id } = useLocalSearchParams();
  const channelId = Number(id);

  // ...................... PAGINATION STATE ........................//
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ...................... API CALL........................//
  const [fetchChannelProfile, { isLoading, isFetching }] =
    useLazyChannelProfileQuery();

  const loadChannelProfile = async (pageNum = 1, isRefresh = false) => {
    try {
      if ((isLoading || isFetching || loadingMore) && !isRefresh) return;
      setLoadingMore(true);
      setError(null);

      const res = await fetchChannelProfile({
        id: channelId,
        page: pageNum,
        per_page: 3,
      }).unwrap();

      const responseData = res.data || res;

      if (isRefresh) {
        // First load or refresh - set all data
        setProfileData(responseData);
        setVideos(responseData.videos?.data || []);
      } else {
        // Load more - only update videos
        const newVideos = responseData.videos?.data || [];

        // Filter out duplicates
        const existingIds = new Set(videos.map((video) => video.id));
        const uniqueNewVideos = newVideos.filter(
          (video: any) => !existingIds.has(video.id)
        );

        setVideos((prev) => [...prev, ...uniqueNewVideos]);
      }

      // Handle pagination
      const videosData = responseData.videos;
      const currentPage = videosData?.current_page || pageNum;
      const lastPage = videosData?.last_page || 1;

      setHasMore(currentPage < lastPage);
      setPage(currentPage + 1);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to load channel profile");
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadChannelProfile(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !isFetching && !refreshing) {
      loadChannelProfile(page);
    }
  };

  useEffect(() => {
    if (channelId) {
      loadChannelProfile(1, true);
    } else {
      setError("Channel ID is missing");
    }
  }, [channelId]);

  if (isLoading && !profileData) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-primary`}>
        <ActivityIndicator size="large" />
        <Text style={tw`mt-2`}>Loading channel profile...</Text>
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

  if (!profileData) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-primary`}>
        <Text>No channel data found</Text>
      </View>
    );
  }

  const {
    total_likes = 0,
    total_videos = 0,
    total_views = 0,
  } = profileData || {};
  const channelInfo = profileData?.channel || {};
  const {
    services,
    locations,
    contact,
    bio,
    avatar,
    cover_image,
    email,
    channel_name,
  } = channelInfo;

  // .................. Find head office location................. //
  const headOffice = locations?.find(
    (item: any) => item.type === "head-office"
  );

  return (
    <View style={tw`flex-1 bg-primary`}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <HeaderBar />
            <View style={tw`flex-row items-center justify-between px-5`}>
              <TouchableOpacity onPress={() => router.back()}>
                <View
                  style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
                >
                  <SvgXml xml={IconBackLeft} />
                </View>
              </TouchableOpacity>
              <Text style={tw`font-poppinsMedium text-xl`}>
                {channel_name || "Channel Profile"}
              </Text>
              <View></View>
            </View>

            {/* Show loading during refresh */}
            {refreshing && (
              <View style={tw`py-2 flex justify-center items-center`}>
                <ActivityIndicator size="small" />
                <Text style={tw`text-gray-500`}>Refreshing...</Text>
              </View>
            )}

            {/* Profile banner */}
            {cover_image && (
              <View style={tw`px-5 pt-5`}>
                <Image
                  source={cover_image}
                  style={[
                    tw`w-full rounded-2xl relative`,
                    { height: _HIGHT * 0.19 },
                  ]}
                />
                {/* Profile avatar */}
                {avatar && (
                  <View
                    style={tw`bg-primary rounded-full h-28 w-28 flex-row items-center justify-center right-[40%] -bottom-10 absolute`}
                  >
                    <Image source={avatar} style={tw`rounded-full h-24 w-24`} />
                  </View>
                )}
              </View>
            )}

            {/* Channel Info */}
            <View style={tw`mt-14 flex-row justify-center`}>
              <View style={tw`flex-1 items-center justify-center`}>
                <Text style={tw`font-poppinsMedium text-xl pb-2`}>
                  {channel_name || "Unknown Channel"}
                </Text>
                {headOffice?.location && (
                  <View style={tw`flex-row gap-3`}>
                    <SvgXml xml={IconLoction} />
                    <Text style={tw`text-base font-poppins`}>
                      {headOffice.location}
                    </Text>
                  </View>
                )}
                {contact && (
                  <View style={tw`flex-row gap-3`}>
                    <SvgXml xml={IconPhone} />
                    <Text style={tw`text-base font-poppins`}>{contact}</Text>
                  </View>
                )}
                {email && (
                  <View style={tw`flex-row gap-3`}>
                    <SvgXml xml={IconGmail} />
                    <Text style={tw`text-base font-poppins`}>{email}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Stats */}
            <View
              style={tw`mt-10 mx-5 p-5 flex-row justify-between items-center border border-primaryGray rounded-xl`}
            >
              <SvgXml xml={IconVideo} />
              <View style={tw`flex-col justify-center items-center`}>
                <Text style={tw`text-base font-poppins`}>Videos</Text>
                <Text style={tw`text-3xl font-poppinsSemiBold`}>
                  {total_videos}
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-center gap-4 pt-2 w-full px-5`}>
              <View
                style={[
                  tw`items-center p-5 pt-4 border border-primaryGray rounded-xl`,
                  { width: _Width * 0.43 },
                ]}
              >
                <SvgXml xml={IconPhoto} />
                <View style={tw`flex-col justify-center items-center`}>
                  <Text style={tw`text-base font-poppins pt-4`}>Views</Text>
                  <Text style={tw`text-3xl font-poppinsSemiBold`}>
                    {total_views}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  tw`items-center p-5 pt-4 border border-primaryGray rounded-xl`,
                  { width: _Width * 0.43 },
                ]}
              >
                <SvgXml xml={IconLikes} />
                <View style={tw`flex-col justify-center items-center`}>
                  <Text style={tw`text-base font-poppins pt-4`}>Likes</Text>
                  <Text style={tw`text-3xl font-poppinsSemiBold`}>
                    {total_likes}
                  </Text>
                </View>
              </View>
            </View>

            {/* Map - Only show if locations exist */}
            {locations && locations.length > 0 && (
              <View
                style={[
                  tw`my-5 mx-5`,
                  { height: 300, borderRadius: 10, overflow: "hidden" },
                ]}
              >
                <SimpleMapView locations={locations} />
              </View>
            )}

            {/* About section */}
            {bio && (
              <View
                style={tw`mt-10 mx-5 p-5 border border-primaryGray rounded-xl`}
              >
                <Text style={tw`font-poppinsMedium text-xl pb-3`}>About</Text>
                <Text style={tw`font-poppins text-sm`}>{bio}</Text>
              </View>
            )}

            {/* Services */}
            {services && services.length > 0 && (
              <View
                style={tw`mt-10 mx-5 p-5 flex-col justify-start mb-4 border border-primaryGray rounded-xl`}
              >
                <Text style={tw`font-poppinsMedium text-xl pb-3`}>
                  Services
                </Text>
                {services.map((item: any, index: number) => (
                  <Text
                    key={index}
                    style={tw`font-poppins text-base pb-2 text-black`}
                  >
                    {item}
                  </Text>
                ))}
              </View>
            )}

            {/* Videos Section Header */}
            <View style={tw`mt-5 px-5`}>
              <Text style={tw`font-poppinsMedium text-xl mb-3`}>
                Videos ({total_videos})
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => <Card data={item} />}
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
              <Text style={tw`text-gray-500`}>
                No videos found for this channel
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={tw`pb-4`}
      />
    </View>
  );
};

export default ChannelProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: 300,
  },
});
