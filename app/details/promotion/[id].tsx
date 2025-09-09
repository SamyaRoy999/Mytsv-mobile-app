import Card from '@/components/landing_page/Card'
import HeaderBar from '@/components/shear/HeaderBar'
import { IconBackLeft } from '@/icons/Icon'
import tw from '@/lib/tailwind'
import { useAllPromotionalCatagoryQuery } from '@/redux/apiSlices/Promotion/promotionSlices'
import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'

const promotionVideo = () => {
    const { id } = useLocalSearchParams()
    const { data: allPromotedVideo, isLoading, error } = useAllPromotionalCatagoryQuery({ id })
    const categoryName = allPromotedVideo?.data?.category_name;
    const alldata = allPromotedVideo?.data?.videos?.data;

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
                <Text>Error loading Promoted post</Text>
            </View>
        );
    }

    if (!allPromotedVideo?.data) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <Text>Blog post not found</Text>
            </View>
        );
    }

    return (
        <View style={tw`flex-1 `}>
            <ScrollView  showsVerticalScrollIndicator={false}>
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
                        {categoryName}
                    </Text>
                    <View></View>
                </View>
                <FlatList
                    data={alldata}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <Card data={item} />}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                />

            </ScrollView>
        </View>
    )
}

export default promotionVideo