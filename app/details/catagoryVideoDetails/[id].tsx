// catagoryVideoDetails.tsx
import Card from '@/components/landing_page/Card'
import { CarouselCard } from '@/components/landing_page/CarouselCard'
import { IconBackLeft } from '@/icons/Icon'
import tw from '@/lib/tailwind'
import { useLazyCatagoryDetailsQuery } from '@/redux/apiSlices/catagoryDataSlices/catagoryDataSlices'
import { usePromotedVideoQuery } from '@/redux/apiSlices/Home/homeApiSlices'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'

const CatagoryVideoDetails = () => {
    const { id } = useLocalSearchParams()

    // Promotional video API
    const { data: promoted } = usePromotedVideoQuery({
        category_id: id,
    });

    const promotedVideo = promoted?.data?.data;

    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [videoCatagory, setVideoCatagory] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);

    // Use the lazy query with proper parameters
    const [fetchVideoCatagory, { isLoading, isFetching }] = useLazyCatagoryDetailsQuery();

    // Load posts function
    const loadPosts = async (pageNum = 1, isRefresh = false) => {
        try {
            if (isFetching) return;

            const res = await fetchVideoCatagory({
                id: id as string,
                page: pageNum
            }).unwrap();
            const responseData = res.data;
            const newPosts = responseData?.data || [];

            if (isRefresh) {
                setVideoCatagory(newPosts);
            } else {
                // Filter out duplicates
                const existingIds = new Set(videoCatagory.map(post => post.id));
                const uniqueNewPosts = newPosts.filter((post: any) => !existingIds.has(post.id));
                setVideoCatagory(prev => [...prev, ...uniqueNewPosts]);
            }

            // Update pagination state
            setHasMore(responseData.current_page < responseData.last_page);
            setPage(responseData.current_page + 1);

        } catch (err) {
        } finally {
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setVideoCatagory([]);
        setPage(1);
        setHasMore(true);
        loadPosts(1, true);
    };

    const handleLoadMore = () => {
        if (!isFetching && hasMore && videoCatagory.length > 0) {
            loadPosts(page);
        }
    };

    useEffect(() => {
        loadPosts(1, true);
    }, [id]);

    // Get category name from first video
    const categoryName = videoCatagory[0]?.category?.name || "Category";

    return (
        <View style={tw`flex-1 bg-white`}>
            {/* Header */}
            <View style={tw`pt-10 px-5 pb-4 bg-white border-b border-gray-200`}>
                <View style={tw`flex-row justify-between items-center`}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <View style={tw`bg-primaryText w-10 h-10 rounded-full items-center justify-center border border-primaryGray`}>
                            <SvgXml xml={IconBackLeft} width={20} height={20} />
                        </View>
                    </TouchableOpacity>
                    <Text style={tw`font-poppinsMedium text-xl flex-1 text-center`}>
                        {categoryName}
                    </Text>
                    <View style={tw`w-10`}></View>
                </View>
            </View>

            {/* Main Content with FlatList */}
            <FlatList
                data={videoCatagory}
                keyExtractor={(item) => `video-${item.id}`}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
                renderItem={({ item }) => <Card data={item} />}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                contentContainerStyle={tw` pb-20`}
                ListHeaderComponent={
                    promotedVideo && promotedVideo.length > 0 ? (
                        <View style={tw`mb-4`}>
                            <CarouselCard promotedVideo={promotedVideo} />
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    isFetching && !refreshing ? (
                        <View style={tw`py-4 items-center`}>
                            <ActivityIndicator size="small" color="#0000ff" />
                            <Text style={tw`mt-2 text-gray-500`}>Loading more videos...</Text>
                        </View>
                    ) : !hasMore && videoCatagory.length > 0 ? (
                        <View style={tw`py-4 items-center`}>
                            <Text style={tw`text-gray-500`}>No more videos to load</Text>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !isLoading && !isFetching && !refreshing ? (
                        <View style={tw`py-20 items-center`}>
                            <Text style={tw`text-gray-500`}>No videos found</Text>
                        </View>
                    ) : null
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

export default CatagoryVideoDetails;