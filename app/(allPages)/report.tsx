import HeaderBar from '@/components/shear/HeaderBar'
import { IconBackLeft, IconWornoing } from '@/icons/Icon'
import tw from '@/lib/tailwind'
import { useReportVideoQuery } from '@/redux/apiSlices/Account/accountSlice'
import { _HIGHT, _Width } from '@/utils/utils'
import { router } from 'expo-router'
import React from 'react'
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'

const report = () => {
    const { data: reportVideo, isLoading, error } = useReportVideoQuery({})
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
                <Text>Error loading TermsCond Data </Text>
            </View>
        );
    }

    // Check if there are no reports
    const hasReports = reportVideo?.data?.data && reportVideo.data.data.length > 0;

    return (
        <View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <HeaderBar />
                <View style={tw`relative`}>

                    <View style={tw`flex-row justify-between items-center gap-5 px-5 mb-8`}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <View
                                style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
                            >
                                <SvgXml xml={IconBackLeft} />
                            </View>
                        </TouchableOpacity>
                        <Text style={tw`font-poppinsMedium text-xl `}>
                            Reports
                        </Text>
                        <View></View>
                    </View>
                </View>
                
                {hasReports ? (
                    <View style={tw`px-2 mx-5`}>
                        {/* History  */}
                        <FlatList
                            data={reportVideo?.data?.data}
                            keyExtractor={(item) => item.id.toString()}
                            showsHorizontalScrollIndicator={false}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => router.push({
                                    pathname: "/details/Report/[id]",
                                    params: { id: item.video_id },
                                })} style={[tw` mr-4 flex-row gap-3 pb-5`, { width: _Width * 0.4 }]}>
                                    <Image
                                        style={[
                                            tw`rounded-xl`,
                                            { width: _Width * 0.42, height: _HIGHT * 0.13 },
                                        ]}
                                        source={{ uri: item?.video?.thumbnail }}
                                    />
                                    <View >
                                        <View style={tw`flex-row items-center gap-2`}>
                                            <SvgXml xml={IconWornoing} />
                                            <Text
                                                style={[tw`text-base font-poppinsMedium py-1 text-secondaryBlack`, {
                                                    width: _Width * 0.39,
                                                }]}
                                            >
                                                {item?.video?.title?.split(" ").slice(0, 4).join(" ")}
                                            </Text>
                                        </View>
                                        <Text
                                            style={tw`text-base font-poppinsMedium py-1 text-secondary `}
                                        >
                                            MyTSV deleted your video.
                                        </Text>

                                        <Text style={tw`text-sm font-poppins  text-secondaryBlack `}>
                                            Tap to see details
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                ) : (
                    // Show this message when there are no reports
                    <View style={tw`flex-1 justify-center items-center mt-20`}>
                        <SvgXml xml={IconWornoing} width={60} height={60} />
                        <Text style={tw`text-lg font-poppinsMedium text-center mt-4 text-gray-600`}>
                            No reports found
                        </Text>
                        <Text style={tw`text-base font-poppins text-center mt-2 text-gray-500 px-10`}>
                            You don't have any reports at the moment.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

export default report