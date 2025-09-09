import Card from '@/components/landing_page/Card'
import { CarouselCard } from '@/components/landing_page/CarouselCard'
import HeaderBar from '@/components/shear/HeaderBar'
import { IconBackLeft } from '@/icons/Icon'
import tw from '@/lib/tailwind'
import { router } from 'expo-router'
import React from 'react'
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import data from "../../lib/data.json"

const restaurantCatering = () => {
    return (
        <View>
            <ScrollView showsVerticalScrollIndicator={false}>
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
                        Restaurant & Catering
                    </Text>
                    <View></View>
                </View>
                <CarouselCard />
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <Card data={item} />}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                />

            </ScrollView>
        </View >
    )
}

export default restaurantCatering