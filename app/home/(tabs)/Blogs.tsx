import HeaderBar from "@/components/shear/HeaderBar";
import tw from "@/lib/tailwind";
import { useLazyBlogsQuery } from "@/redux/apiSlices/Blogs/blogsSlices";
import { _HIGHT } from "@/utils/utils";
import { Image } from "expo-image";
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
import { WebView } from "react-native-webview";

const Blogs = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [blog, setBlogs] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const [fetchBlogs, { isFetching }] = useLazyBlogsQuery();

  const loadPosts = async (pageNum = 1, isRefresh = false) => {
    try {
      if (loadingMore && !isRefresh) return;

      setLoadingMore(true);

      const res = await fetchBlogs({ page: pageNum }).unwrap();

      const paginatedData = res?.data;
      const newPosts: any[] = paginatedData?.data || [];

      if (isRefresh) {
        setBlogs(newPosts);
      } else {
        const existingIds = new Set(blog.map((post) => post.id));
        const uniqueNewPosts = newPosts.filter(
          (post: any) => !existingIds.has(post.id),
        );
        setBlogs((prev) => [...prev, ...uniqueNewPosts]);
      }

      const currentPage: number = paginatedData?.current_page || pageNum;
      const lastPage: number = paginatedData?.last_page || 1;

      setHasMore(currentPage < lastPage);
      setPage(currentPage + 1);
    } catch (err) {
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
      setInitialLoading(false);
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
      loadPosts(page);
    }
  };

  useEffect(() => {
    loadPosts(1, true);
  }, []);

  const renderItem = ({ item }: any) => {
    const { description, title, image } = item;

    const plainText = description.replace(/<[^>]*>/g, "");
    const descriptionData = plainText.split(" ").slice(0, 25).join(" ");

    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-size: 16px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #333;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>
          ${descriptionData}...
        </body>
      </html>
    `;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/details/Blog/${item.slug}`)}
      >
        <View
          style={tw`mb-5 m-4 bg-white rounded-lg overflow-hidden shadow-sm`}
        >
          <Image
            source={{ uri: image }}
            style={tw`w-full h-48`}
            contentFit="cover"
          />

          <View style={tw`p-4`}>
            <Text style={tw`font-poppinsMedium text-lg`}>{title}</Text>
            <View style={{ height: _HIGHT * 0.08 }}>
              <WebView
                originWhitelist={["*"]}
                source={{ html: htmlContent }}
                style={tw`flex-1 bg-transparent`}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              />
            </View>

            <Text style={tw`text-sm font-poppins mt-2`}>
              <Text style={tw`text-blue-600 font-poppinsSemiBold text-base`}>
                Read more...
              </Text>
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (initialLoading) {
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <HeaderBar />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={tw`mt-2 text-gray-500`}>Loading blogs...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <FlatList
        data={blog}
        keyExtractor={(item, index) => `blogs-${item.id}-${index}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        contentContainerStyle={tw`pb-10`}
        ListHeaderComponent={
          <View>
            <HeaderBar />
            <Text style={tw`text-3xl font-bold text-center my-4`}>Blogs</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={tw`py-4 flex justify-center items-center`}>
              <ActivityIndicator size="small" color="#0000ff" />
              <Text style={tw`mt-2 text-gray-500`}>Loading more blogs...</Text>
            </View>
          ) : !hasMore && blog.length > 0 ? (
            <View style={tw`py-4 flex justify-center items-center`}>
              <Text style={tw`text-gray-500`}>No more blogs to load</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={tw`py-10 flex justify-center items-center`}>
            <Text style={tw`text-gray-500`}>No blogs found</Text>
          </View>
        }
      />
    </View>
  );
};

export default Blogs;
