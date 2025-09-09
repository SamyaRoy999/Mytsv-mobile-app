// UploadVideo.tsx
import { useStripe } from '@stripe/stripe-react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { TextInput } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';

import {
    IconBackLeft,
    IconClose,
    IconCloseBlack,
    IconErowBack,
    IconLock,
    IconPromoted,
    IconUpload,
    IconUploadBlue,
    IconWorld,
} from '@/icons/Icon';
import tw from '@/lib/tailwind';
import { _Width } from '@/utils/utils';

import { usePriceGetAllQuery } from '@/redux/apiSlices/Home/homeApiSlices';
import { useMyProfileQuery } from '@/redux/apiSlices/MyVideo/myvideoSlice';
import {
    usePaymentMutation,
    usePaymentSuccessMutation,
} from '@/redux/apiSlices/payment/paymentSlice';
import {
    useCategoriesQuery,
    useCityGetQuery,
    useStateGetQuery,
    useUpload_videoMutation,
} from '@/redux/apiSlices/UploadVideo/uploadVideoSices';

const UploadVideo = () => {
    // ----------------- Local UI state -----------------
    const [paymentVisible, setPaymentVisible] = React.useState(false);
    const [stateModalVisible, setStateModalVisible] = React.useState(false);
    const [cityModalVisible, setCityModalVisible] = React.useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = React.useState(false);
    const [visibilityModalVisible, setVisibilityModalVisible] = React.useState(false);
    const [promotedOn, setPromotedOn] = React.useState(false);
    const [videoAsset, setVideoAsset] = React.useState<ImagePicker.ImagePickerAsset | null>(null);
    const [imageAsset, setImageAsset] = React.useState<ImagePicker.ImagePickerAsset | null>(null);
    const [tags, setTags] = React.useState<string[]>([]);
    const [inputValue, setInputValue] = React.useState('');

    const [isProcessing, setIsProcessing] = React.useState(false);
    const [stateID, setStateID] = React.useState<number | null>(null);

    // Keep the prepared FormData that will be uploaded after payment succeeds
    const pendingFormRef = React.useRef<FormData | null>(null);
    // ----------------- Stripe -----------------
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    // ----------------- Form data -----------------
    const [formData, setFormData] = React.useState({
        state: '',
        city: '',
        type: 'video',
        category: '',
        category_id: '',
        title: '',
        description: '',
        visibility: '',
        tags: [] as string[],
        is_promoted: '0',
        status: 'active',
    });

    // ----------------- API hooks -----------------
    const { data: categories, isLoading, refetch } = useCategoriesQuery({});
    const { data: userId, isLoading: isUserLoading, error: userError } = useMyProfileQuery({});
    const { data: stateData, isLoading: isStateLoading } = useStateGetQuery({});
    const { data: cityData, isLoading: isCityLoading } = useCityGetQuery(stateID);
    const [upload_video] = useUpload_videoMutation();
    const [payment] = usePaymentMutation();
    const [paymentSuccess] = usePaymentSuccessMutation();
    const { data: priceUploadVideo } = usePriceGetAllQuery({});

    const categoryData = categories?.data?.data ?? [];

    // ----------------- Effects -----------------

    React.useEffect(() => {
        if (userError) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Failed to load user data',
                autoClose: 2000,
            });
        }
    }, [userError]);

    // ----------------- Helpers -----------------//
    
    const updateFormData = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const buildFormData = (): FormData | null => {
        // basic validation
        if (
            !formData.category_id ||
            !formData.type ||
            !formData.title?.trim() ||
            !formData.description?.trim() ||
            !formData.visibility ||
            !imageAsset ||
            !videoAsset
        ) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Missing Information',
                textBody: 'Missing Information',
                autoClose: 2000,
            });
            return null;
        }

        const form = new FormData();
        form.append('category_id', String(formData.category_id));
        form.append('type', formData.type);
        form.append('title', formData.title.trim());
        form.append('description', formData.description.trim());
        form.append('visibility', formData.visibility);
        form.append("is_promoted", promotedOn ? "1" : "0");

        if (tags.length > 0) {
            form.append('tags', JSON.stringify(tags));
        }
        if (formData.state) form.append('states', formData.state);
        if (formData.city) form.append('city', formData.city);

        // thumbnail
        if (imageAsset?.uri) {
            const filename = imageAsset.fileName ?? imageAsset.uri.split('/').pop() ?? `thumbnail_${Date.now()}.jpg`;
            const extMatch = /\.(\w+)$/.exec(filename);
            const mime = extMatch ? `image/${extMatch[1]}` : 'image/jpeg';

            // NOTE: React Native file object shape
            form.append('thumbnail', {
                uri: imageAsset.uri,
                name: filename,
                type: mime,
            } as any);
        }

        // video
        if (videoAsset?.uri) {
            const filename = videoAsset.fileName ?? videoAsset.uri.split('/').pop() ?? `video_${Date.now()}.mp4`;
            const extMatch = /\.(\w+)$/.exec(filename);
            // fallback to mp4
            const mime = extMatch ? `video/${extMatch[1]}` : 'video/mp4';

            form.append('video', {
                uri: videoAsset.uri,
                name: filename,
                type: mime,
            } as any);
        }

        return form;
    };

    // ----------------- UI Actions -----------------
    const pickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled && result.assets.length > 0) {
            setVideoAsset(result.assets[0]);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });
        if (!result.canceled && result.assets.length > 0) {
            setImageAsset(result.assets[0]);
        }
    };

    const handleAddService = () => {
        if (inputValue.trim()) {
            const newTags = [...tags, inputValue.trim()];
            setTags(newTags);
            setFormData((prev) => ({ ...prev, tags: newTags }));
            setInputValue('');
        }
    };

    const handleRemoveService = (index: number) => {
        const newTags = tags.filter((_, i) => i !== index);
        setTags(newTags);
        setFormData((prev) => ({ ...prev, tags: newTags }));
    };

    const handlePublish = async () => {
        const form = buildFormData();
        if (!form) return;

        try {
            setIsProcessing(true);
            const uploadRes = await upload_video(form).unwrap();

            if (uploadRes?.status) {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    textBody: 'Video uploaded successfully!',
                    autoClose: 2000,
                });

                setTimeout(() => {
                    router.replace('/home/(tabs)/landingPage');
                }, 1200);
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Video upload failed',
                    autoClose: 2000,
                });
            }
        } catch (e: any) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: e?.message || 'Video upload failed',
                autoClose: 2000,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // ----------------- Payment Flow -----------------
    // 1) Checkout button → only open modal
    const openPaymentModal = () => {
        const form = buildFormData();
        if (!form) return;
        pendingFormRef.current = form; // store for after payment
        setPaymentVisible(true);
    };

    // 2) On modal "Pay now" → init payment + present sheet + upload
    const handleSetupInitialPayment = async () => {
        if (!pendingFormRef.current) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Warning',
                textBody: 'Provide all necessary inputs first',
                autoClose: 2000,
            });
            return;
        }

        try {
            const amount = priceUploadVideo?.data?.uploading_video || '0';
            const paymentData = {
                reason: 'Uploading video',
                amount,
                payment_method: 'pm_card_visa',
            };

            const res = await payment(paymentData).unwrap();

            const successData = {
                id: res?.data?.id,
                amount: res?.data?.amount,
                reason: 'Uploading video',
            };

            const client_secret = res?.data?.client_secret;

            const { error } = await initPaymentSheet({
                merchantDisplayName: 'MyTSV App',
                paymentIntentClientSecret: client_secret,
            });

            if (error) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: error?.message,
                    autoClose: 2000,
                });
            } else {
                // pass successData directly to avoid first-time race condition
                await checkout(pendingFormRef.current, successData);
            }
        } catch (e: any) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: e?.message || 'Payment setup failed',
                autoClose: 2000,
            });
        }
    };

    const checkout = async (item: FormData, paymentInfo: { id: string; reason: string; amount: number | string }) => {
        setIsProcessing(true);
        try {
            const { error } = await presentPaymentSheet();
            if (error) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: error?.message,
                    autoClose: 2000,
                });
                return;
            }

            if (!userId?.data?.id || !paymentInfo) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'User or payment data not available',
                    autoClose: 2000,
                });
                return;
            }

            const data = {
                user_id: userId.data.id,
                payment_intent_id: paymentInfo.id,
                reason: paymentInfo.reason,
                amount: paymentInfo.amount,
            };

            const res = await paymentSuccess(data).unwrap();

            if (res?.status) {
                const uploadRes = await upload_video(item).unwrap();
                if (uploadRes?.status) {
                    Toast.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: 'Success',
                        textBody: 'Video uploaded successfully!',
                        autoClose: 2000,
                    });
                    setPaymentVisible(false);
                    pendingFormRef.current = null;
                    setTimeout(() => {
                        router.replace('/home/(tabs)/landingPage');
                    }, 1200);
                } else {
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: 'Video upload failed',
                        autoClose: 2000,
                    });
                }
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Payment confirmation failed',
                    autoClose: 2000,
                });
            }
        } catch (e: any) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: e?.message || 'Payment processing failed',
                autoClose: 2000,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // ----------------- Loading states -----------------
    if (isLoading || isUserLoading || isCityLoading || isStateLoading) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" />
                <Text style={tw`mt-4`}>Loading data...</Text>
            </View>
        );
    }

    // ----------------- UI -----------------
    return (
        <KeyboardAvoidingView enabled behavior="padding" style={tw`bg-primary flex-1 p-4`}>
            {isProcessing && (
                <View style={tw`absolute inset-0 bg-black/50 justify-center items-center z-10`}>
                    <ActivityIndicator size="large" />
                    <Text style={tw`text-white mt-4`}>Processing ...</Text>
                </View>
            )}

            <AlertNotificationRoot>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={tw`relative`}>
                        <View style={tw`flex-row justify-between items-center gap-5 mb-8`}>
                            <TouchableOpacity onPress={() => router.back()}>
                                <View
                                    style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
                                >
                                    <SvgXml xml={IconBackLeft} />
                                </View>
                            </TouchableOpacity>
                            <Text style={tw`font-poppinsMedium text-xl`}>Upload Video</Text>
                            <View />
                        </View>
                    </View>

                    {/* Video Upload */}
                    <TouchableOpacity style={tw`border border-dashed rounded-lg justify-center items-center py-10`}>
                        <SvgXml xml={IconUpload} />
                        <Text style={tw`font-poppins text-base text-primaryGrayDeep`}>Drag & drop your file</Text>

                        <>
                            <Text style={tw`font-poppins text-base text-primaryGrayDeep`}>or</Text>
                            <TouchableOpacity onPress={pickVideo} style={tw`font-poppins text-base bg-secondary rounded-md`}>
                                <Text style={tw`text-primary py-2 px-6`}>Browse files</Text>
                            </TouchableOpacity>
                            {videoAsset && (
                                <Text style={tw`py-2 px-6`}>
                                    {videoAsset.fileName || videoAsset.uri.split('/').pop() || 'selected_video.mp4'}
                                </Text>
                            )}
                        </>
                    </TouchableOpacity>

                    {/* State */}
                    <View style={tw`pt-4`}>
                        <TouchableOpacity
                            onPress={() => setStateModalVisible(true)}
                            style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full`}
                        >
                            <Text style={tw`font-poppins text-base`}>{formData.state || 'State'}</Text>
                            <SvgXml xml={IconErowBack} />
                        </TouchableOpacity>
                    </View>

                    {/* City */}
                    <View style={tw`pt-4`}>
                        <TouchableOpacity
                            onPress={() => setCityModalVisible(true)}
                            style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full`}
                        >
                            <Text style={tw`font-poppins text-base`}>{formData.city || 'City'}</Text>
                            <SvgXml xml={IconErowBack} />
                        </TouchableOpacity>
                    </View>

                    {/* Category */}
                    <View style={tw`pt-4`}>
                        <TouchableOpacity
                            onPress={() => setCategoryModalVisible(true)}
                            style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full`}
                        >
                            <Text style={tw`font-poppins text-base`}>{formData.category || 'Category'}</Text>
                            <SvgXml xml={IconErowBack} />
                        </TouchableOpacity>
                    </View>

                    {/* Tags */}
                    <View style={tw`py-5`}>
                        <View style={tw`border border-gray-300 flex-col justify-center pl-7 relative rounded-3xl p-4`}>
                            <Text style={tw`bg-primary w-14 font-poppins text-base absolute -top-2 left-7`}>Tags</Text>

                            <View style={tw`flex-row gap-3 flex-wrap`}>
                                {tags.map((service, index) => (
                                    <View
                                        key={`${service}-${index}`}
                                        style={tw`gap-3 py-2 px-4 border flex-row justify-center items-center border-gray-300 rounded-full`}
                                    >
                                        <Text>{service}</Text>
                                        <TouchableOpacity onPress={() => handleRemoveService(index)}>
                                            <SvgXml xml={IconCloseBlack} width={16} height={16} />
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                <TextInput
                                    style={tw`flex-1 min-w-[150px]`}
                                    placeholder="Type & hit enter"
                                    placeholderTextColor="black"
                                    value={inputValue}
                                    onChangeText={setInputValue}
                                    onSubmitEditing={handleAddService}
                                    blurOnSubmit={false}
                                    returnKeyType="done"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Title & Description */}
                    <View>
                        <TextInput
                            placeholder="Video title goes here"
                            placeholderTextColor="black"
                            value={formData.title}
                            onChangeText={(text) => updateFormData('title', text)}
                            style={tw`border border-gray-300 font-poppins text-base rounded-full px-4 py-3 mb-4`}
                        />
                        <TextInput
                            placeholder="Description"
                            placeholderTextColor="black"
                            value={formData.description}
                            onChangeText={(text) => updateFormData('description', text)}
                            multiline
                            textAlignVertical="top"
                            style={tw`border border-gray-300 font-poppins text-base rounded-2xl px-4 py-3 h-52`}
                        />
                    </View>

                    {/* Thumbnail */}
                    <View style={tw`flex-row items-center border border-primaryGray rounded-2xl mt-5 justify-between px-6 py-3`}>
                        <Text style={tw`font-poppins text-base`}>Thumbnail</Text>
                        {!imageAsset?.uri && (
                            <TouchableOpacity
                                onPress={pickImage}
                                style={tw`flex-row items-center gap-3 border border-[#3B97D3] py-2 px-5 rounded-full`}
                            >
                                <SvgXml xml={IconUploadBlue} />
                                <Text style={tw`font-poppins text-base text-[#3B97D3]`}>Upload an image</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={tw`p-3 w-full`}>
                        {imageAsset?.uri && (
                            <View style={tw`relative`}>
                                <TouchableOpacity>
                                    <Image style={tw`w-full aspect-video rounded-lg`} source={{ uri: imageAsset.uri }} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setImageAsset(null)}
                                    style={tw`bg-primary h-8 w-8 rounded-full flex-row items-center justify-center absolute top-3 right-3`}
                                >
                                    <SvgXml xml={IconCloseBlack} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Visibility */}
                    <TouchableOpacity
                        onPress={() => setVisibilityModalVisible(true)}
                        style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full mt-4`}
                    >
                        <Text style={tw`font-poppins text-base`}>{formData.visibility || 'Visibility'}</Text>
                        <SvgXml xml={IconErowBack} />
                    </TouchableOpacity>
                    <View style={tw`pt-5`}>
                        <TouchableOpacity
                            onPress={() => setPromotedOn(!promotedOn)}
                            style={tw`flex-row items-center gap-3 ${promotedOn ? "bg-secondary" : "bg-[#EFEFEF]"}  w-5/6  px-6 py-3 rounded-full `}
                        >
                            <SvgXml xml={IconPromoted} />
                            <Text style={tw`font-poppins text-base ${promotedOn ? "text-primary" : ""}`}>Promote for ${priceUploadVideo?.data?.uploading_video} / Month</Text>
                        </TouchableOpacity>
                    </View>
                    {promotedOn ? (
                        <View>

                            {/* Footer */}
                            < View style={tw`flex-row justify-end gap-3 px-6 py-4`}>
                                <TouchableOpacity style={tw`border flex-row items-center border-primaryGray rounded-md`}>
                                    <Text style={tw`text-2xl font-poppinsMedium py-2 px-7`}>
                                        ${priceUploadVideo?.data?.uploading_video ?? '0'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={openPaymentModal}
                                    disabled={isProcessing}
                                    style={[
                                        styles.button,
                                        isProcessing && styles.buttonDisabled,
                                        { backgroundColor: '#EF4444' } // Change this color to your preference
                                    ]}
                                >
                                    <Text style={styles.buttonText}>
                                        {isProcessing ? 'Processing...' : 'Checkout'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={tw`pt-5`}>
                            <TouchableOpacity
                                onPress={handlePublish}
                                style={tw`flex-row items-center gap-3  bg-secondary  px-6 py-3 rounded-full justify-center`}
                            >
                                <Text style={tw`font-poppinsMedium text-primary text-base `}>Publish</Text>
                            </TouchableOpacity>
                        </View>
                    )}


                    {/* ----------------- Payment Modal ----------------- */}
                    <Modal
                        visible={paymentVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setPaymentVisible(false)}
                    >
                        <View style={tw`flex-1 justify-end bg-black/50`}>
                            <View style={tw`bg-primary rounded-t-3xl w-full`}>
                                <View
                                    style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
                                >
                                    <View />
                                    <Text style={tw`text-primary text-xl font-poppins`}>Pay to MyTSV</Text>
                                    <TouchableOpacity onPress={() => setPaymentVisible(false)}>
                                        <SvgXml xml={IconClose} />
                                    </TouchableOpacity>
                                </View>

                                <View style={tw`p-5`}>
                                    <View style={tw`items-center mb-5`}>
                                        <Text style={tw`text-gray-500 font-poppins`}>Required amount</Text>
                                        <Text style={tw`text-3xl font-poppinsBold text-black`}>
                                            ${priceUploadVideo?.data?.uploading_video ?? '0'}
                                        </Text>
                                    </View>

                                    <View style={tw`flex-row justify-between`}>
                                        <TouchableOpacity
                                            onPress={() => setPaymentVisible(false)}
                                            style={tw`bg-white border border-gray-300 rounded-full py-3 px-6 w-[48%]`}
                                        >
                                            <Text style={tw`text-center font-poppins text-base text-black`}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            disabled={isProcessing}
                                            onPress={handleSetupInitialPayment}
                                            style={tw`bg-[#FF5A5F] rounded-full py-3 px-6 w-[48%] opacity-${isProcessing ? '50' : '100'}`}
                                        >
                                            <Text style={tw`text-center font-poppinsBold text-base text-white`}>
                                                {isProcessing ? 'Processing...' : 'Pay now'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* ----------------- State Modal ----------------- */}
                    <Modal
                        visible={stateModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setStateModalVisible(false)}
                    >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={tw`flex-1 justify-end bg-black/50`}>
                                <View style={tw`bg-primary rounded-t-3xl w-full`}>
                                    <View
                                        style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
                                    >
                                        <View />
                                        <Text style={tw`text-primary text-xl font-poppins`}>Select State</Text>
                                        <TouchableOpacity onPress={() => setStateModalVisible(false)}>
                                            <SvgXml xml={IconClose} />
                                        </TouchableOpacity>
                                    </View>

                                    {stateData?.data?.map((state: any) => (
                                        <TouchableOpacity
                                            key={state.id}
                                            onPress={() => {
                                                updateFormData('state', state.name);
                                                setStateModalVisible(false);
                                                setStateID(state.id);
                                            }}
                                            style={tw`py-4 border-b border-primaryGray`}
                                        >
                                            <Text style={tw`text-center font-poppins text-base`}>{state.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>

                    {/* ----------------- City Modal ----------------- */}
                    <Modal
                        visible={cityModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setCityModalVisible(false)}
                    >
                        <View style={tw`flex-1 justify-end bg-black/50`}>
                            <View style={tw`bg-primary rounded-t-3xl w-full max-h-3/4`}>
                                <View
                                    style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
                                >
                                    <View />
                                    <Text style={tw`text-primary text-xl font-poppins`}>Select City</Text>
                                    <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                                        <SvgXml xml={IconClose} />
                                    </TouchableOpacity>
                                </View>

                                <View style={tw`max-h-64`}>
                                    <ScrollView showsVerticalScrollIndicator contentContainerStyle={tw`pb-4`}>
                                        {Array.isArray(cityData?.data) && cityData?.data.length > 0 ? (
                                            cityData.data.map((city: any) => (
                                                <TouchableOpacity
                                                    key={city.id}
                                                    onPress={() => {
                                                        updateFormData('city', city.name);
                                                        setCityModalVisible(false);
                                                    }}
                                                    style={tw`py-4 border-b border-primaryGray`}
                                                >
                                                    <Text style={tw`text-center font-poppins text-base`}>{city.name}</Text>
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <Text style={tw`text-center font-poppins text-gray-500 py-4`}>
                                                No cities available. Please select a state first.
                                            </Text>
                                        )}
                                    </ScrollView>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* ----------------- Category Modal ----------------- */}
                    <Modal
                        visible={categoryModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setCategoryModalVisible(false)}
                    >
                        <View style={tw`flex-1 justify-end bg-black/50`}>
                            <View style={tw`bg-primary rounded-t-3xl w-full`}>
                                <View
                                    style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
                                >
                                    <View />
                                    <Text style={tw`text-primary text-xl font-poppins`}>Select Category</Text>
                                    <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                                        <SvgXml xml={IconClose} />
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={categoryData}
                                    keyExtractor={(item: any) => String(item.id)}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                updateFormData('category', item?.name);
                                                updateFormData('category_id', item?.id);
                                                setCategoryModalVisible(false);
                                            }}
                                            style={tw`py-4 border-b border-primaryGray`}
                                        >
                                            <Text style={tw`text-center font-poppins text-base`}>{item?.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                    showsVerticalScrollIndicator={false}
                                    scrollEnabled={false}
                                />
                            </View>
                        </View>
                    </Modal>

                    {/* ----------------- Visibility Modal ----------------- */}
                    <Modal
                        visible={visibilityModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setVisibilityModalVisible(false)}
                    >
                        <View style={tw`flex-1 justify-end bg-black/50`}>
                            <View style={tw`bg-primary rounded-t-3xl w-full`}>
                                <View
                                    style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
                                >
                                    <View />
                                    <Text style={tw`text-primary text-xl font-poppins`}>Visibility</Text>
                                    <TouchableOpacity onPress={() => setVisibilityModalVisible(false)}>
                                        <SvgXml xml={IconClose} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    onPress={() => {
                                        updateFormData('visibility', 'Everyone');
                                        setVisibilityModalVisible(false);
                                    }}
                                    style={tw`py-4 border-b border-primaryGray`}
                                >
                                    <View style={tw`flex-row items-center justify-center gap-3`}>
                                        <SvgXml xml={IconWorld} />
                                        <Text style={tw`font-poppins text-base`}>Everyone</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        updateFormData('visibility', 'Only me');
                                        setVisibilityModalVisible(false);
                                    }}
                                    style={tw`py-4`}
                                >
                                    <View style={tw`flex-row items-center justify-center gap-3`}>
                                        <SvgXml xml={IconLock} />
                                        <Text style={tw`font-poppins text-base`}>Only me</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            </AlertNotificationRoot>
        </KeyboardAvoidingView >
    );
};

export default UploadVideo;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    video: {
        width: _Width,
        height: 250,
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 }, // iOS shadow
        shadowOpacity: 0.2, // iOS shadow
        shadowRadius: 4, // iOS shadow
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
});
