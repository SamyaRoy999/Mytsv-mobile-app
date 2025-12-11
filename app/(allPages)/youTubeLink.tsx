import {
  IconBackLeft,
  IconClose,
  IconCloseBlack,
  IconErowBack,
  IconLock,
  IconPromoted,
  IconSucssMsg,
  IconUploadBlue,
  IconWorld,
  IconWorningGary,
} from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { usePriceGetAllQuery } from "@/redux/apiSlices/Home/homeApiSlices";
import { useMyProfileQuery } from "@/redux/apiSlices/MyVideo/myvideoSlice";
import {
  usePaymentMutation,
  usePaymentSuccessMutation,
} from "@/redux/apiSlices/payment/paymentSlice";
import {
  useCategoriesQuery,
  useCityGetQuery,
  useStateGetQuery,
  useUpload_videoMutation,
} from "@/redux/apiSlices/UploadVideo/uploadVideoSices";
import { useStripe } from "@stripe/stripe-react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { SvgXml } from "react-native-svg";

const youTubeLink = () => {
  const [paymentVisible, setPaymentVisible] = React.useState(false);
  const [sucssMassage, setSucssMassage] = React.useState(false);
  const [promotedOn, setPromotedOn] = React.useState(false);
  const [stateModalVisible, setStateModalVisible] = React.useState(false);
  const [cityModalVisible, setCityModalVisible] = React.useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = React.useState(false);
  const [visibility, setVisibility] = React.useState(false);
  const [youtubeLink, setYoutubeLink] = React.useState("");
  const [selectedState, setSelectedState] = React.useState("");
  const [selectedCity, setSelectedCity] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [categoryID, setCategoryID] = React.useState("");
  const [videoTitle, setVideoTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedVisibility, setSelectedVisibility] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState("");
  const [image, setImage] = React.useState<ImagePicker.ImagePickerAsset | null>(
    null
  );
  const [tags, setTags] = React.useState<string[]>([]);
  const [paymentIntentData, setPaymentIntentData] = React.useState<any>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [stateID, setStateID] = React.useState(false);
  const [pendingFormData, setPendingFormData] = React.useState<FormData | null>(
    null
  );

  // ............stripe ..............//
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // ................ API ...................//
  const [upload_video] = useUpload_videoMutation();
  const [paymentSuccess] = usePaymentSuccessMutation();
  const { data: categories, isLoading, refetch } = useCategoriesQuery({});
  const categoryData = categories?.data?.data;
  const { data: priceYoutubLink } = usePriceGetAllQuery({});
  const [payment] = usePaymentMutation();

  // User profile data
  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useMyProfileQuery({});
  const userId = userData?.data?.id;

  const {
    data: stateData,
    isLoading: isStateLoding,
    refetch: refetchState,
  } = useStateGetQuery({});
  const {
    data: cityData,
    isLoading: isCityLoding,
    refetch: refetchCity,
  } = useCityGetQuery(stateID);

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      await refetchUser();
    } catch (error) {}
  };

  if (isUserLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={tw`mt-4`}>Loading data...</Text>
      </View>
    );
  }
  setTimeout(() => {
    setSucssMassage(false);
  }, 3000);

  const handleAddService = () => {
    if (selectedTags.trim()) {
      const newTags = [...tags, selectedTags.trim()];
      setTags(newTags);
      setSelectedTags("");
    }
  };

  const handleRemoveService = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const buildFormData = () => {
    if (
      !youtubeLink ||
      !videoTitle ||
      !selectedCategory ||
      !categoryID ||
      !description ||
      !selectedState ||
      !selectedCity ||
      !selectedVisibility
    ) {
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "worning",
        textBody: "Please fill all required fields",
        autoClose: 2000,
      });
      alert("");
      return null;
    }

    let formData = new FormData();

    formData.append("category_id", categoryID);
    formData.append("type", "link");
    formData.append("title", videoTitle);
    formData.append("description", description);
    formData.append("link", youtubeLink);
    formData.append("states", selectedState);
    formData.append("city", selectedCity);
    formData.append("is_promoted", promotedOn ? "1" : "0");
    formData.append("visibility", selectedVisibility || "Everyone");
    formData.append("tags", JSON.stringify(tags));
    if (image?.uri) {
      formData.append("thumbnail", {
        uri: image.uri,
        name: image.fileName,
        type: image.mimeType,
      } as any);
    }

    return formData;
  };

  const handlePublish = async () => {
    const form = buildFormData();

    if (!form) return;

    if (promotedOn) {
      setPendingFormData(form);
      handleSetupInitialPayment();
    } else {
      try {
        const res = await upload_video(form).unwrap();

        if (res.status) {
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: "Success",
            textBody: res?.message,
            autoClose: 2000,
          });
          setTimeout(() => {
            router?.push(`/home/(tabs)/landingPage`);
          }, 1000);
        } else {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: "Waring",
            textBody: res?.message?.email?.[0] || "Something went wrong!",
            autoClose: 2000,
          });
        }
      } catch (err: any) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Waring",
          textBody: res?.message?.email?.[0] || "Something went wrong!",
          autoClose: 2000,
        });
      }
    }
  };

  //............ Payment ...........//
  const handleSetupInitialPayment = async () => {
    try {
      await refreshUserData();
      if (!userId) {
        throw new Error("User data not available");
      }

      const amount = priceYoutubLink?.data?.uploading_youTube_link || "0";

      const paymentData = {
        reason: "Uploading video",
        amount: amount,
        // payment_method: "pm_card_visa",
      };

      const res = await payment(paymentData).unwrap();
      const successData = {
        id: res?.data?.id,
        amount: res.data?.amount,
        reason: "Promoting YouTube Link",
      };

      setPaymentIntentData(successData);

      const client_secret = res?.data?.client_secret;

      const { error } = await initPaymentSheet({
        merchantDisplayName: "MyTSV App",
        paymentIntentClientSecret: client_secret,
      });
      if (error) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: error?.message,
          autoClose: 2000,
        });
      } else {
        setPaymentVisible(true);
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Payment setup failed",
        autoClose: 2000,
      });
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: error?.message,
          autoClose: 2000,
        });
        return;
      }

      const data = {
        user_id: userId,
        payment_intent_id: paymentIntentData.id,
        reason: paymentIntentData.reason,
        amount: paymentIntentData.amount,
      };

      const res = await paymentSuccess(data).unwrap();

      if (res?.status) {
        // upload video with the stored form data
        try {
          if (!pendingFormData) {
            throw new Error("No form data available");
          }

          const res = await upload_video(pendingFormData).unwrap();

          if (res.status) {
            setSucssMassage(true);
            Toast.show({
              type: ALERT_TYPE.SUCCESS,
              title: "Success",
              textBody: res?.message,
              autoClose: 2000,
            });
            setTimeout(() => {
              setPaymentVisible(false);
              router?.push(`/home/(tabs)/landingPage`);
            }, 1000);
          } else {
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title: "Waring",
              textBody: res?.message?.email?.[0] || "Something went wrong!",
              autoClose: 2000,
            });
          }
        } catch (err: any) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: "Waring",
            textBody: "Failed to upload video",
            autoClose: 2000,
          });
        }
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: (error as any)?.message || "Payment processing failed",
        autoClose: 2000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      enabled={true}
      behavior={"padding"}
      style={tw`bg-primary flex-1 p-4 `}
    >
      <ScrollView
        contentContainerStyle={tw`pb-10`}
        showsVerticalScrollIndicator={false}
      >
        {isUserLoading ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={tw`mt-4`}>Loading data...</Text>
          </View>
        ) : (
          <View>
            <View style={tw`relative`}>
              <View
                style={tw`flex-row justify-between items-center gap-5  pb-8`}
              >
                <TouchableOpacity onPress={() => router.back()}>
                  <View
                    style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
                  >
                    <SvgXml xml={IconBackLeft} />
                  </View>
                </TouchableOpacity>
                <Text style={tw`font-poppinsMedium text-xl `}>
                  Upload YouTube Link
                </Text>
                <View></View>
              </View>
            </View>

            {/* YouTube Link */}
            <View style={tw`pt-5`}>
              <TextInput
                placeholder="Paste your link here"
                placeholderTextColor="black"
                value={youtubeLink}
                onChangeText={setYoutubeLink}
                style={tw`border border-gray-300 font-poppins text-base rounded-full px-4 py-3 `}
              />
            </View>

            {/* State */}
            <View style={tw`pt-4`}>
              <TouchableOpacity
                onPress={() => setStateModalVisible(true)}
                style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full `}
              >
                <Text style={tw`font-poppins text-base`}>
                  {selectedState || "State"}
                </Text>
                <SvgXml xml={IconErowBack} />
              </TouchableOpacity>
            </View>

            {/* City */}
            <View style={tw`pt-4`}>
              <TouchableOpacity
                onPress={() => setCityModalVisible(true)}
                style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full `}
              >
                <Text style={tw`font-poppins text-base`}>
                  {selectedCity || "City"}
                </Text>
                <SvgXml xml={IconErowBack} />
              </TouchableOpacity>
            </View>

            {/* Category */}
            <View style={tw`pt-4`}>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(true)}
                style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full `}
              >
                {isLoading ? (
                  <Text style={tw`flex-1 justify-center items-center`}>
                    loading...
                  </Text>
                ) : (
                  <Text style={tw`font-poppins text-base`}>
                    {selectedCategory || "Category"}
                  </Text>
                )}
                <SvgXml xml={IconErowBack} />
              </TouchableOpacity>
            </View>
            {/* tags */}
            <View style={tw`pt-5`}>
              <View
                style={tw`border border-gray-300 flex-col justify-center pl-7 relative rounded-3xl p-4`}
              >
                <Text
                  style={tw`bg-primary w-14 text-center font-poppins text-base absolute -top-2 left-7`}
                >
                  Tags
                </Text>

                <View style={tw`flex-row gap-3 flex-wrap`}>
                  {tags.map((service, index) => (
                    <View
                      key={index}
                      style={tw`gap-3 py-2 px-4 border flex-row justify-center items-center border-gray-300 rounded-full`}
                    >
                      <Text>{service}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveService(index)}
                      >
                        <SvgXml xml={IconCloseBlack} width={16} height={16} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Input Box */}
                  <TextInput
                    style={tw`flex-1 min-w-[150px]`}
                    placeholder="Type & hit enter"
                    placeholderTextColor="black"
                    value={selectedTags}
                    onChangeText={setSelectedTags}
                    onSubmitEditing={handleAddService}
                    blurOnSubmit={false}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>
            {/* Title & Description */}
            <View style={tw`py-5`}>
              <View style={tw`pb-5`}>
                <TextInput
                  placeholder="Video title goes here"
                  placeholderTextColor="black"
                  value={videoTitle}
                  onChangeText={setVideoTitle}
                  style={tw`border border-gray-300 font-poppins text-base rounded-full px-4 py-3 `}
                />
              </View>
              <TextInput
                placeholder="Description"
                placeholderTextColor="black"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
                style={tw`border border-gray-300 font-poppins text-base rounded-2xl px-4 py-3 h-52`}
              />
            </View>

            {/* Thumbnail */}
            <View style={tw`border border-primaryGray rounded-2xl`}>
              {image?.uri ? (
                <View style={tw`p-3 w-full`}>
                  <View style={tw`relative`}>
                    <TouchableOpacity>
                      <Image
                        style={tw`w-full aspect-video rounded-lg`}
                        source={{
                          uri: image.uri,
                        }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setImage(null)}
                      style={tw`bg-primary h-8 w-8 rounded-full flex-row items-center justify-center absolute top-3 right-3`}
                    >
                      <SvgXml xml={IconCloseBlack} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View
                  style={tw`flex-row items-center justify-between  px-6 py-3  `}
                >
                  <Text style={tw`font-poppins text-base`}>Thumbnail</Text>
                  <TouchableOpacity
                    onPress={pickImage}
                    style={tw`flex-row items-center gap-3 border border-[#3B97D3] py-2 px-5 rounded-full`}
                  >
                    <SvgXml xml={IconUploadBlue} />
                    <Text style={tw`font-poppins text-base text-[#3B97D3]`}>
                      Upload an image
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {/* Visibility */}
            <View style={tw`pt-5`}>
              <TouchableOpacity
                onPress={() => setVisibility(true)}
                style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full `}
              >
                <Text style={tw`font-poppins text-base`}>
                  {selectedVisibility || "Visibility"}
                </Text>
                <SvgXml xml={IconErowBack} />
              </TouchableOpacity>
            </View>

            {/* Promotion */}
            <View style={tw`pt-5`}>
              <TouchableOpacity
                onPress={() => setPromotedOn(!promotedOn)}
                style={tw`flex-row items-center gap-3 ${
                  promotedOn ? "bg-secondary" : "bg-[#EFEFEF]"
                }  w-5/6  px-6 py-3 rounded-full `}
              >
                <SvgXml xml={IconPromoted} />
                <Text
                  style={tw`font-poppins text-base ${
                    promotedOn ? "text-primary" : ""
                  }`}
                >
                  Promote for ${priceYoutubLink?.data?.uploading_youTube_link} /
                  Month
                </Text>
              </TouchableOpacity>
            </View>

            {promotedOn ? (
              <View>
                {/* Footer */}
                <View style={tw`flex-row justify-end gap-3 px-6 py-4  `}>
                  <TouchableOpacity
                    style={tw`border flex-row items-center border-primaryGray rounded-md`}
                  >
                    <Text style={tw`text-2xl font-poppinsMedium py-2 px-7`}>
                      {priceYoutubLink?.data?.uploading_youTube_link}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePublish}
                    style={tw`bg-[#EF4444] py-2 px-6 rounded-md justify-center items-center`}
                  >
                    <Text style={tw`text-white font-poppinsMedium`}>
                      Checkout
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={tw`flex-row gap-2 py-7`}>
                  <SvgXml xml={IconWorningGary} />
                  <Text style={tw`text-base font-poppins`}>
                    After payment you will be returned here immediately.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={tw`pt-5`}>
                <TouchableOpacity
                  onPress={handlePublish}
                  style={tw`flex-row items-center gap-3  bg-secondary  px-6 py-3 rounded-full justify-center`}
                >
                  <Text style={tw`font-poppinsMedium text-primary text-base `}>
                    Publish
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Payment Modal */}
            <Modal
              visible={paymentVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setPaymentVisible(false)}
            >
              <View style={tw`flex-1 justify-end bg-black/50`}>
                <View style={tw`bg-primary rounded-t-3xl w-full `}>
                  {/* Header */}
                  <View
                    style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
                  >
                    <View></View>
                    <Text style={tw`text-primary text-xl font-poppins`}>
                      Pay to MyTSV
                    </Text>
                    <TouchableOpacity onPress={() => setPaymentVisible(false)}>
                      <SvgXml xml={IconClose} />
                    </TouchableOpacity>
                  </View>
                  <View style={tw`p-5`}>
                    {/* Amount Section */}
                    <View style={tw`items-center mb-5`}>
                      <Text style={tw`text-gray-500 font-poppins`}>
                        Required amount
                      </Text>
                      <Text style={tw`text-3xl font-poppinsBold text-black`}>
                        ${priceYoutubLink?.data?.uploading_youTube_link}
                      </Text>
                    </View>
                    {/* Buttons */}
                    <View style={tw`flex-row justify-between`}>
                      <TouchableOpacity
                        onPress={() => setPaymentVisible(false)}
                        style={tw`bg-white border border-gray-300 rounded-full py-3 px-6 w-[48%]`}
                      >
                        <Text
                          style={tw`text-center font-poppins text-base text-black`}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={tw`bg-[#FF5A5F] rounded-full py-3 px-6 w-[48%] ${
                          isProcessing ? "opacity-50" : ""
                        }`}
                        onPress={handlePayment}
                        disabled={isProcessing}
                      >
                        <Text
                          style={tw`text-center font-poppinsBold text-base text-white`}
                        >
                          {isProcessing ? "Processing..." : "Pay now"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Success Message Modal */}
            <Modal
              visible={sucssMassage}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setSucssMassage(false)}
            >
              <View style={tw`flex-1 h-4/6  bg-black/50 justify-center `}>
                <View
                  style={tw`bg-primary flex-col justify-center items-center  mx-8 py-14 rounded- `}
                >
                  <SvgXml xml={IconSucssMsg} />
                  <Text
                    style={tw`font-poppinsSemiBold text-xl text-[#008716] p-5`}
                  >
                    Payment successful
                  </Text>
                  <View style={tw`flex-row gap-1`}>
                    <ActivityIndicator color={"gray"} size={"small"} />
                    <Text style={tw`font-poppins text-sm text-secondarygray`}>
                      Redirecting to publishing page
                    </Text>
                  </View>
                </View>
              </View>
            </Modal>

            {/* State Selection Modal */}
            <Modal
              visible={stateModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setStateModalVisible(false)}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={tw`flex-1 justify-end bg-black/50`}>
                  <View style={tw`bg-primary rounded-t-3xl w-full`}>
                    <View
                      style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
                    >
                      <View></View>
                      <Text style={tw`text-primary text-xl font-poppins`}>
                        {" "}
                        Select State{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setStateModalVisible(false)}
                      >
                        <SvgXml xml={IconClose} />
                      </TouchableOpacity>
                    </View>

                    {stateData?.data?.map((state: any) => (
                      <TouchableOpacity
                        key={state.id}
                        onPress={() => {
                          setSelectedState(state.name);
                          setStateModalVisible(false);
                          setStateID(state.id);
                        }}
                        style={tw`py-4 border-b border-primaryGray`}
                      >
                        <Text style={tw`text-center font-poppins text-base`}>
                          {" "}
                          {state.name}{" "}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </Modal>

            {/* city Selection Modal */}
            <Modal
              visible={cityModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setCityModalVisible(false)}
            >
              <View style={tw`flex-1 justify-end bg-black/50`}>
                <View style={tw`bg-primary rounded-t-3xl w-full max-h-3/4`}>
                  {/* Header - Fixed at top */}
                  <View
                    style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
                  >
                    <View></View>
                    <Text style={tw`text-primary text-xl font-poppins`}>
                      Select City
                    </Text>
                    <TouchableOpacity
                      onPress={() => setCityModalVisible(false)}
                    >
                      <SvgXml xml={IconClose} />
                    </TouchableOpacity>
                  </View>

                  {/* Scrollable Content - Dynamic height based on data */}
                  <View style={tw`max-h-64`}>
                    <ScrollView
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={tw`pb-4`}
                    >
                      {cityData?.data.length === 0 ? (
                        <Text
                          style={tw`text-center font-poppins text-gray-500 py-4`}
                        >
                          No cities available. Please select a state first.
                        </Text>
                      ) : (
                        cityData?.data.map((city: any) => (
                          <TouchableOpacity
                            key={city.id}
                            onPress={() => {
                              setSelectedCity(city.name);
                              setCityModalVisible(false);
                            }}
                            style={tw`py-4 border-b border-primaryGray`}
                          >
                            <Text
                              style={tw`text-center font-poppins text-base`}
                            >
                              {city.name}
                            </Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Category Modal */}
            <Modal
              visible={categoryModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setCategoryModalVisible(false)}
            >
              <View style={tw`flex-1 justify-end bg-black/50`}>
                <View style={tw`bg-primary rounded-t-3xl w-full `}>
                  {/* Header */}
                  <View
                    style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
                  >
                    <View></View>
                    <Text style={tw`text-primary text-xl font-poppins`}>
                      Select Category
                    </Text>
                    <TouchableOpacity
                      onPress={() => setCategoryModalVisible(false)}
                    >
                      <SvgXml xml={IconClose} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={categoryData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedCategory(item?.name);
                          setCategoryID(item?.id);
                          setCategoryModalVisible(false);
                        }}
                        style={tw`py-4 border-b border-primaryGray`}
                      >
                        <Text style={tw`text-center font-poppins text-base`}>
                          {item?.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                  />
                </View>
              </View>
            </Modal>

            {/* Visibility Modal */}
            <Modal
              visible={visibility}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setVisibility(false)}
            >
              <View style={tw`flex-1 justify-end bg-black/50`}>
                <View style={tw`bg-primary rounded-t-3xl w-full `}>
                  {/* Header */}
                  <View
                    style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
                  >
                    <View></View>
                    <Text style={tw`text-primary text-xl font-poppins`}>
                      Select Visibility
                    </Text>
                    <TouchableOpacity onPress={() => setVisibility(false)}>
                      <SvgXml xml={IconClose} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedVisibility("Everyone");
                      setVisibility(false);
                    }}
                    style={tw` bg-black/50 justify-center `}
                  >
                    <View
                      style={tw`bg-primary flex-col justify-center border border-dashed border-primaryGray py-4 items-center `}
                    >
                      <View
                        style={tw`flex-row items-center justify-center gap-3`}
                      >
                        <SvgXml xml={IconWorld} />
                        <Text style={tw`font-poppins text-base`}>Everyone</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedVisibility("Only me");
                      setVisibility(false);
                    }}
                    style={tw` bg-black/50 justify-center `}
                  >
                    <View
                      style={tw`bg-primary flex-col justify-center border border-dashed border-primaryGray py-4 items-center `}
                    >
                      <View
                        style={tw`flex-row items-center justify-center gap-3`}
                      >
                        <SvgXml xml={IconLock} />
                        <Text style={tw`font-poppins text-base`}>Only me</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default youTubeLink;
