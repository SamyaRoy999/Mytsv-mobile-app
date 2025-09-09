import {
  IconAccount,
  IconAccountActive,
  IconAdd,
  IconBlog,
  IconBlogActive,
  IconClose,
  IconErowBack,
  IconHome,
  IconHomeActive,
  IconPromotions,
  IconPromotionsActive,
  IconUpload,
  IconYoutub,
} from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { usePriceGetAllQuery } from "@/redux/apiSlices/Home/homeApiSlices";
import { useMyProfileQuery } from "@/redux/apiSlices/MyVideo/myvideoSlice";
import { _Width } from "@/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useLinkBuilder } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router, Tabs, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

const icons = {
  landingPage: {
    active: IconHomeActive,
    inactive: IconHome,
    name: "Home",
  },
  Blogs: {
    active: IconBlogActive,
    inactive: IconBlog,
    name: "Blogs",
  },
  Promotions: {
    active: IconPromotionsActive,
    inactive: IconPromotions,
    name: "Promotions",
  },
  Account: {
    active: IconAccountActive,
    inactive: IconAccount,
    name: "Account",
  },
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [token, setToken] = React.useState<string | null>(null);
  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useMyProfileQuery({});
  const isAuthenticated = token && userData?.data?.email;

  const { buildHref } = useLinkBuilder();
  const { width } = Dimensions.get("window");
  const tabCount = state.routes.length;
  const tabWidth = width / tabCount;

  const translateX = useRef(new Animated.Value(0)).current;
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const { data: price } = usePriceGetAllQuery({});

  useFocusEffect(
    useCallback(() => {
      const checkToken = async () => {
        const userToken = await AsyncStorage.getItem("token");
        setToken(userToken);
        refetchUser();
      };
      checkToken();
    }, [])
  );

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
    }).start();
  }, [state.index]);
  if (isUserLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View
      style={tw`flex-row relative  bottom-0 left-0 right-0 justify-around items-center bg-secondary px-4 pt-4 pb-2`}
    >
      {/* Animated underline */}
      <Animated.View
        style={[
          tw`absolute bottom-0 h-1 bg-primaryText rounded-t-xl`,
          {
            width: tabWidth * 0.8,
            transform: [{ translateX }],
            left: tabWidth * 0.1,
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        if (route.name === "add") {
          return <View key="add" style={tw`flex-1`} />;
        }

        const iconSet = icons[route.name];

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            href={buildHref(route.name)}
            onPress={onPress}
            onLongPress={onLongPress}
            style={tw`flex-1 relative justify-center items-center`}
          >
            <SvgXml xml={isFocused ? iconSet.active : iconSet.inactive} />
            <Text style={tw`text-[11px] font-poppins text-[#FFFFFF]`}>
              {iconSet.name}
            </Text>
          </TouchableOpacity>
        );
      })}

      {isAuthenticated ? (
        // Add Button - Centered
        <TouchableOpacity
          onPress={() => setUploadModalVisible(true)}
          style={tw`absolute bottom-12`}
        >
          <LinearGradient
            colors={["#EF4444", "#FF6868"]}
            style={tw`w-12 h-12 rounded-full justify-center items-center shadow-lg`}
          >
            <SvgXml xml={IconAdd} />
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View></View>
      )}

      {/* Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setUploadModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={tw`w-full`}
            onPress={(e) => e.stopPropagation()} // Prevent closing when modal content is pressed
          >
            <View style={tw`bg-primary rounded-t-3xl w-full h-80`}>
              <View
                style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between p-5`}
              >
                <View></View>
                <Text style={tw`text-primary text-xl font-poppins`}>
                  Upload
                </Text>
                <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                  <SvgXml xml={IconClose} />
                </TouchableOpacity>
              </View>
              <ScrollView
                contentContainerStyle={tw`px-4 py-6 flex-1 items-center justify-center`}
                showsVerticalScrollIndicator={false}
              >
                <View style={tw`flex-col justify-center gap-3 w-full`}>
                  <TouchableOpacity
                    onPress={() => {
                      setUploadModalVisible(false);
                      router.push("/(allPages)/uploadVideo");
                    }}
                    style={tw`py-5 bg-primaryText flex-row rounded-2xl justify-between px-4 items-center gap-3`}
                  >
                    <View style={tw`flex-row items-center gap-3`}>
                      <SvgXml xml={IconUpload} />
                      <Text style={tw`text-lg font-poppins`}>
                        Upload video{" "}
                        <Text style={tw`text-sm`}>
                          ({price?.data?.uploading_video})
                        </Text>
                      </Text>
                    </View>
                    <SvgXml xml={IconErowBack} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setUploadModalVisible(false);
                      router.push("/(allPages)/youTubeLink");
                    }}
                    style={tw`py-5 bg-primaryText flex-row rounded-2xl justify-between px-4 items-center gap-3`}
                  >
                    <View style={tw`flex-row items-center gap-3`}>
                      <SvgXml xml={IconYoutub} />
                      <Text style={tw`text-lg font-poppins`}>
                        YouTube Link{" "}
                        <Text style={tw`text-sm`}>
                          ({price?.data?.uploading_youTube_link})
                        </Text>
                      </Text>
                    </View>
                    <SvgXml xml={IconErowBack} />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="landingPage" options={{ title: "Home" }} />
      <Tabs.Screen name="Blogs" options={{ title: "Blogs" }} />
      <Tabs.Screen name="Promotions" options={{ title: "Promotions" }} />
      <Tabs.Screen name="Account" options={{ title: "Account" }} />
    </Tabs>
  );
};

export default TabLayout;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  video: {
    width: _Width,
    height: 250,
  },
});
