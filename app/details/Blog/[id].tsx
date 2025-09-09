import HeaderBar from "@/components/shear/HeaderBar";
import { IconBackLeft } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { useBlogsDetailQuery } from "@/redux/apiSlices/Blogs/blogsSlices";
import { _HIGHT } from "@/utils/utils";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import WebView from "react-native-webview";

const Blag = () => {
 const { id } = useLocalSearchParams();
const { data: blog, isLoading, error } = useBlogsDetailQuery({ id });

if (isLoading) {
  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <Text>Loading...</Text>
    </View>
  );
}

if (error) {
  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <Text>Error loading blog post</Text>
    </View>
  );
}

if (!blog?.data) {
  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <Text>Blog post not found</Text>
    </View>
  );
}

// Now safely destructure after all checks
const { title, description, image } = blog.data;

  const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-size: 16px;

            }
          </style>
        </head>
        <body>
          ${description}
        </body>
      </html>
    `;
  return (
    <View style={tw`bg-primary flex-1`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderBar />
        <View style={tw`flex-row items-center gap-5 px-5 mb-8`}>
          <TouchableOpacity onPress={() => router.back()}>
            <View
              style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
            >
              <SvgXml xml={IconBackLeft} />
            </View>
          </TouchableOpacity>
          <Text style={tw`font-poppinsMedium text-xl`}>
            Blog Details
          </Text>
        </View>
        <Image source={image} style={tw`w-full h-72`} />
        <Text style={tw`font-poppinsMedium text-lg px-4 py-5`}>
          {title}
        </Text>
        <View style={[tw`px-4`,{ height: _HIGHT }]}>
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={tw`flex-1 bg-primary  `}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Blag;
