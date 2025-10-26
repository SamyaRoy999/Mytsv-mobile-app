import HeaderBar from "@/components/shear/HeaderBar";
import {
  IconAnalytics,
  IconBackLeft,
  IconCanselModal,
  IconClose,
  IconComment,
  IconDate,
  IconDelete,
  IconDeleteComment,
  IconDislike,
  IconEays,
  IconEdit,
  IconErow,
  Iconfevarite,
  IconfevariteActive,
  IconLike,
  IconMessage,
  IconSettingDot,
  IconTime,
  IconWorld,
  IconWornoingDelete,
} from "@/icons/Icon";
import tw, { isTablet } from "@/lib/tailwind";
import { useDeleteVideoMutation } from "@/redux/apiSlices/Account/accountSlice";
import { useMy_videos_detailsQuery } from "@/redux/apiSlices/MyVideo/myvideoSlice";
import {
  useCommentDeleteMutation,
  useCommentsQuery,
  useRepliesQuery,
} from "@/redux/apiSlices/videoDetails/videoDetailsSlice";
import { _Width } from "@/utils/utils";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { ScrollView } from "react-native-gesture-handler";
import { SvgXml } from "react-native-svg";
import YoutubeIframe from "react-native-youtube-iframe";

const videodetails = () => {
  const [history, setHistory] = React.useState(false);
  const [commentVisible, setCommentVisible] = React.useState(false);
  const [replyVisible, setReplyVisible] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [commentID, setCommentID] = React.useState();
  const [deleteCommentModalVisible, setDeleteCommentModalVisible] =
    React.useState(false);
  const [selectedCommentId, setSelectedCommentId] = React.useState();
  const [isYoutubeVideo, setIsYoutubeVideo] = React.useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = React.useState("");
  const isPlayerInitialized = useRef(false);
  const playerRef = useRef<any>(null);

  const { id } = useLocalSearchParams();
  const {
    data: singleVideo,
    isLoading,
    refetch: singleVideoRefetch,
  } = useMy_videos_detailsQuery({ id });
  // const { type } = singleVideo?.data

  const { data: commentsData, isLoading: isLoadingComment } = useCommentsQuery({
    video_id: id,
  });

  const { data: repliesData, isLoading: isLoadingReply } = useRepliesQuery({
    comment_id: commentID,
  });
  const [deleteVideo] = useDeleteVideoMutation();
  const [commentDelete] = useCommentDeleteMutation();

  useFocusEffect(
    useCallback(() => {
      singleVideoRefetch();
    }, [])
  );
  // Comment delete function
  const handleDeleteComment = async () => {
    if (!selectedCommentId) return;

    try {
      const res = await commentDelete(selectedCommentId).unwrap();

      if (res?.status) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: res.message,
          autoClose: 2000,
        });
        setDeleteCommentModalVisible(false);
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: res?.message || "Failed to delete comment",
          autoClose: 2000,
        });
      }
    } catch (err) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Error",
        textBody: "Failed to delete comment",
      });
    }
  };

  const player = useVideoPlayer(
    singleVideo?.data?.type === "link" ? "" : singleVideo?.data?.video || "",
    (player) => {
      if (!isPlayerInitialized.current && singleVideo?.data?.type !== "link") {
        player.loop = true;
        player.play();
        isPlayerInitialized.current = true;
      }
    }
  );
  useFocusEffect(
    useCallback(() => {
      if (
        playerRef.current &&
        isPlayerInitialized.current &&
        singleVideo?.data?.type !== "link"
      ) {
        try {
          playerRef.current.play();
        } catch (error) {}
      }

      return () => {
        if (
          playerRef.current &&
          isPlayerInitialized.current &&
          singleVideo?.data?.type !== "link"
        ) {
          try {
            playerRef.current.pause();
          } catch (error) {}
        }
      };
    }, [singleVideo?.data?.type])
  );
  useEffect(() => {
    // Check if it's a YouTube video
    if (
      singleVideo?.data?.link &&
      (singleVideo?.data.link.includes("youtube.com") ||
        singleVideo?.data.link.includes("youtu.be"))
    ) {
      setIsYoutubeVideo(true);

      // Extract YouTube video ID
      const youtubeId = extractYoutubeId(singleVideo?.data.link);
      if (youtubeId) {
        setYoutubeVideoId(youtubeId);
      }
    }
  }, [singleVideo?.data]);

  const extractYoutubeId = (url: string) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };
  const hendelDeleteVideo = async () => {
    try {
      const res = await deleteVideo(id).unwrap();

      if (res?.status) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: res.message,
          autoClose: 2000,
        });
        setTimeout(() => {
          router.push("/(allPages)/my_videos");
        }, 1000);
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

  if (isLoadingComment || isLoadingReply) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-primary`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-primary`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderBar />
        <View style={tw`relative`}>
          <View
            style={tw`flex-row justify-between items-center gap-5 px-5 mb-8`}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <View
                style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
              >
                <SvgXml xml={IconBackLeft} />
              </View>
            </TouchableOpacity>
            <Text style={tw`font-poppinsMedium text-xl `}>Video details</Text>
            <TouchableOpacity onPress={() => setHistory(!history)}>
              <View
                style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
              >
                <SvgXml xml={history ? IconCanselModal : IconSettingDot} />
              </View>
            </TouchableOpacity>
          </View>
          {history && (
            <View
              style={tw`absolute bg-primaryText right-5 w-56 top-14 z-20  shadow-lg rounded-lg`}
            >
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/details/editVideoDetails/[id]",
                    params: { id: id.toString() },
                  })
                }
              >
                <View style={tw`flex-row items-start gap-3 px-5 py-4`}>
                  <SvgXml xml={IconEdit} />
                  <Text style={tw`font-poppinsMedium text-base `}>
                    Edit video
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/details/videoAnalytics/[id]",
                    params: { id: id.toString() },
                  })
                }
                style={tw`border border-primaryGray`}
              >
                <View style={tw`flex-row items-start gap-3 px-5 py-4`}>
                  <SvgXml xml={IconAnalytics} />
                  <Text style={tw`font-poppinsMedium text-base`}>
                    Analytics
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
                <View style={tw`flex-row items-start gap-3 px-5 py-4`}>
                  <SvgXml xml={IconDelete} />
                  <Text style={tw`font-poppinsMedium text-base`}>
                    Delete video
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* video details */}
        {singleVideo && (
          <View style={tw``}>
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
            <View style={tw`px-4`}>
              <Text style={tw`font-poppinsMedium text-xl py-5`}>Title</Text>
              <Text style={tw`font-poppins text-base pb-5`}>
                {singleVideo?.data?.title}
              </Text>
              <Text style={tw`font-poppinsMedium text-xl`}>Category</Text>
              <Text style={tw`font-poppins text-base`}>
                {singleVideo?.data?.category?.name}
              </Text>
              <View style={tw`flex-row justify-between py-5 w-4/6`}>
                <Text style={tw`font-poppinsMedium text-xl`}>State</Text>
                <Text style={tw`font-poppinsMedium text-xl`}>City</Text>
              </View>
              <View style={tw`flex-row justify-between pb-5 w-4/6`}>
                <Text style={tw`font-poppins text-base`}>
                  {singleVideo?.data?.states}
                </Text>
                <Text style={tw`font-poppins text-base`}>
                  {singleVideo?.data?.city}
                </Text>
              </View>
              <Text style={tw`font-poppinsMedium text-xl pb-3`}>
                Description
              </Text>
              <Text style={tw`font-poppins text-base`}>
                {singleVideo?.data?.states}
              </Text>
              <Text style={tw`font-poppinsMedium text-xl py-3`}>Thumbnail</Text>
              {/* Video Player */}
              <Image
                source={singleVideo?.data?.thumbnail}
                style={tw`w-full h-48 rounded-lg`}
              />
              <Text style={tw`font-poppinsMedium text-xl py-3`}>
                Visibility
              </Text>
              <TouchableOpacity
                style={tw`py-3 flex-row gap-4 w-3/6 items-center border border-primaryGray  px-6 rounded-full  bg-primary`}
              >
                <SvgXml xml={IconWorld} />
                <Text style={tw`font-poppins  text-base text-secondaryBlack`}>
                  {singleVideo?.data?.visibility}
                </Text>
              </TouchableOpacity>
              <Text style={tw`font-poppinsMedium text-xl py-3`}>
                Publish time
              </Text>
              <TouchableOpacity
                style={tw`py-3 flex-row gap-4 justify-center items-center border border-primaryGray  px-6 rounded-full  bg-primary`}
              >
                <View style={tw`flex-row gap-3 items-center`}>
                  <SvgXml xml={IconDate} />
                  <Text style={tw`font-poppins  text-base text-secondaryBlack`}>
                    {singleVideo?.data?.publish_date}
                  </Text>
                </View>
                <View style={tw`flex-row gap-3 items-center`}>
                  <SvgXml xml={IconTime} />
                  <Text style={tw`font-poppins  text-base text-secondaryBlack`}>
                    {singleVideo?.data?.publish_time}
                  </Text>
                </View>
              </TouchableOpacity>
              <Text style={tw`font-poppinsMedium text-xl py-3`}>
                Statistics
              </Text>
              {/* Stats Cards */}
              <View
                style={tw`flex-row w-full gap-2 justify-between items-center mb-8`}
              >
                <View
                  style={tw`border w-20 h-20  flex-col items-center justify-center border-gray-200 rounded-lg`}
                >
                  <SvgXml xml={IconEays} />
                  <Text style={tw`font-poppinsSemiBold text-xl pt-3`}>
                    {singleVideo?.data?.views_count_formated}
                  </Text>
                </View>
                <View
                  style={tw`border w-20 h-20 flex-col items-center justify-center border-gray-200 rounded-lg`}
                >
                  <SvgXml xml={IconLike} />
                  <Text style={tw`font-poppinsSemiBold text-xl pt-3`}>
                    {singleVideo?.data?.likes_count_formated}
                  </Text>
                </View>
                <View
                  style={tw`border w-20 h-20 flex-col items-center justify-center border-gray-200 rounded-lg`}
                >
                  <SvgXml xml={IconDislike} />
                  <Text style={tw`font-poppinsSemiBold text-xl pt-3`}>
                    {singleVideo?.data?.dislikes_count_formated}
                  </Text>
                </View>
                <View
                  style={tw`border w-20 h-20 flex-col items-center justify-center border-gray-200 rounded-lg`}
                >
                  <SvgXml xml={IconComment} />
                  <Text style={tw`font-poppinsSemiBold text-xl pt-3`}>
                    {singleVideo?.data?.comment_replies_count_formated}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={tw`py-3 flex-row gap-4 justify-center mb-7 items-center border w-3/6 border-primaryGray  px-6 rounded-full  bg-primary`}
                onPress={() => setCommentVisible(true)}
              >
                <Text style={tw`font-poppins  text-base text-secondaryBlack`}>
                  See comments
                </Text>
                <SvgXml xml={IconErow} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <Modal
          visible={commentVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setCommentVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={tw`bg-primary rounded-t-3xl mb-10 w-full h-4/6 mt-78  `}
            >
              <View
                style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between p-5`}
              >
                <View></View>
                <Text style={tw`text-primary text-xl font-poppins`}>
                  Comments
                </Text>
                <TouchableOpacity onPress={() => setCommentVisible(false)}>
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
                          <View style={tw`bg-gray-400 rounded-full h-1 w-1`} />
                          <Text style={tw`font-poppins text-xs text-gray-500`}>
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
                            <TouchableOpacity>
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
                            <SvgXml xml={IconMessage} width={16} height={16} />
                            <Text
                              style={tw`font-poppins text-xs text-gray-500`}
                            >
                              Reply
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      {/* <TouchableOpacity style={tw`mt-8`} */}
                      <TouchableOpacity
                        style={tw`mt-8`}
                        onPress={() => {
                          setSelectedCommentId(comment.id);
                          setDeleteCommentModalVisible(true);
                        }}
                      >
                        <SvgXml xml={IconDeleteComment} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
        {/* Replies */}
        <Modal
          visible={replyVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setReplyVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={tw`bg-primary rounded-t-3xl  w-full h-4/6 mt-78  mb-10 `}
            >
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
                          <View style={tw`bg-gray-400 rounded-full h-1 w-1`} />
                          <Text style={tw`font-poppins text-xs text-gray-500`}>
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
                          <TouchableOpacity>
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
                          <Text style={tw`font-poppins text-xs text-gray-500`}>
                            {replies?.reactions_count_format}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
        {/* Deleted video */}
        <Modal
          visible={deleteModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={tw`bg-primary rounded-t-3xl absolute bottom-0  w-full  mt-78 pb-12`}
            >
              <View
                style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between p-5`}
              >
                <View></View>
                <Text style={tw`text-primary text-xl font-poppins`}>
                  Delete video
                </Text>

                <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                  <SvgXml xml={IconClose} />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={tw`px-4 `}
                showsVerticalScrollIndicator={false}
              >
                <View style={tw` flex-col items-center justify-center pt-5`}>
                  <SvgXml xml={IconWornoingDelete} />
                  <Text
                    style={tw`font-poppinsMedium text-lg text-secondary pt-5`}
                  >
                    Are you sure to delete this video ?
                  </Text>
                  <Text
                    style={tw`font-poppinsMedium text-sm text-primaryGrayDeep pt-1 pb-7`}
                  >
                    Users can’t find your video anymore.
                  </Text>
                </View>
                <View style={tw`flex-row justify-center gap-3`}>
                  <TouchableOpacity
                    onPress={() => setDeleteModalVisible(false)}
                    style={tw` w-2/6 py-5 border flex-row rounded-full justify-center border-primaryGray`}
                  >
                    <Text style={tw`text-sm font-poppinsMedium`}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => hendelDeleteVideo()}
                    style={tw` w-2/6 bg-secondary  py-5 border flex-row rounded-full justify-center border-primaryGray`}
                  >
                    <Text style={tw`text-sm text-primary font-poppinsMedium`}>
                      Yes, Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
        <Modal
          visible={deleteCommentModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setDeleteCommentModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={tw`bg-primary rounded-t-3xl absolute bottom-0  w-full  mt-78 pb-12`}
            >
              <View
                style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between p-5`}
              >
                <View></View>
                <Text style={tw`text-primary text-xl font-poppins`}>
                  Delete Comment
                </Text>
                <TouchableOpacity
                  onPress={() => setDeleteCommentModalVisible(false)}
                >
                  <SvgXml xml={IconClose} />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={tw`px-4 `}
                showsVerticalScrollIndicator={false}
              >
                <View style={tw` flex-col items-center justify-center pt-5`}>
                  <SvgXml xml={IconWornoingDelete} />
                  <Text
                    style={tw`font-poppinsMedium text-lg text-secondary pt-5`}
                  >
                    Are you sure to delete this comment?
                  </Text>
                  <Text
                    style={tw`font-poppinsMedium text-sm text-primaryGrayDeep pt-1 pb-7`}
                  >
                    This action cannot be undone.
                  </Text>
                </View>
                <View style={tw`flex-row justify-center gap-3`}>
                  <TouchableOpacity
                    onPress={() => setDeleteCommentModalVisible(false)}
                    style={tw` w-2/6 py-5 border flex-row rounded-full justify-center border-primaryGray`}
                  >
                    <Text style={tw`text-sm font-poppinsMedium`}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDeleteComment}
                    style={tw` w-2/6 bg-secondary  py-5 border flex-row rounded-full justify-center border-primaryGray`}
                  >
                    <Text style={tw`text-sm text-primary font-poppinsMedium`}>
                      Yes, Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default videodetails;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  video: {
    width: _Width,
    height: 250,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  infoContainer: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  meta: {
    color: "#666",
    marginBottom: 10,
  },
  more: {
    color: "#888",
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 50,
    marginRight: 10,
  },
  channelName: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  iconButton: {
    alignItems: "center",
  },
  iconLabel: {
    marginTop: 4,
    fontSize: 12,
  },
  commentsBox: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  commentCount: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  comment: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 30,
    marginRight: 8,
  },
  commentText: {
    flex: 1,
    color: "#333",
  },
});
