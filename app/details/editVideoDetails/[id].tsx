import {
    IconBackLeft,
    IconClose,
    IconCloseBlack,
    IconErowBack,
    IconLock,
    IconReplece,
    IconWorld
} from '@/icons/Icon';
import tw from '@/lib/tailwind';
import { useMy_videos_detailsQuery, useUpdateVideoMutation } from '@/redux/apiSlices/MyVideo/myvideoSlice';
import { useCategoriesQuery, useCityGetQuery, useStateGetQuery } from '@/redux/apiSlices/UploadVideo/uploadVideoSices';
import { _Width } from '@/utils/utils';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";
import { SvgXml } from 'react-native-svg';
import YoutubeIframe from 'react-native-youtube-iframe';

const EditVideoDetails = () => {
    const [stateModalVisible, setStateModalVisible] = useState(false);
    const [cityModalVisible, setCityModalVisible] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedVisibility, setSelectedVisibility] = useState('');
    const [visibility, setVisibility] = useState(false);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [categoryID, setCategoryID] = useState('');
    const [image, setImage] = useState<any>(null);
    const [selectedVideos, setSelectedVideos] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTags, setSelectedTags] = React.useState('');
    const [tags, setTags] = React.useState<string[]>([]);
    const [isYoutubeVideo, setIsYoutubeVideo] = React.useState(false);
    const [youtubeVideoId, setYoutubeVideoId] = React.useState('');
    const [youtubeLink, setYoutubeLink] = React.useState('');
    const [stateID, setStateID] = React.useState(false);
    const playerRef = useRef<any>(null);
    const isPlayerInitialized = useRef(false);

    const { id } = useLocalSearchParams();

    // API CALL
    const { data: singleVideo, refetch: singleVideoRefetch } = useMy_videos_detailsQuery({ id });
    const {
        category,
        city,
        states,
        video,
        thumbnail,
        description: initialDescription,
        title: initialTitle,
        visibility: visibilityApi,
        tags: initialTags,
        link,
        type
    } = singleVideo?.data || {};

    const { data: categories, isLoading, refetch } = useCategoriesQuery({});
    const categoryData = categories?.data?.data;
    const [updateVideo] = useUpdateVideoMutation();
    const { data: stateData, isLoading: isStateLoding, refetch: refetchState } = useStateGetQuery({})
    const { data: cityData, isLoading: isCityLoding, refetch: refetchCity } = useCityGetQuery(stateID)

    // .........Initialize form fields with API data.........//
    useFocusEffect(
        useCallback(() => {
            singleVideoRefetch()
        }, [])
    )
    useEffect(() => {
        if (singleVideo?.data) {
            setTitle(initialTitle || '');
            setDescription(initialDescription || '');
            setSelectedState(states || '');
            setSelectedCity(city || '');
            setSelectedCategory(category?.name || '');
            setCategoryID(category?.id || '');
            setSelectedVisibility(visibilityApi || '');
            setYoutubeLink(link || '');
            // Initialize tags from API
            if (initialTags) {
                setTags(Array.isArray(initialTags) ? initialTags : [initialTags]);
            }
        }
    }, [singleVideo]);

    // UPLOAD IMG
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    // UPLOAD VIDEO - Only for non-YouTube videos
    const pickVideo = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedVideos(result.assets[0]);
        }
    };

    // Initialize video player only for non-YouTube videos
    const videoSource = type === 'link'
        ? video
        : selectedVideos
            ? { uri: selectedVideos.uri }
            : video;
    const player = useVideoPlayer(videoSource, (player) => {
        if (!isPlayerInitialized.current && type !== 'link') {
            player.loop = true;
            player.play();
            playerRef.current = player;
            isPlayerInitialized.current = true;
        }
    });

    useFocusEffect(
        useCallback(() => {
            if (playerRef.current && isPlayerInitialized.current && type !== 'link') {
                try {
                    playerRef.current.play();
                } catch (error) {
                }
            }

            return () => {
                if (playerRef.current && isPlayerInitialized.current && type !== 'link') {
                    try {
                        playerRef.current.pause();
                    } catch (error) {
                    
                    }
                }
            };
        }, [type])
    );

    useEffect(() => {
        return () => {
            // Clean up player when component unmounts
            if (playerRef.current && isPlayerInitialized.current && type !== 'link') {
                try {
                    playerRef.current.pause();
                    playerRef.current.seekTo(0);
                    isPlayerInitialized.current = false;
                } catch (error) {
                }
            }
        };
    }, [type]);

    useEffect(() => {
        // Check if it's a YouTube video
        if (type === 'link' && link && (link.includes('youtube.com') || link.includes('youtu.be'))) {
            setIsYoutubeVideo(true);

            // Extract YouTube video ID
            const youtubeId = extractYoutubeId(link);
            if (youtubeId) {
                setYoutubeVideoId(youtubeId);
            }
        } else {
            setIsYoutubeVideo(false);
        }
    }, [type, link]);

    const extractYoutubeId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    const handleSaveChanges = async () => {
        let formData = new FormData();

        formData.append('title', title);
        formData.append('description', description);
        formData.append('states', selectedState);
        formData.append('city', selectedCity);
        formData.append('category_id', categoryID);

        if (tags.length > 0) {
            formData.append('tags', JSON.stringify(tags));
        }

        formData.append('visibility', selectedVisibility);
        formData.append('_method', 'PUT');

        // For YouTube videos, add the link
        if (type === 'link') {
            formData.append('link', youtubeLink);
        }

        // Add thumbnail file if selected
        if (image?.uri) {
            formData.append("thumbnail", {
                uri: image.uri,
                name: image.fileName || `thumbnail_${Date.now()}.jpg`,
                type: image.mimeType || 'image/jpeg',
            } as any);
        }

        // Add video file if selected (only for non-YouTube videos)
        if (type !== 'link' && selectedVideos?.uri) {
            formData.append('video', {
                uri: selectedVideos.uri,
                name: selectedVideos.fileName || `video_${Date.now()}.mp4`,
                type: selectedVideos.mimeType || 'video/mp4',
            } as any);
        }

        try {
            const result = await updateVideo({
                id: id,
                data: formData,
            }).unwrap();

            if (result.status) {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    textBody: result?.message,
                    autoClose: 2000,
                });
                setTimeout(() => {
                    router.back();
                }, 1000);
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: result?.message,
                    autoClose: 2000,
                });
            }
        } catch (err: any) {

            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: err.data?.message || JSON.stringify(err.data?.errors),
                autoClose: 2000,
            });
        }
    };

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

    return (
        <KeyboardAvoidingView style={tw`flex-1 bg-primary`} behavior="padding">
            <AlertNotificationRoot>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={tw`relative mt-5`}>
                        <View style={tw`flex-row justify-between items-center gap-5 px-5 mb-8`}>
                            <TouchableOpacity
                                style={tw`bg-primaryText w-13 h-13 p-4 rounded-full items-center justify-center border border-primaryGray`}
                                onPress={() => router.back()}
                            >
                                <SvgXml xml={IconBackLeft} />
                            </TouchableOpacity>
                            <Text style={tw`font-poppinsMedium text-xl`}>Edit video details</Text>
                            <View></View>
                        </View>
                    </View>

                    {/* Video Player */}
                    {isYoutubeVideo && youtubeVideoId ? (
                        <YoutubeIframe
                            height={250}
                            width={_Width}
                            videoId={youtubeVideoId}
                            play={true}
                            onChangeState={(event: any) => {
                                if (event === 'ended') {
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

                    <View style={tw`p-5`}>
                        {/* YouTube Link Input (for YouTube videos) */}
                        {type === 'link' ? (
                            <View style={tw`mb-4`}>
                                <Text style={tw`font-poppinsMedium text-base mb-2`}>YouTube Link</Text>
                                <TextInput
                                    style={tw`border border-primaryGray px-6 py-4 rounded-full`}
                                    placeholder="YouTube video URL"
                                    placeholderTextColor="gray"
                                    value={youtubeLink}
                                    onChangeText={setYoutubeLink}
                                />
                            </View>
                        ) : (
                            /* Replace Video Button (for uploaded videos) */
                            <TouchableOpacity
                                onPress={pickVideo}
                                style={tw`py-3 flex-row gap-4 w-4/7 items-center border border-[#3B97D3] px-6 rounded-full bg-primary mb-4`}
                            >
                                <SvgXml xml={IconReplece} />
                                <Text style={tw`font-poppins text-base text-[#3B97D3]`}>Replace video</Text>
                            </TouchableOpacity>
                        )}

                        {/* State */}
                        <View style={tw`pt-4`}>
                            <TouchableOpacity
                                onPress={() => setStateModalVisible(true)}
                                style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full `}
                            >
                                <Text style={tw`font-poppins text-base`}>{selectedState || states || 'Select State'}</Text>
                                <SvgXml xml={IconErowBack} />
                            </TouchableOpacity>
                        </View>

                        {/* City */}
                        <View style={tw`pt-4`}>
                            <TouchableOpacity
                                onPress={() => setCityModalVisible(true)}
                                style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full `}
                            >
                                <Text style={tw`font-poppins text-base`}>{selectedCity || city || 'Select City'}</Text>
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
                                    <Text style={tw`flex-1 justify-center items-center`}>loading...</Text>
                                ) : (
                                    <Text style={tw`font-poppins text-base`}>{selectedCategory || category?.name || 'Select Category'}</Text>
                                )}
                                <SvgXml xml={IconErowBack} />
                            </TouchableOpacity>
                        </View>

                        {/* Tags */}
                        <View style={tw`py-5 `}>
                            <View
                                style={tw`border border-gray-300 flex-col justify-center pl-7 relative rounded-3xl p-4`}
                            >
                                <Text style={tw`bg-primary w-14 font-poppins text-base absolute -top-2 left-7`}>Tags</Text>

                                <View style={tw`flex-row gap-3 flex-wrap`}>
                                    {tags.map((service, index) => (
                                        <View
                                            key={index}
                                            style={tw`gap-3 py-2 px-4 border flex-row justify-center items-center border-gray-300 rounded-full`}
                                        >
                                            <Text>{service}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveService(index)}>
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
                        <View style={tw`mt-5`}>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Video title"
                                placeholderTextColor="gray"
                                style={tw`border border-gray-300 font-poppins text-secondaryBlack text-base rounded-full px-4 py-3 mb-4`}
                            />
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                textAlignVertical="top"
                                placeholder="Video description"
                                placeholderTextColor="gray"
                                style={tw`border border-gray-300 font-poppins text-base text-secondaryBlack rounded-2xl px-4 py-3 h-52`}
                            />
                        </View>

                        {/* Thumbnail */}
                        <View style={tw`items-center`}>
                            {image ? (
                                <Image
                                    source={{ uri: image.uri }}
                                    style={tw`w-full h-48 rounded-md my-4 mx-5`}
                                />
                            ) : (
                                <Image
                                    source={{ uri: thumbnail }}
                                    style={tw`w-full h-48 rounded-md my-4 mx-5`}
                                />
                            )}
                        </View>

                        <TouchableOpacity
                            style={tw`py-3 flex-row gap-4 w-5/7 items-center border border-[#3B97D3] px-6 rounded-full bg-primary mb-4`}
                            onPress={pickImage}
                        >
                            <SvgXml xml={IconReplece} />
                            <Text style={tw`font-poppins text-base text-[#3B97D3]`}>
                                Select another image
                            </Text>
                        </TouchableOpacity>

                        {/* Visibility */}
                        <View style={tw`pt-5`}>
                            <TouchableOpacity
                                onPress={() => setVisibility(true)}
                                style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full `}
                            >
                                <Text style={tw`font-poppins text-base`}>{selectedVisibility || visibilityApi || 'Select Visibility'}</Text>
                                <SvgXml xml={IconErowBack} />
                            </TouchableOpacity>
                        </View>

                        {/* Save Button */}
                        <View style={tw`mt-6 mb-10`}>
                            <TouchableOpacity
                                style={tw`bg-[#FF5A5F] py-4 rounded-full`}
                                onPress={handleSaveChanges}
                            >
                                <Text style={tw`text-center text-white font-poppinsBold text-lg`}>Save changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


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
                                    <View style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}>
                                        <View></View>
                                        < Text style={tw`text-primary text-xl font-poppins`}> Select State </Text>
                                        < TouchableOpacity onPress={() => setStateModalVisible(false)}>
                                            <SvgXml xml={IconClose} />
                                        </TouchableOpacity>
                                    </View>

                                    {
                                        stateData?.data?.map((state: any) => (
                                            <TouchableOpacity
                                                key={state.id}
                                                onPress={() => {
                                                    setSelectedState(state.name);
                                                    setStateModalVisible(false);
                                                    setStateID(state.id);
                                                }}

                                                style={tw`py-4 border-b border-primaryGray`}
                                            >
                                                <Text style={tw`text-center font-poppins text-base`}> {state.name} </Text>
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
                                <View style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}>
                                    <View></View>
                                    <Text style={tw`text-primary text-xl font-poppins`}>Select City</Text>
                                    <TouchableOpacity onPress={() => setCityModalVisible(false)}>
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
                                            <Text style={tw`text-center font-poppins text-gray-500 py-4`}>
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
                                                    <Text style={tw`text-center font-poppins text-base`}>
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
                                <View style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}>
                                    <View></View>
                                    <Text style={tw`text-primary text-xl font-poppins`}>Select Category</Text>
                                    <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                                        <SvgXml xml={IconClose} />
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={categoryData}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedCategory(item?.name)
                                                setCategoryID(item?.id);
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
                                <View style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}>
                                    <View></View>
                                    <Text style={tw`text-primary text-xl font-poppins`}>Select Visibility</Text>
                                    <TouchableOpacity onPress={() => setVisibility(false)}>
                                        <SvgXml xml={IconClose} />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedVisibility('Everyone');
                                        setVisibility(false);
                                    }}
                                    style={tw`justify-center`}
                                >
                                    <View style={tw`bg-primary flex-col justify-center border border-dashed border-primaryGray py-4 items-center `}>
                                        <View style={tw`flex-row items-center justify-center gap-3`}>
                                            <SvgXml xml={IconWorld} />
                                            <Text style={tw`font-poppins text-base`}>Everyone</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedVisibility('Only me');
                                        setVisibility(false);
                                    }}
                                    style={tw`justify-center`}
                                >
                                    <View style={tw`bg-primary flex-col justify-center border border-dashed border-primaryGray py-4 items-center `}>
                                        <View style={tw`flex-row items-center justify-center gap-3`}>
                                            <SvgXml xml={IconLock} />
                                            <Text style={tw`font-poppins text-base`}>Only me</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </ScrollView>
            </AlertNotificationRoot>
        </KeyboardAvoidingView>
    );
};

export default EditVideoDetails;

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
});