import AnalyticsShear from '@/components/shear/AnalyticsShear'
import tw from '@/lib/tailwind'
import { useVideoAnalyticsQuery } from '@/redux/apiSlices/Account/accountSlice'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import React, { useCallback } from 'react'
import { Text, View } from 'react-native'

const videoAnalytics = () => {
    const { id } = useLocalSearchParams();

    // .................Get current month and year.................//

    const currentDate = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = months[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear().toString();

    const { data, isLoading, refetch } = useVideoAnalyticsQuery({
        id: id,
        month: currentMonth,
        year: currentYear
    } as any);

    useFocusEffect(
        useCallback(() => {
            refetch()
        }, [refetch])
    )

    if (isLoading) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={tw`flex-1 bg-white`}>
            <AnalyticsShear analytics={data} />
        </View>
    )
}

export default videoAnalytics