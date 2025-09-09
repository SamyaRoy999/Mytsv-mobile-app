
import HeaderBar from '@/components/shear/HeaderBar'
import { IconBackLeft, IconClose, IconSend, IconWorning } from '@/icons/Icon'
import tw from '@/lib/tailwind'
import { useAppealPostMutation, useReportDetailQuery } from '@/redux/apiSlices/Account/accountSlice'
import { _HIGHT } from '@/utils/utils'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useLocalSearchParams } from 'expo-router/build/hooks'
import React, { useState } from 'react'
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification"
import { SvgXml } from 'react-native-svg'

const ReportDetails = () => {
    const { id } = useLocalSearchParams();
    const [descriptionVisible, setDescriptionVisible] = useState(false);
    const [appealVisible, setAppealVisible] = useState(false)
    const [appeal, setAppeal] = useState({
        subject: "",
        explanation: "",
        report_id: null, // optional initial
    });

    // ................... API CALL .................//

    const { data: singleVideo, isLoading, error } = useReportDetailQuery({ id });

    const createdAt = singleVideo?.data?.video?.created_at;
    const dateObj = createdAt ? new Date(createdAt) : null;
    const year = dateObj ? dateObj.getFullYear() : '';
    const month = dateObj
        ? dateObj.toLocaleString('default', { month: 'short' })
        : '';
    const day = dateObj ? dateObj.getDate().toString().padStart(2, '0') : '';
    const [appealPost] = useAppealPostMutation()

    React.useEffect(() => {
        if (singleVideo?.data?.id) {
            setAppeal((prev) => ({
                ...prev,
                report_id: singleVideo.data.id,
            }));
        }
    }, [singleVideo]);

    const submitMytsv = async () => {
      
        try {
            const res = await appealPost(appeal).unwrap();
           
            if (res.status) {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    textBody: res?.message,
                    autoClose: 2000,
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Waring',
                    textBody: res?.message?.email?.[0] || "Something went wrong!",
                    autoClose: 2000,
                });
            }

        } catch (error: any) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Waring',
                textBody: error?.message,
            });
        }
    }

    if (isLoading) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-primary`}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={tw`flex-1  bg-primary`}>
            <AlertNotificationRoot>
                {singleVideo && (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={[tw`flex-col  justify-between`, {
                            height: _HIGHT * 0.9,
                        }]}>
                            <View>
                                <HeaderBar />
                                <View style={tw`flex-row justify-between items-center gap-5 px-5 mb-8`}>
                                    <TouchableOpacity onPress={() => router.back()}>
                                        <View
                                            style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
                                        >
                                            <SvgXml xml={IconBackLeft} />
                                        </View>
                                    </TouchableOpacity>
                                    <Text style={tw`font-poppinsMedium text-xl `}>
                                        Report details
                                    </Text>
                                    <View></View>
                                </View>
                                <View>
                                    {/* Video Player */}
                                    <Image
                                        source={singleVideo.data?.video?.thumbnail}
                                        style={tw`w-full h-48`}

                                    />
                                    {/* Video Info */}
                                    <View style={tw`p-5`}>
                                        <Text style={tw`font-poppinsMedium text-xl `}>
                                            {singleVideo.data?.video?.title}
                                        </Text>
                                        <View style={tw`flex-row items-center gap-2`}>
                                            <Text style={tw`font-poppins text-sm text-primaryGrayDeep py-2`}>
                                                {singleVideo.views} views · {singleVideo.time}
                                            </Text>
                                            <TouchableOpacity style={tw`border border-primaryGray  p-2 rounded-full`} onPress={() => setDescriptionVisible(true)}>
                                                <Text style={tw``}>...more</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                <View style={tw`border border-primaryGray p-3 mx-4 mb-12 flex-row items-center gap-4 rounded-lg px-8`}>
                                    <SvgXml xml={IconWorning} />
                                    <View>
                                        <Text style={tw`text-xl font-poppinsSemiBold text-secondary`}>MyTSV deleted your video.</Text>
                                        <Text style={tw`text-lg font-poppins`}>Reason: {singleVideo.data?.reason}</Text>
                                        <Text style={tw`font-poppins  text-base`}>
                                            This video will no longer available.
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Register Button */}
                            <View style={tw`px-5 mb-10`}>
                                <TouchableOpacity
                                    onPress={() => setAppealVisible(true)}
                                    style={tw`flex-row items-center gap-2 py-4 bg-secondary px-4  mt-14 rounded-full justify-center`}
                                >
                                    <Text style={tw`text-primaryText text-lg font-poppinsMedium`}>
                                        Appeal to MyTSV
                                    </Text>

                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* more Description */}
                        <Modal
                            visible={descriptionVisible}
                            transparent={true}
                            animationType="slide"
                            onRequestClose={() => setDescriptionVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={tw`bg-white w-full absolute bottom-0 rounded-t-3xl overflow-hidden`}>
                                    {/* Header */}
                                    <View style={tw`bg-red-500 py-4 px-6 flex-row justify-between items-center`}>
                                        <View></View>
                                        <Text style={tw`text-white text-xl font-poppinsMedium`}>Description</Text>
                                        <TouchableOpacity onPress={() => setDescriptionVisible(false)}>
                                            <SvgXml xml={IconClose} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Content */}
                                    <ScrollView contentContainerStyle={tw`p-6`}>
                                        <Text style={tw`text-lg font-poppinsMedium py-8`}>
                                            {singleVideo.data?.video?.title}
                                        </Text>

                                        {/* Stats row */}
                                        <View style={tw`flex-row justify-between mb-6`}>
                                            <View style={tw`items-center`}>
                                                <Text style={tw` font-poppinsSemiBold  text-3xl`}>{singleVideo.data?.video?.likes_count}</Text>
                                                <Text style={tw`text-base font-poppins text-gray-600`}>Likes</Text>
                                            </View>
                                            <View style={tw`items-center`}>
                                                <Text style={tw`font-poppinsSemiBold  text-3xl`}>{singleVideo.data?.video?.views_count}</Text>
                                                <Text style={tw`text-base font-poppins text-gray-600`}>Views</Text>
                                            </View>
                                            <View style={tw`items-center`}>
                                                <Text style={tw`font-poppinsSemiBold text-3xl`}>{year}</Text>
                                                <Text style={tw`text-base font-poppins text-gray-600`}>
                                                    {month} {day}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text style={tw`font-poppins text-base text-black leading-6 `}>
                                            Lorem ipsum dolor sit amet consectetur. Fermentum vitae nisi donec
                                            lacus morbi pharetra sed in. In ultrices nunc mi amet vulputate.
                                            Interdum varius tellus tempus placerat et commodo pellentesque...
                                        </Text>
                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>
                        {/* Appeal Visible */}
                        <Modal
                            visible={appealVisible}
                            transparent={true}
                            animationType="slide"
                            onRequestClose={() => setAppealVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={tw`bg-white w-full absolute bottom-0 rounded-t-3xl overflow-hidden`}>
                                    {/* Header */}
                                    <View style={tw`bg-red-500 py-4 px-6 flex-row justify-between items-center`}>
                                        <View></View>
                                        <Text style={tw`text-white text-xl font-poppinsMedium`}>Appeal to MyTSV</Text>
                                        <TouchableOpacity onPress={() => setAppealVisible(false)}>
                                            <SvgXml xml={IconClose} />
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView contentContainerStyle={tw`p-6`}>
                                        <View style={tw`flex-col gap-6 mt-9`}>

                                            {/* Subject */}
                                            <View style={tw`relative`}>
                                                <View style={tw`bg-primaryText absolute px-4 flex-row justify-center items-center left-7 font-poppins text-base -top-2 z-10`}>
                                                    <Text style={tw`font-poppins text-base`}>* Subject</Text>
                                                </View>
                                                <TextInput
                                                    style={tw`border border-primaryGray rounded-full font-poppins text-base px-5 h-16`}
                                                    value={appeal.subject}
                                                    onChangeText={(text) => setAppeal({ ...appeal, subject: text })}
                                                />
                                            </View>

                                            {/* Your Message */}
                                            <View style={tw`relative`}>
                                                <View style={tw`bg-primaryText absolute px-4 flex-row justify-center items-center left-7 font-poppins text-base -top-2 z-10`}>
                                                    <Text style={tw`font-poppins text-base`}>* Your message</Text>
                                                </View>
                                                <TextInput
                                                    value={appeal.explanation}
                                                    
                                                    onChangeText={(text) => setAppeal({ ...appeal, explanation: text })}
                                                    style={tw`border border-primaryGray rounded-xl font-poppins text-base px-5 h-40`}
                                                    multiline
                                                />
                                            </View>
                                        </View>

                                        {/* Send Button */}
                                        <TouchableOpacity
                                            style={tw`flex-row items-center gap-2 py-5 bg-secondary px-4 mt-14 rounded-full justify-center`}
                                            onPress={() => submitMytsv()}
                                        >
                                            <Text style={tw`text-primaryText text-base font-poppinsBold`}>
                                                Send message
                                            </Text>
                                            <SvgXml xml={IconSend} />
                                        </TouchableOpacity>

                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>
                    </ScrollView>
                )
                }
            </AlertNotificationRoot>
        </View >
    )
}

export default ReportDetails
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",

    }
})