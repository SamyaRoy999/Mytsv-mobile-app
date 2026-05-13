import HeaderBar from "@/components/shear/HeaderBar";
import { IconbackRight, IconTermsAndCon } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { useTerms_conditionsQuery } from "@/redux/apiSlices/Account/accountSlice";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import WebView from "react-native-webview";

const INJECTED_JS = `
  (function() {
    function sendHeight() {
      var height = document.documentElement.scrollHeight || document.body.scrollHeight;
      window.ReactNativeWebView.postMessage(String(height));
    }
    sendHeight();
    window.addEventListener('load', sendHeight);
    setTimeout(sendHeight, 300);
  })();
  true;
`;

const TermsConditions = () => {
  const {
    data: termsCondData,
    isLoading,
    error,
  } = useTerms_conditionsQuery({});

  const [webViewHeight, setWebViewHeight] = useState(300);
  const hasSetHeight = useRef(false);

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
        <Text>Error loading TermsCond Data</Text>
      </View>
    );
  }

  const termsData = termsCondData?.data?.[0];
  const { text, type } = termsData || {};

  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 0;
            font-size: 15px;
            line-height: 1.6;
            word-break: break-word;
            overflow-x: hidden;
          }
        </style>
      </head>
      <body>
        ${text ?? ""}
      </body>
    </html>
  `;

  return (
    <View style={tw`bg-primary flex-1`}>
      <ScrollView
        contentContainerStyle={tw`p-4`}
        showsVerticalScrollIndicator={false}
      >
        <HeaderBar />

        <TouchableOpacity onPress={() => router.back()}>
          <SvgXml xml={IconbackRight} />
        </TouchableOpacity>

        {/* Top Icon */}
        <View style={tw`items-center`}>
          <SvgXml xml={IconTermsAndCon} />
        </View>

        {/* Title */}
        <Text
          style={tw`text-lg font-poppinsMedium text-center mb-8 bg-primaryText py-4 rounded-full`}
        >
          {type}
        </Text>

        {/* Subtitle */}
        <Text style={tw`text-lg font-poppinsMedium text-center`}>
          Welcome to mytsv.com. By accessing or using our website, you agree to
          comply with and be bound by the following terms and conditions. Please
          read them carefully before using the site.
        </Text>

        {/* WebView Container */}
        <View style={tw`border rounded-xl p-7 mb-4 border-primaryGray mt-7`}>
          <View style={{ height: webViewHeight }}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: htmlContent }}
              style={tw`flex-1 bg-primary`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              injectedJavaScript={INJECTED_JS}
              onMessage={(event) => {
                const h = Number(event.nativeEvent.data);
                if (h > 0) {
                  setWebViewHeight(h);
                }
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TermsConditions;
