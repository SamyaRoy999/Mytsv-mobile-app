import { ImgLogo } from "@/assets/images/images";
import HeaderBar from "@/components/shear/HeaderBar";
import {
  IconAboutus,
  IconAnalytics,
  IconBack,
  IconCansel,
  IconChangepass,
  IconContactus,
  IconDeshboard,
  IconFAQ,
  IconLike,
  IconLine,
  IconLogout,
  IconMyvideos,
  IconPrivacy,
  IconProfileView,
  IconReports,
  IconSettings,
  IconTerms,
  IconTime,
} from "@/icons/Icon";
import tw from "@/lib/tailwind";
import {
  useHistoryVideoDeleteMutation,
  useHistoryVideoQuery,
  useLikeVideosDeleteMutation,
  useLikeVideosQuery,
} from "@/redux/apiSlices/Account/accountSlice";
import { useMyProfileQuery } from "@/redux/apiSlices/MyVideo/myvideoSlice";
import { _HIGHT, _Width } from "@/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ALERT_TYPE,
  AlertNotificationRoot,
  Toast,
} from "react-native-alert-notification";
import { SvgXml } from "react-native-svg";

const Account = () => {
  const [token, setToken] = React.useState<string | null>(null);

  const {
    data: historyVideo,
    isLoading,
    error,
    refetch,
  } = useHistoryVideoQuery({});
  const {
    data: likeVideo,
    isLoading: islikeVideoLoading,
    refetch: islikeVideoRef,
  } = useLikeVideosQuery({});
  const [deleteHistoryVideo] = useHistoryVideoDeleteMutation();
  const [likeVideosDelete] = useLikeVideosDeleteMutation();
  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useMyProfileQuery({});
  const isAuthenticated = token && userData?.data?.email;
  useFocusEffect(
    useCallback(() => {
      const checkToken = async () => {
        const userToken = await AsyncStorage.getItem("token");
        setToken(userToken);
        refetch();
        islikeVideoRef();
        refetchUser();
      };
      checkToken();
    }, [])
  );
  if (isLoading || islikeVideoLoading || isUserLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // .............. DELETE ............ //

  const handleDeleteVideo = async (type: "history" | "like", id: any) => {
    try {
      let res;
      if (type === "history") {
        res = await deleteHistoryVideo(id).unwrap();
        refetch();
      } else if (type === "like") {
        res = await likeVideosDelete(id).unwrap();
      }
      if (res?.status) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: res.message,
          autoClose: 2000,
        });
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: res?.message || "Something went wrong!",
          autoClose: 2000,
        });
      }
    } catch (err) {}
  };

  return (
    <View style={tw`flex-1 bg-primary `}>
      {isAuthenticated ? (
        <AlertNotificationRoot>
          <ScrollView showsVerticalScrollIndicator={false}>
            <HeaderBar />
            <View
              style={tw`flex-row w-full justify-between items-center px-5 py-6`}
            >
              <TouchableOpacity
                style={tw` flex-row gap-2 py-3 rounded-lg items-center`}
              >
                <SvgXml xml={IconTime} />
                <Text
                  style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                >
                  History
                </Text>
              </TouchableOpacity>
              <View style={tw``}>
                <TouchableOpacity
                  onPress={() => router.push("/(allPages)/history")}
                  style={tw`py-1 px-5 rounded-full border border-primaryGray`}
                >
                  <Text style={tw`font-poppinsMedium text-base text-black`}>
                    View all
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={tw`px-2 mx-4`}>
              {/* History  */}
              {historyVideo?.data?.data.length === 0 ? (
                <View style={tw`flex-1 justify-center items-center mt-10`}>
                  <Text style={tw`font-poppins text-lg`}>
                    No watch history found
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={historyVideo?.data?.data}
                  keyExtractor={(item) => item.id.toString()}
                  showsHorizontalScrollIndicator={false}
                  // scrollEnabled={false}
                  horizontal
                  renderItem={({ item }) => {
                    return (
                      <View style={[tw` mr-4`, { width: _Width * 0.4 }]}>
                        <TouchableOpacity
                          onPress={() =>
                            router.push({
                              pathname: "/details/video/[id]",
                              params: {
                                id: item.video?.id,
                                slug: item.video?.slug,
                              },
                            })
                          }
                        >
                          <Image
                            style={[
                              tw`rounded-xl`,
                              { width: _Width * 0.4, height: _HIGHT * 0.1 },
                            ]}
                            source={{ uri: item?.video?.thumbnail }}
                          />
                          <Text
                            style={tw`text-base font-poppinsMedium py-1 text-secondaryBlack `}
                          >
                            {item.video?.title
                              ?.split(" ")
                              .slice(0, 4)
                              .join(" ")}
                            ...
                          </Text>
                          <View
                            style={tw`flex-row justify-between w-full items-center`}
                          >
                            <Text
                              style={tw`text-sm font-poppins  text-secondaryBlack `}
                            >
                              {item.video?.user?.channel_name}
                            </Text>
                            {/* Delete Button */}
                            <TouchableOpacity
                              onPress={() =>
                                handleDeleteVideo("history", item?.id)
                              }
                            >
                              <SvgXml xml={IconCansel} width={20} height={20} />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />
              )}
            </View>
            {/* liked video */}
            <View
              style={tw`flex-row w-full justify-between items-center px-5 py-6`}
            >
              <TouchableOpacity
                style={tw` flex-row gap-2 py-3 rounded-lg items-center`}
              >
                <SvgXml xml={IconLike} />
                <Text
                  style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                >
                  Liked videos
                </Text>
              </TouchableOpacity>
              <View style={tw``}>
                <TouchableOpacity
                  style={tw`py-1 px-5 rounded-full border border-primaryGray`}
                  onPress={() => router.push("/(allPages)/likeds")}
                >
                  <Text style={tw`font-poppinsMedium text-base text-black`}>
                    View all
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={tw`px-2 mx-4`}>
              {/* like  */}
              {likeVideo?.data?.data.length === 0 ? (
                <View style={tw`flex-1 justify-center items-center mt-10`}>
                  <Text style={tw`font-poppins text-lg`}>
                    No Like Video found
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={likeVideo?.data?.data}
                  keyExtractor={(item) => item.id.toString()}
                  showsHorizontalScrollIndicator={false}
                  // scrollEnabled={false}
                  horizontal
                  renderItem={({ item }) => (
                    <View style={[tw` mr-4`, { width: _Width * 0.4 }]}>
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname: "/details/video/[id]",
                            params: {
                              id: item.video?.id,
                              slug: item.video?.slug,
                            },
                          })
                        }
                      >
                        <Image
                          style={[
                            tw`rounded-xl`,
                            { width: _Width * 0.4, height: _HIGHT * 0.1 },
                          ]}
                          source={{ uri: item?.video?.thumbnail }}
                        />
                        <Text
                          style={tw`text-base font-poppinsMedium py-1 text-secondaryBlack `}
                        >
                          {item.video?.title?.split(" ").slice(0, 4).join(" ")}
                          ...
                        </Text>
                        <View
                          style={tw`flex-row justify-between w-full items-center`}
                        >
                          <Text
                            style={tw`text-sm font-poppins  text-secondaryBlack `}
                          >
                            {item?.video?.user.channel_name}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleDeleteVideo("like", item?.id)}
                          >
                            <SvgXml xml={IconCansel} width={20} height={20} />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              )}
            </View>
            <View>
              {/* dashboard */}
              <TouchableOpacity
                style={tw`flex-row w-full justify-between items-center px-8 pt-6`}
                onPress={() => router.push("/(allPages)/dashboard")}
              >
                <View style={tw` flex-row gap-2 py-3 rounded-lg items-center`}>
                  <SvgXml xml={IconDeshboard} />
                  <Text
                    style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                  >
                    Dashboard
                  </Text>
                </View>
                <View style={tw``}>
                  <View style={tw`border-primaryGray`}>
                    <SvgXml xml={IconBack} />
                  </View>
                </View>
              </TouchableOpacity>
              {/* My videos */}
              <TouchableOpacity
                style={tw`flex-row w-full justify-between items-center px-8 py-2`}
                onPress={() => router.push("/(allPages)/my_videos")}
              >
                <View style={tw` flex-row gap-2 py-3 rounded-lg items-center`}>
                  <SvgXml xml={IconMyvideos} />

                  <Text
                    style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                  >
                    My videos
                  </Text>
                </View>
                <View style={tw``}>
                  <View style={tw`border-primaryGray`}>
                    <SvgXml xml={IconBack} />
                  </View>
                </View>
              </TouchableOpacity>
              {/* Analytics */}
              <TouchableOpacity
                style={tw`flex-row w-full justify-between items-center px-8 py-2`}
                onPress={() => router.push("/(allPages)/analytics")}
              >
                <View style={tw` flex-row gap-2 py-3 rounded-lg items-center`}>
                  <SvgXml xml={IconAnalytics} />

                  <Text
                    style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                  >
                    Analytics
                  </Text>
                </View>
                <View style={tw``}>
                  <View style={tw`border-primaryGray`}>
                    <SvgXml xml={IconBack} />
                  </View>
                </View>
              </TouchableOpacity>
              {/*  Settings */}
              <TouchableOpacity
                style={tw`flex-row w-full justify-between items-center px-8 py-2`}
                onPress={() => router.push("/(allPages)/settings")}
              >
                <View style={tw` flex-row gap-2 py-3 rounded-lg items-center`}>
                  <SvgXml xml={IconSettings} />

                  <Text
                    style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                  >
                    Settings
                  </Text>
                </View>
                <View style={tw``}>
                  <View style={tw`border-primaryGray`}>
                    <SvgXml xml={IconBack} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            {/* Reports */}
            <TouchableOpacity
              style={tw`flex-row w-full justify-between items-center px-8 py-2`}
              onPress={() => router.push("/(allPages)/report")}
            >
              <View style={tw` flex-row gap-2 py-3 rounded-lg items-center`}>
                <SvgXml xml={IconReports} />

                <Text
                  style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                >
                  Reports
                </Text>
              </View>
              <View style={tw``}>
                <View style={tw`border-primaryGray`}>
                  <SvgXml xml={IconBack} />
                </View>
              </View>
            </TouchableOpacity>
            {/* Reports */}
            <TouchableOpacity
              style={tw`flex-row w-full justify-between items-center px-8 py-2`}
              onPress={() => router.push("/auth/change_pass")}
            >
              <View style={tw` flex-row gap-2 py-3 rounded-lg items-center`}>
                <SvgXml xml={IconChangepass} />
                <Text
                  style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                >
                  Change password
                </Text>
              </View>
              <View style={tw``}>
                <View style={tw`border-primaryGray`}>
                  <SvgXml xml={IconBack} />
                </View>
              </View>
            </TouchableOpacity>

            <View style={tw`flex-row justify-center py-6`}>
              <SvgXml xml={IconLine} />
            </View>
            {/* Reports */}
            <TouchableOpacity
              style={tw`flex-row w-full justify-between items-center px-8 py-2`}
              onPress={() => router.push("/(allPages)/faqSection")}
            >
              <View style={tw` flex-row gap-2 py-3 rounded-lg items-center`}>
                <SvgXml xml={IconFAQ} />
                <Text
                  style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                >
                  FAQ
                </Text>
              </View>
              <View style={tw``}>
                <View style={tw`border-primaryGray`}>
                  <SvgXml xml={IconBack} />
                </View>
              </View>
            </TouchableOpacity>
            {/* Aboutus */}
            <TouchableOpacity
              style={tw`flex-row w-full justify-between items-center px-8 py-2`}
              onPress={() => router.push("/(allPages)/aboutUs")}
            >
              <View style={tw` flex-row gap-2 py-3 rounded-lg items-center`}>
                <SvgXml xml={IconAboutus} />
                <Text
                  style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                >
                  About us
                </Text>
              </View>
              <View>
                <View style={tw`border-primaryGray`}>
                  <SvgXml xml={IconBack} />
                </View>
              </View>
            </TouchableOpacity>
            {/* Reports */}
            <TouchableOpacity
              onPress={() => router.push("/(allPages)/contactUs")}
              style={tw`flex-row w-full justify-between items-center px-8 py-2`}
            >
              <View style={tw` flex-row gap-2 py-3 rounded-lg items-center`}>
                <SvgXml xml={IconContactus} />

                <Text
                  style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                >
                  Contact us
                </Text>
              </View>
              <View style={tw``}>
                <View style={tw`border-primaryGray`}>
                  <SvgXml xml={IconBack} />
                </View>
              </View>
            </TouchableOpacity>
            {/* Reports */}
            <TouchableOpacity
              style={tw`flex-row w-full justify-between items-center px-8 py-2`}
              onPress={() => router.push("/(allPages)/termsConditions")}
            >
              <View style={tw` flex-row gap-2 items-center py-3 rounded-lg`}>
                <SvgXml xml={IconTerms} />
                <Text
                  style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                >
                  Terms & Conditions
                </Text>
              </View>
              <View style={tw``}>
                <View style={tw`border-primaryGray`}>
                  <SvgXml xml={IconBack} />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-row w-full justify-between items-center px-8 py-2`}
              onPress={() => router.push("/(allPages)/privacy")}
            >
              <View style={tw` flex-row gap-2 items-center py-3 rounded-lg`}>
                <SvgXml xml={IconPrivacy} />
                <Text
                  style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                >
                  Privacy Policy
                </Text>
              </View>
              <View style={tw``}>
                <View style={tw`border-primaryGray`}>
                  <SvgXml xml={IconBack} />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-row w-full justify-between items-center px-8 py-2 pb-9`}
              onPress={async () => {
                await AsyncStorage.removeItem("token");
                setToken(null);
                router.push("/auth/login");
              }}
            >
              <View style={tw` flex-row gap-2 py-3 rounded-lg items-center`}>
                <SvgXml xml={IconLogout} />

                <Text
                  style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                >
                  Logout
                </Text>
              </View>
              <View style={tw``}>
                <View style={tw`border-primaryGray`}>
                  <SvgXml xml={IconBack} />
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </AlertNotificationRoot>
      ) : (
        <View style={tw`flex-1 justify-center items-center px-6`}>
          <TouchableOpacity
            onPress={() => router.push("/home/(tabs)/landingPage")}
          >
            <Image source={ImgLogo} style={tw`w-56 h-16`} />
          </TouchableOpacity>
          <View style={tw`pt-14 pb-5 `}>
            <SvgXml xml={IconProfileView} />
          </View>
          <Text style={tw`font-poppinsSemiBold text-xl pb-2`}>
            You don't have any account yet
          </Text>
          <Text style={tw`text-center text-base font-poppins mb-8`}>
            Please create an account to see full analytics and explore more
            features
          </Text>

          <View style={tw`w-full mb-4`}>
            <TouchableOpacity
              style={tw`bg-secondary rounded-full `}
              onPress={() => router.push("/auth/login")}
            >
              <Text
                style={tw`text-primary  text-center  text-lg py-[14px] font-poppinsBold`}
              >
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={tw`text-center mb-4 text-base font-poppins`}>or</Text>

          <View style={tw`w-full mb-4`}>
            <TouchableOpacity
              style={tw` border border-secondarygray rounded-full `}
              onPress={() => router.push("/(allPages)/onsiteAccount")}
            >
              <Text
                style={tw`text-center text-base py-[14px] font-poppinsMedium`}
              >
                Onsite account creation
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default Account;
