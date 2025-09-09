import HeaderBar from "@/components/shear/HeaderBar";
import { IconbackRight, IconFAQSection } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { useFaqsQuery } from "@/redux/apiSlices/Account/accountSlice";
import { _Width } from "@/utils/utils";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { LayoutAnimation, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";

const FaqSection = () => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First one open

    const toggleExpand = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(index === expandedIndex ? null : index);
    };

    // ............ api cal faq............//
    const { data: faqs, isLoading, error } = useFaqsQuery({})
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
        <View style={tw`bg-primary`}>
            <ScrollView contentContainerStyle={tw`p-4`} showsVerticalScrollIndicator={false}>
                <HeaderBar />
                <TouchableOpacity style={tw``} onPress={() => router.back()}>
                    <SvgXml xml={IconbackRight} />
                </TouchableOpacity>
                {/* Top Logo and Image */}
                <View style={tw`items-center `}>
                    <SvgXml xml={IconFAQSection} />
                </View>
                {/* Title */}
                <Text style={tw`text-lg font-poppinsMedium text-center  mb-8 bg-primaryText py-4 rounded-full`}>Frequently Asked Questions (FAQ)</Text>

                {faqs?.data.map((item: any) => (
                    <View
                        key={item?.id}
                        style={tw`mb-3  rounded-xl overflow-hidden border border-gray-200`}
                    >
                        <TouchableOpacity
                            onPress={() => toggleExpand(item?.id)}
                            style={tw`flex-row justify-between items-center px-4 py-4 rounded-2xl bg-primaryText`}
                        >
                            <Text style={[tw`text-lg font-poppinsMedium `, {
                                width: _Width * 0.78
                            }]}>{item?.question}</Text>
                            <AntDesign
                                name={expandedIndex === item?.id ? "up" : "down"}
                                size={18}
                                color="#555"
                            />
                        </TouchableOpacity>
                        {expandedIndex === item.id && (
                            <View style={tw`px-4 pb-4`}>
                                <Text style={tw`text-base font-poppins p-2`}>{item?.answer}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default FaqSection;
