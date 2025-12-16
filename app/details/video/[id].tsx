import Card from "@/components/landing_page/Card";
import HeaderBar from "@/components/shear/HeaderBar";
import {
  IconClose,
  IconCopy,
  IconDislike,
  IconDislikeBlack,
  Iconfevarite,
  IconfevariteActive,
  IconLike,
  IconLikeActive,
  IconMessage,
  IconReport,
  IconSendMassage,
  IconShare,
} from "@/icons/Icon";
import tw, { isTablet } from "@/lib/tailwind";
import { useProfileQuery } from "@/redux/apiSlices/Account/accountSlice";
import { useCatagoryDetailsQuery } from "@/redux/apiSlices/catagoryDataSlices/catagoryDataSlices";
import {
  useComment_reactionMutation,
  useCommentsPostMutation,
  useCommentsQuery,
  useLikeVideoMutation,
  useReplies_reactionMutation,
  useRepliesPostMutation,
  useRepliesQuery,
  useReportPostMutation,
  useVideodetailQuery,
  useWatchVideoMutation,
} from "@/redux/apiSlices/videoDetails/videoDetailsSlice";
import { _HIGHT, _Width } from "@/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ALERT_TYPE,
  AlertNotificationRoot,
  Toast,
} from "react-native-alert-notification";
import { SvgXml } from "react-native-svg";
import WebView from "react-native-webview";
import YoutubeIframe from "react-native-youtube-iframe";

