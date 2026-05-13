import HeaderBar from "@/components/shear/HeaderBar";
import { IconBackLeft } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { useBlogsDetailQuery } from "@/redux/apiSlices/Blogs/blogsSlices";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import WebView from "react-native-webview";

const Blag = () => {
  const { id } = useLocalSearchParams();

  const { data: blog, isLoading, error } = useBlogsDetailQuery({ id });
  const [webViewHeight, setWebViewHeight] = useState(300);

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

  const { title, description, image } = blog.data;

  const injectedScript = `
    (function() {
      function sendHeight() {
        var height = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight
        );
        window.ReactNativeWebView.postMessage(String(height));
      }
      sendHeight();
      window.addEventListener('load', sendHeight);
      setTimeout(sendHeight, 300);
      setTimeout(sendHeight, 800);
    })();
    true;
  `;

  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          * {
            box-sizing: border-box !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            overflow: hidden;
            font-size: 16px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #333;
            word-break: break-word;
            overflow-wrap: break-word;
          }
          img, video, iframe {
            max-width: 100% !important;
            height: auto !important;
            display: block;
          }
          p, h1, h2, h3, h4, span, a, li {
            word-break: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
          }
        </style>
      </head>
      <body>${description}</body>
    </html>
  `;

  return (
    <View style={tw`bg-primary flex-1`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderBar />

        {/* Back button + Title */}
        <View style={tw`flex-row items-center gap-5 px-5 mb-8`}>
          <TouchableOpacity onPress={() => router.back()}>
            <View
              style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
            >
              <SvgXml xml={IconBackLeft} />
            </View>
          </TouchableOpacity>
          <Text style={tw`font-poppinsMedium text-xl`}>Blog Details</Text>
        </View>

        {/* Thumbnail */}
        <Image source={image} style={tw`w-full h-72`} />

        {/* Blog Title */}
        <Text style={tw`font-poppinsMedium text-lg px-4 py-5`}>{title}</Text>

        <View style={[tw`px-4`, { height: webViewHeight }]}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: htmlContent }}
            style={{ width: "100%", height: webViewHeight }}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            scalesPageToFit={false}
            injectedJavaScript={injectedScript}
            onMessage={(event) => {
              const height = Number(event.nativeEvent.data);
              if (height > 0) setWebViewHeight(height);
            }}
          />
        </View>

        {/* Bottom spacing */}
        <View style={tw`h-10`} />
      </ScrollView>
    </View>
  );
};

export default Blag;
