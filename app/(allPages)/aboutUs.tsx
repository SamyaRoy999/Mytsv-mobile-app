import { IconAboutUsimge, IconbackRight } from '@/icons/Icon';
import tw from '@/lib/tailwind';
import { useAbout_usQuery } from '@/redux/apiSlices/Account/accountSlice';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const AboutUs = () => {
    const { data: about_us, isLoading, error } = useAbout_usQuery({})
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
                <Text>loading failed faqs data</Text>
            </View>
        );
    }


    return (
        <View style={tw`flex-1 bg-primary`}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`p-4`}>
                <TouchableOpacity style={tw``} onPress={() => router.back()}>
                    <SvgXml xml={IconbackRight} />
                </TouchableOpacity>

                {/* Top Logo and Image */}
                <View style={tw`items-center `}>
                    <SvgXml xml={IconAboutUsimge} />
                </View>

                {/* Title */}
                <Text style={tw`text-lg font-poppinsMedium text-center  mb-8 bg-primaryText py-4 rounded-full `}>About Us</Text>
                <Text style={tw`text-base text-center font-poppinsMedium  mb-6`}>
                    Welcome to mytsv.com – your destination for connection, creativity, and community.
                </Text>
                <Text style={tw`text-base text-center font-poppins  mb-6`}>
                    At MyTSV, we believe that powerful ideas deserve a platform. Whether you’re an individual looking to share your voice, a business seeking exposure, or a curious mind in search of new opportunities, we provide the digital space and tools to help you thrive.
                </Text>
                {/* Mission Section */}
                {/* {about_us?.data.} */}
                 <FlatList
                        data={about_us?.data}
                        keyExtractor={(item) => item.id.toString()}
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <View style={tw`border rounded-xl p-7 mb-4 border-primaryGray`}>
                            <View style={tw`flex-row items-center gap-3 `}>
                                <Image
                                      source={{ uri: item?.icon }}
                                    style={[
                                        tw`w-14 h-14 rounded-2xl relative`,
                                      
                                    ]}
                                />
                                <Text style={tw`text-xl font-poppinsMedium mb-2 `}>{item?.title}</Text>
                            </View>
                            <Text style={tw`text-base pt-5  font-poppins `}>
                                To empower individuals and businesses by offering a dynamic, user-focused platform for innovation, creativity, and meaningful collaboration.
                            </Text>
                        </View>
                        )}
                    />

            </ScrollView>
        </View>
    );
};

export default AboutUs;