const SingleVideo = () => {
  const { id, slug } = useLocalSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [shareVisible, setIsShareVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState("Sexual content");
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [replyVisible, setReplyVisible] = useState(false);
  const [likeDislike, setLikeDislike] = useState<"like" | "dislike" | null>(
    null
  );

  const [comment, setComment] = useState("");
  const [reply, setReply] = useState("");
  const [commentID, setCommentID] = useState();
  const [isYoutubeVideo, setIsYoutubeVideo] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [token, setToken] = useState("");
  const [showAuthTooltip, setShowAuthTooltip] = useState(false);

  const playerRef = useRef<any>(null);

  const { data, isLoading, error } = useVideodetailQuery(slug as any);
  const { data: userInfo, isLoading: userLoading } = useProfileQuery({});
  const { data: commentsData, isLoading: isLoadingComment } = useCommentsQuery({
    video_id: id,
  });

  const { data: repliesData, isLoading: isLoadingReply } = useRepliesQuery({
    comment_id: commentID,
  });

  const [watchedVidew] = useWatchVideoMutation();
  const [likeVideo] = useLikeVideoMutation();
  const [comment_reaction] = useComment_reactionMutation();
  const [commentsPost] = useCommentsPostMutation();
  const [replies_reaction] = useReplies_reactionMutation();
  const [repliesPost] = useRepliesPostMutation();
  const [reportPost] = useReportPostMutation();

  const videoDetails = data?.data;

  const player = useVideoPlayer(videoDetails?.video || "", (player) => {
    player.loop = true;
    player.play();
    playerRef.current = player;
  });

  useFocusEffect(
    useCallback(() => {
      if (playerRef.current) {
        playerRef.current.play();
      }
      return () => {
        // Don't try to pause if player is already released
        if (
          playerRef.current &&
          typeof playerRef.current.pause === "function"
        ) {
          try {
            playerRef.current.pause();
          } catch (e) {}
        }
      };
    }, [])
  );

  useEffect(() => {
    return () => {
      if (playerRef.current && typeof playerRef.current.pause === "function") {
        try {
          playerRef.current.pause();
          playerRef.current.seekTo(0);
        } catch (e) {}
      }
      playerRef.current = null;
    };
  }, []);

  const handlePress = async (action: "like" | "dislike") => {
    setLikeDislike(action);
    try {
      await likeVideo({ action, video_id: id }).unwrap();
    } catch (err: any) {}
  };

  useEffect(() => {
    setTimeout(async () => {
      try {
        const res = await watchedVidew(id as any).unwrap();
      } catch (error) {}
    }, 2000);
  }, []);

  useEffect(() => {
    if (
      videoDetails?.link &&
      (videoDetails.link.includes("youtube.com") ||
        videoDetails.link.includes("youtu.be"))
    ) {
      setIsYoutubeVideo(true);

      // Extract YouTube video ID
      const youtubeId = extractYoutubeId(videoDetails.link);
      if (youtubeId) {
        setYoutubeVideoId(youtubeId);
      }
    }
  }, [videoDetails]);

  // user token chake
  useFocusEffect(
    useCallback(() => {
      const checkToken = async () => {
        const userToken = await AsyncStorage.getItem("token");
        setToken(userToken as any);
      };
      checkToken();
    }, [])
  );

  const extractYoutubeId = (url: string) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const { data: reletedVideo, isLoading: reletedlodding } =
    useCatagoryDetailsQuery({ id });
  const apiResponseVideo = reletedVideo?.data?.data;

  const reportOptions = [
    "Sexual content",
    "Violent or repulsive content",
    "Hateful or abusive content",
    "Harassment or bullying",
    "Harmful or dangerous acts",
    "Misinformation",
    "Child abuse",
    "Promotes terrorism",
    "Spam or misleading",
    "Legal issue",
    "Captions issue",
  ];

  if (isLoading || reletedlodding) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-primary`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  if (isLoadingComment) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-primary`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    const payload = {
      video_id: Number(id),
      comment: comment,
    };

    try {
      const res = await commentsPost(payload as any).unwrap();

      if (res.status) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: res?.message,
          autoClose: 2000,
        });
        setComment("");
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Warning",
          textBody: res?.message || "Something went wrong!",
          autoClose: 2000,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: error?.data?.message || "Server error!",
        autoClose: 2000,
      });
    }
  };

  const handleSubmitReply = async () => {
    if (!reply.trim()) return;

    const payload = {
      comment_id: commentID,
      reply,
    };

    try {
      const res = await repliesPost(payload as any).unwrap();

      if (res.status) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: res?.message,
          autoClose: 2000,
        });
        setReply("");
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Warning",
          textBody: res?.message || "Something went wrong!",
          autoClose: 2000,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: error?.data?.message || "Server error!",
        autoClose: 2000,
      });
    }
  };

  const copyToClipboard = async (link: any) => {
    if (!link) {
      await Clipboard.setStringAsync(`http://103.186.20.114:3007/video/${id}`);
    } else {
      await Clipboard.setStringAsync(link);
    }
    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: "Success",
      textBody: "Link copied to clipboard",
      autoClose: 2000,
    });
  };

  const submitReport = async () => {
    const data = {
      video_id: id,
      reason: selectedReason,
      issue: feedbackText,
    };
    try {
      const res = await reportPost(data as any).unwrap();
      if (res.status) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: res?.message,
          autoClose: 2000,
        });
        setFeedbackText("");
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Warning",
          textBody: res?.message || "Something went wrong!",
          autoClose: 2000,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: error?.data?.message || "Server error!",
        autoClose: 2000,
      });
    }
  };
  if (isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
          ${videoDetails?.description}
        </body>
      </html>
    `;

  return (
    <KeyboardAvoidingView
      enabled={true}
      behavior={"padding"}
      style={tw`flex-1 bg-primary`}
    >
      <AlertNotificationRoot>
        <ScrollView showsVerticalScrollIndicator={false}>
          <HeaderBar />
          <View>
            {/* Video Player */}
            {isYoutubeVideo ? (
              <YoutubeIframe
                height={isTablet ? 450 : 250}
                width={_Width}
                videoId={youtubeVideoId}
                play={true}
                onChangeState={(event: any) => {
                  if (event === "ended") {
                    // Handle video end
                  }
                }}
              />
            ) : (
              <VideoView
                style={styles.video}
                player={player}
                allowsFullscreen
                allowsPictureInPicture
              />
            )}

            {/* Video Info */}
            <View style={tw`p-5`}>
              <Text style={tw`font-poppinsMedium text-xl`}>
                {videoDetails?.title}
              </Text>
              <View style={tw`flex-row items-center gap-2`}>
                <Text
                  style={tw`font-poppins text-sm text-primaryGrayDeep py-2`}
                >
                  {videoDetails?.views_count_formated} views ·{" "}
                  {videoDetails?.publish_time_formated}
                </Text>
                <TouchableOpacity onPress={() => setDescriptionVisible(true)}>
                  <Text style={tw``}>...more</Text>
                </TouchableOpacity>
              </View>

              {/* Channel Info */}
              <View>
                <TouchableOpacity
                  style={tw`flex-row items-center gap-3`}
                  onPress={() =>
                    router.push({
                      pathname: "/details/channelProfile/[id]",
                      params: { id: videoDetails?.user?.id },
                    })
                  }
                >
                  <Image
                    source={{ uri: videoDetails?.user.avatar }}
                    style={tw`w-10 h-10 rounded-full`}
                  />
                  <Text
                    style={tw`font-poppinsMedium text-base text-secondaryBlack`}
                  >
                    {videoDetails?.user.channel_name}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={tw`gap-3 px-4 py-4`}
              >
                <TouchableOpacity
                  style={tw`flex-row items-center gap-4 py-2 px-6 border justify-center border-primaryGray rounded-full `}
                  onPress={() => {
                    if (!token) {
                      setShowAuthTooltip(true);
                      setTimeout(() => setShowAuthTooltip(false), 5000);
                      return;
                    }
                    handlePress("like");
                  }}
                >
                  <SvgXml
                    xml={videoDetails?.is_liked ? IconLikeActive : IconLike}
                  />
                  <Text>{videoDetails?.likes_count}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={tw`flex-row items-center gap-4 py-2 px-6 border justify-center border-primaryGray rounded-full`}
                  onPress={() => {
                    if (!token) {
                      setShowAuthTooltip(true);
                      setTimeout(() => setShowAuthTooltip(false), 5000);
                      return;
                    }
                    handlePress("dislike");
                  }}
                >
                  <SvgXml
                    xml={
                      videoDetails?.is_disliked ? IconDislikeBlack : IconDislike
                    }
                  />
                  <Text>{videoDetails?.dislikes_count_formated}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={tw`flex-row items-center gap-4 py-2 px-6 border justify-center border-primaryGray rounded-full`}
                  onPress={() => setIsShareVisible(true)}
                >
                  <SvgXml xml={IconShare} />
                  <Text>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={tw`flex-row items-center gap-4 py-2 px-6 border justify-center border-primaryGray rounded-full`}
                  onPress={() => {
                    if (!token) {
                      setShowAuthTooltip(true);
                      setTimeout(() => setShowAuthTooltip(false), 5000);
                      return;
                    }
                    setReportVisible(true);
                  }}
                >
                  <SvgXml xml={IconReport} />
                  <Text>Report</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            {/* Auth Tooltip */}
            {showAuthTooltip && (
              <View style={tw`absolute w-full  top-[68%] z-20 items-center`}>
                <View
                  style={tw`bg-gray-800 px-3 py-2 rounded-xl overflow-hidden`}
                >
                  <Text style={tw`text-white text-base pb-3`}>
                    Sign in to make your opinion count.
                  </Text>
                  <TouchableOpacity
                    style={tw`bg-primary rounded-full `}
                    onPress={() => router.push("/auth/login")}
                  >
                    <Text
                      style={tw`text-secondaryBlack  text-center  text-sm py-[6px] font-poppinsBold`}
                    >
                      Sign in
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {/* Comments Preview */}
            <TouchableOpacity onPress={() => setIsVisible(true)}>
              <View
                style={tw`px-5 border border-primaryGray bg-primaryText mx-5 mb-6 py-3 rounded-lg`}
              >
                <View style={tw`flex-row items-center gap-3`}>
                  <Text style={tw`font-poppinsMedium text-lg`}>Comments</Text>
                </View>
                <View style={tw`flex-row items-center gap-2 py-4`}>
                  <Image
                    source={{ uri: videoDetails?.user.avatar }}
                    style={tw`w-7 h-7 rounded-full`}
                  />
                  <Text style={tw`px-2 font-poppins text-sm`} numberOfLines={2}>
                    See all Comment
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {apiResponseVideo && apiResponseVideo.length > 0 ? (
              <FlatList
                data={apiResponseVideo}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <Card data={item} />}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            ) : (
              <View style={tw`p-4`}>
                <Text style={tw`text-center text-base`}>No videos found </Text>
              </View>
            )}
          </View>

          {/* Share Modal */}

          <Modal
            visible={shareVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsShareVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View
                style={tw`rounded-t-3xl absolute bottom-0 w-full flex-col items-end justify-end`}
              >
                <View style={tw`bg-primary rounded-t-3xl`}>
                  <View
                    style={tw`bg-secondary w-full rounded-t-3xl flex-row items-center justify-between p-5`}
                  >
                    <View></View>
                    <Text style={tw`text-primary text-xl font-poppins`}>
                      Share
                    </Text>
                    <TouchableOpacity onPress={() => setIsShareVisible(false)}>
                      <SvgXml xml={IconClose} />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={tw`text-center flex items-center justify-center px-11 py-5`}
                  >
                    <Text style={tw`text-xl font-poppinsMedium`}>
                      Link for this video
                    </Text>
                    <Text
                      style={tw`text-sm text-center font-poppins text-primaryGrayDeep my-3`}
                    >
                      Copy this link and share to your friends
                    </Text>
                  </View>
                  <View style={tw`bg-primaryText py-4 px-7 rounded-full mx-5`}>
                    <Text numberOfLines={1}>
                      {videoDetails?.link == null || undefined
                        ? `http://10.10.10.72:3000/video/${id}`
                        : videoDetails?.link}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={tw`flex-row items-center bg-primaryText justify-center my-3 mx-auto gap-4 py-4 px-9 border border-primaryGray rounded-full w-40`}
                    onPress={() => copyToClipboard(videoDetails.link)}
                  >
                    <SvgXml xml={IconCopy} />
                    <Text>Copy link</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* comment modal */}

          <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={tw`bg-primary rounded-t-3xl w-full h-4/6 mt-78`}>
                {/* Modal Header */}
                <View
                  style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between p-5`}
                >
                  <View></View>
                  <Text style={tw`text-primary text-xl font-poppins`}>
                    Comments
                  </Text>
                  <TouchableOpacity onPress={() => setIsVisible(false)}>
                    <SvgXml xml={IconClose} />
                  </TouchableOpacity>
                </View>

                {/* Loader */}
                {isLoadingComment && (
                  <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#0000ff" />
                  </View>
                )}

                {/* Comments List */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={tw`mb-20`}
                >
                  {commentsData?.data?.comments?.data?.length === 0 ? (
                    <View style={tw`flex-1 items-center justify-center py-10`}>
                      <Text style={tw`text-gray-500 font-poppins`}>
                        No comments yet
                      </Text>
                    </View>
                  ) : (
                    commentsData?.data?.comments?.data?.map((comment: any) => (
                      <View
                        key={comment.id}
                        style={tw`flex-row gap-4 pt-4 px-7 mb-5`}
                      >
                        {/* User Avatar */}
                        <Image
                          source={{ uri: comment?.user?.avatar }}
                          style={tw`w-10 h-10 rounded-full`}
                        />

                        {/* Comment Content */}
                        <View style={tw`flex-1`}>
                          {/* User Info */}
                          <View style={tw`flex-row items-center gap-2 mb-1`}>
                            <Text
                              style={tw`font-poppinsMedium text-base text-gray-800`}
                            >
                              {comment?.user?.name}
                            </Text>
                            <View
                              style={tw`bg-gray-400 rounded-full h-1 w-1`}
                            />
                            <Text
                              style={tw`font-poppins text-xs text-gray-500`}
                            >
                              {comment?.created_at_format}
                            </Text>
                          </View>

                          {/* Comment Text */}
                          <Text style={tw`font-poppins text-sm text-gray-800`}>
                            {comment?.comment}
                          </Text>

                          {/* Reactions */}
                          <View style={tw`flex-row gap-6 mt-3`}>
                            <View style={tw`flex-row gap-2 items-center`}>
                              <TouchableOpacity
                                onPress={() =>
                                  comment_reaction({ comment_id: comment.id })
                                }
                              >
                                <SvgXml
                                  xml={
                                    comment?.is_react
                                      ? IconfevariteActive
                                      : Iconfevarite
                                  }
                                  width={16}
                                  height={16}
                                />
                              </TouchableOpacity>
                              <Text
                                style={tw`font-poppins text-xs text-gray-500`}
                              >
                                {comment?.reactions_count_format}
                              </Text>
                            </View>

                            <TouchableOpacity
                              onPress={() => {
                                setReplyVisible(true);
                                setCommentID(comment?.id);
                              }}
                              style={tw`flex-row gap-2 items-center`}
                            >
                              <SvgXml
                                xml={IconMessage}
                                width={16}
                                height={16}
                              />
                              <Text
                                style={tw`font-poppins text-xs text-gray-500`}
                              >
                                Reply
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>

                {/* Comment Input */}
                <View
                  style={tw`absolute bottom-0 w-full bg-primary py-3 px-5 flex-row items-center`}
                >
                  <Image
                    source={{ uri: userInfo?.data?.avatar }}
                    style={tw`w-10 h-10 rounded-full`}
                  />
                  <View
                    style={tw`flex-row items-center justify-center gap-3 ml-3 w-full`}
                  >
                    <TextInput
                      value={comment}
                      onChangeText={setComment}
                      style={tw`bg-primaryOff rounded-full font-poppins px-4 text-sm h-12  flex-1`}
                      placeholder="Add your comment..."
                      placeholderTextColor="black"
                    />
                    <TouchableOpacity style={tw`w-16`} onPress={handleSubmit}>
                      <SvgXml xml={IconSendMassage} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>

          {/* Report Modal */}
          <Modal
            visible={reportVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setReportVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View
                style={tw`bg-white w-full absolute bottom-0 rounded-t-3xl overflow-hidden`}
              >
                <View
                  style={tw`bg-red-500 py-4 px-6 flex-row justify-between items-center`}
                >
                  <View></View>
                  <Text style={tw`text-white text-xl font-poppins`}>
                    Report this video
                  </Text>
                  <TouchableOpacity onPress={() => setReportVisible(false)}>
                    <SvgXml xml={IconClose} />
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={tw`py-4 px-6 max-h-96`}>
                  {reportOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => setSelectedReason(option)}
                      style={tw`flex-row items-center py-2`}
                    >
                      <View
                        style={tw`w-5 h-5 rounded-full border-2 border-red-500 mr-3 justify-center items-center`}
                      >
                        {selectedReason === option && (
                          <View style={tw`w-3 h-3 rounded-full bg-red-500`} />
                        )}
                      </View>
                      <Text style={tw`text-base font-poppins`}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View
                  style={tw`flex-row justify-end gap-12 px-6 py-4 border-t border-gray-200`}
                >
                  <TouchableOpacity onPress={() => setReportVisible(false)}>
                    <Text style={tw`text-base font-poppins`}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setReportVisible(false);
                      setFeedbackVisible(true);
                    }}
                  >
                    <Text style={tw`text-base font-poppins text-red-500`}>
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Feedback Modal */}
          <Modal
            visible={feedbackVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setFeedbackVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View
                style={tw`bg-white w-full absolute bottom-0 rounded-t-3xl overflow-hidden`}
              >
                <View
                  style={tw`bg-red-500 py-4 px-6 flex-row justify-between items-center`}
                >
                  <View></View>
                  <Text style={tw`text-white text-xl font-poppinsMedium`}>
                    Report this video
                  </Text>
                  <TouchableOpacity onPress={() => setFeedbackVisible(false)}>
                    <SvgXml xml={IconClose} />
                  </TouchableOpacity>
                </View>
                <View style={tw`p-6 `}>
                  <TextInput
                    multiline
                    numberOfLines={6}
                    maxLength={1000}
                    value={feedbackText}
                    textAlignVertical="top"
                    onChangeText={setFeedbackText}
                    placeholder="Describe your issue..."
                    placeholderTextColor="black"
                    style={tw`border border-gray-300 rounded-xl p-4 text-base text-black h-40`}
                  />
                  <Text style={tw`text-right text-xs mt-2 text-gray-500`}>
                    {feedbackText.length} / 1000
                  </Text>
                </View>
                <View
                  style={tw`flex-row justify-end gap-12 px-6 py-4 border-t border-gray-200`}
                >
                  <TouchableOpacity onPress={() => setFeedbackVisible(false)}>
                    <Text style={tw`text-base font-poppins`}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      submitReport();
                      setFeedbackVisible(false);
                    }}
                  >
                    <Text style={tw`text-base font-poppins text-red-500`}>
                      Report
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Description Modal */}
          <Modal
            visible={descriptionVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setDescriptionVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View
                style={tw`bg-white h-[60%] w-full absolute bottom-0 rounded-t-3xl overflow-hidden`}
              >
                <View
                  style={tw`bg-red-500 py-4 px-6 flex-row justify-between items-center`}
                >
                  <View></View>
                  <Text style={tw`text-white text-xl font-poppinsMedium`}>
                    Description
                  </Text>
                  <TouchableOpacity
                    onPress={() => setDescriptionVisible(false)}
                  >
                    <SvgXml xml={IconClose} />
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={tw`p-6`}>
                  <Text style={tw`text-lg font-poppinsMedium py-4`}>
                    {videoDetails?.title}
                  </Text>
                  <View style={tw`flex-row justify-between mb-6`}>
                    <View style={tw`items-center`}>
                      <Text style={tw`font-poppinsSemiBold text-3xl`}>
                        {videoDetails?.likes_count_formated}
                      </Text>
                      <Text style={tw`text-base font-poppins text-gray-600`}>
                        Likes
                      </Text>
                    </View>
                    <View style={tw`items-center`}>
                      <Text style={tw`font-poppinsSemiBold text-3xl`}>
                        {videoDetails?.views_count_formated}
                      </Text>
                      <Text style={tw`text-base font-poppins text-gray-600`}>
                        Views
                      </Text>
                    </View>
                    <View style={tw`items-center`}>
                      <Text style={tw`font-poppinsSemiBold text-3xl`}>
                        {videoDetails?.publish_date.split("-")[0]}
                      </Text>
                      <Text style={tw`text-base font-poppins text-gray-600`}>
                        {videoDetails?.publish_date
                          .split("-")
                          .slice(1)
                          .join("-")}
                      </Text>
                    </View>
                  </View>
                  <View style={[tw`px-1`, { height: _HIGHT }]}>
                    <WebView
                      originWhitelist={["*"]}
                      source={{ html: htmlContent }}
                      style={tw`flex-1 bg-primary`}
                      scrollEnabled={false}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                    />
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
          {/* Replies Modal */}
          <Modal
            visible={replyVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setReplyVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={tw`bg-primary rounded-t-3xl w-full h-4/6 mt-78`}>
                <View
                  style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between p-5`}
                >
                  <View></View>
                  <Text style={tw`text-primary text-xl font-poppins`}>
                    Replies
                  </Text>
                  <TouchableOpacity onPress={() => setReplyVisible(false)}>
                    <SvgXml xml={IconClose} />
                  </TouchableOpacity>
                </View>
                {/* Loader */}
                {isLoadingReply && (
                  <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#0000ff" />
                  </View>
                )}

                {/* Comments List */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={tw`mb-20`}
                >
                  {repliesData?.data?.length === 0 ? (
                    <View style={tw`items-center justify-center py-10`}>
                      <Text style={tw`text-gray-500 font-poppins`}>
                        No Replies yet
                      </Text>
                    </View>
                  ) : (
                    repliesData?.data?.map((replies: any) => (
                      <View
                        key={replies.id}
                        style={tw`flex-row gap-4 pt-4 px-7 mb-5`}
                      >
                        {/* User Avatar */}
                        <Image
                          source={{ uri: replies?.user?.avatar }}
                          style={tw`w-10 h-10 rounded-full`}
                        />

                        {/* replies Content */}
                        <View style={tw`flex-1`}>
                          {/* User Info */}
                          <View style={tw`flex-row items-center gap-2 mb-1`}>
                            <Text
                              style={tw`font-poppinsMedium text-base text-gray-800`}
                            >
                              {replies?.user?.name}
                            </Text>
                            <View
                              style={tw`bg-gray-400 rounded-full h-1 w-1`}
                            />
                            <Text
                              style={tw`font-poppins text-xs text-gray-500`}
                            >
                              {replies?.created_at_format}
                            </Text>
                          </View>

                          {/* replies Text */}
                          <Text
                            style={tw`font-poppins text-sm pb-2 text-gray-800`}
                          >
                            {replies?.reply}
                          </Text>

                          {/* Reactions */}
                          <View style={tw`flex-row gap-2 items-center`}>
                            <TouchableOpacity
                              onPress={() =>
                                replies_reaction({ reply_id: replies.id })
                              }
                            >
                              <SvgXml
                                xml={
                                  replies?.is_react
                                    ? IconfevariteActive
                                    : Iconfevarite
                                }
                                width={16}
                                height={16}
                              />
                            </TouchableOpacity>
                            <Text
                              style={tw`font-poppins text-xs text-gray-500`}
                            >
                              {replies?.reactions_count_format}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>

                {/* replies Input */}
                <View
                  style={tw`absolute bottom-0 w-full bg-primary py-3 px-5 flex-row items-center`}
                >
                  <Image
                    source={{ uri: videoDetails?.user?.avatar }}
                    style={tw`w-10 h-10 rounded-full`}
                  />
                  <View
                    style={tw`flex-row items-center justify-center gap-3 w-full`}
                  >
                    <TextInput
                      value={reply}
                      onChangeText={setReply}
                      style={tw`bg-primaryOff rounded-full font-poppins px-4 text-sm h-12 ml-3 flex-1`}
                      placeholder="Add your reply..."
                      placeholderTextColor="black"
                    />
                    <TouchableOpacity
                      style={tw`w-16`}
                      onPress={handleSubmitReply}
                    >
                      <SvgXml xml={IconSendMassage} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </AlertNotificationRoot>
    </KeyboardAvoidingView>
  );
};

export default SingleVideo;

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
