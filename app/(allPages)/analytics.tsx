import AnalyticsShear from '@/components/shear/AnalyticsShear'
import tw from '@/lib/tailwind'
import { useAnalyticsQuery } from '@/redux/apiSlices/Account/accountSlice'
import { useFocusEffect } from 'expo-router'
import React, { useCallback } from 'react'
import { Text, View } from 'react-native'

const Analytics = () => {

    const { data, isLoading, refetch } = useAnalyticsQuery({})
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

export default Analytics