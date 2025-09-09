import HeaderBar from '@/components/shear/HeaderBar';
import {
    IconBackLeft,
    IconCansel,
    IconCanselModal,
    IconDelete,
    IconPouse,
    IconSearchBlack,
    IconSettingDot
} from '@/icons/Icon';
import tw from '@/lib/tailwind';
import { useAll_delete_watch_historyMutation, useHistoryVideoDeleteMutation, useLazyHistoryVideoQuery, usePause_play_watchMutation, useProfileQuery } from '@/redux/apiSlices/Account/accountSlice';
import { _HIGHT, _Width } from '@/utils/utils';
import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { ScrollView } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';

const HistoryScreen = () => {
    const [page, setPage] = useState(1);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [playPause, setPlayPause] = useState(false);
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [fetchHistory, { isLoading, isFetching }] = useLazyHistoryVideoQuery();
    const [historyVideoDelete] = useHistoryVideoDeleteMutation();
    const [all_delete_watch_history] = useAll_delete_watch_historyMutation()
    const [pause_play_watch] = usePause_play_watchMutation()
    const { data: userInfo, isLoading: userLoading } = useProfileQuery({})
 
    const loadHistory = useCallback(async (pageNum = page, searchText = searchQuery) => {
        if (loadingMore || isFetching) return;
        setLoadingMore(true);
        try {
            const params: any = { page: pageNum, per_page: 5 };
            if (searchText) {
                params.search = searchText;
            }
            
            const res = await fetchHistory(params).unwrap();
            if (res?.status && res?.data?.data) {
                if (pageNum === 1) {
                    setHistory(res.data.data);
                } else {
                    setHistory(prev => {
                        const newItems = res.data.data.filter((newItem: any) =>
                            !prev.some(item => item.id === newItem.id)
                        );
                        return [...prev, ...newItems];
                    });
                }
                setPage(pageNum + 1);
            }
        } catch (e) {
        } finally {
            setLoadingMore(false);
        }
    }, [page, searchQuery, fetchHistory, isFetching]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadHistory(1, searchQuery);
        } catch (err) {
            
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (history.length === 0) {
            loadHistory(1, searchQuery);
        }
    }, []);

    // Search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== searchQuery) {
                setSearchQuery(search);
                setPage(1);
                setHistory([]);
                loadHistory(1, search);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleSearchChange = (text: string) => {
        setSearch(text);
    };

    const handleSearchSubmit = () => {
        setSearchQuery(search);
        setPage(1);
        setHistory([]);
        loadHistory(1, search);
    };

    // Clear all history
    const handleClearAllHistory = async () => {
        try {
            const res = await all_delete_watch_history({}).unwrap();

            if (res?.status) {
                setHistory([]);
                setPage(1);
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "Success",
                    textBody: res.message || "All history cleared successfully",
                    autoClose: 2000,
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: "Error",
                    textBody: res?.message || "Failed to clear history",
                    autoClose: 2000,
                });
            }
        } catch (err) {
          
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Error",
                textBody: "Failed to clear history",
                autoClose: 2000,
            });
        }
    };

    // Delete single video
    const handleDeleteVideo = async (id: any) => {
        try {
            const res = await historyVideoDelete(id).unwrap();

            if (res?.status) {
                setHistory(prev => prev.filter(item => item.id !== id));
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "Success",
                    textBody: res.message,
                    autoClose: 2000,
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: "Error",
                    textBody: res?.message || "Something went wrong!",
                    autoClose: 2000,
                });
            }
        } catch (err) {
           
        }
    };

    const handle_pause_play_watch = async () => {
        try {
            const res = await pause_play_watch({}).unwrap();
            setPlayPause(res?.pause_watch_history);
            if (res?.status) {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "Success",
                    textBody: res.message,
                    autoClose: 2000,
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: "Error",
                    textBody: res?.message || "Something went wrong!",
                    autoClose: 2000,
                });
            }
        } catch (err) {
          
        }
    };

    const renderItem = ({ item }: any) => {
        const video = item?.video;
        if (!video) return null;

        return (
            <TouchableOpacity onPress={() => router.push(`/details/video/${video?.id}`)}>
                <View style={[tw`flex-row gap-4 mb-6`, { width: '100%' }]}>
                    <Image
                        style={[tw`rounded-xl`, { width: _Width * 0.35, height: _HIGHT * 0.1 }]}
                        source={{ uri: video.thumbnail }}
                    />
                    <View style={tw`flex-1 justify-between`}>
                        <Text style={tw`text-base font-poppinsMedium text-secondaryBlack`}>
                            {video.title?.split(" ").slice(0, 5).join(" ")}...
                        </Text>
                        <View style={tw`flex-row justify-between items-center`}>
                            <Text style={tw`text-sm font-poppins text-secondaryBlack`}>
                                {video.views_count} views
                            </Text>
                            <TouchableOpacity onPress={() => handleDeleteVideo(item.id)}>
                                <SvgXml xml={IconCansel} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView style={tw`flex-1 bg-white`} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <HeaderBar />
                {/* Top Bar */}
                <View style={tw`flex-row justify-between items-center gap-5 px-5 mb-6`}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={tw`bg-primaryText w-13 h-13 p-4 rounded-full border border-primaryGray`}
                    >
                        <SvgXml xml={IconBackLeft} />
                    </TouchableOpacity>
                    <Text style={tw`font-poppinsMedium text-xl`}>History</Text>
                    <TouchableOpacity
                        onPress={() => setSettingsVisible(!settingsVisible)}
                        style={tw`bg-primaryText w-13 h-13 flex-row items-center justify-center p-4 rounded-full border border-primaryGray`}
                    >
                        <SvgXml xml={settingsVisible ? IconCanselModal : IconSettingDot} />
                    </TouchableOpacity>
                </View>

                {/* Settings Modal */}
                {settingsVisible && (
                    <View style={tw`absolute bg-primaryText p-6 right-5 w-72 top-40 z-20 shadow-lg rounded-lg`}>
                        <TouchableOpacity
                            onPress={handleClearAllHistory}
                            style={tw`flex-row items-start gap-3 pb-3`}
                        >
                            <SvgXml xml={IconDelete} />
                            <Text style={tw`font-poppinsMedium text-base`}>Clear all history</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handle_pause_play_watch} style={tw`flex-row items-start gap-3 pt-3`}>
                            {
                                userInfo?.data?.pause_watch_history ?  <SvgXml xml={ IconPouse} /> : <AntDesign name="caretright" size={24} color="black" />
                            }
                            <Text style={tw`font-poppinsMedium text-base`}>
                                {userInfo?.data?.pause_watch_history ? 'Resume watch history' : 'Pause watch history'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Search Box */}
                <View style={tw`px-6 mb-3`}>
                    <View style={tw`border border-primaryGray flex-row items-center bg-primaryText px-4 rounded-full`}>
                        <SvgXml xml={IconSearchBlack} />
                        <TextInput
                            style={tw`flex-1 font-poppins text-base px-4 h-14`}
                            placeholder="Search watch history"
                            value={search}
                            onChangeText={handleSearchChange}
                            onSubmitEditing={handleSearchSubmit}
                            returnKeyType="search"
                        />
                    </View>
                </View>

                {/* History List */}
                {isLoading && page === 1 ? (
                    <ActivityIndicator color="#ED6237" style={tw`my-4`} />
                ) : history.length === 0 ? (
                    <View style={tw`flex-1 justify-center items-center mt-10`}>
                        <Text style={tw`font-poppins text-lg`}>
                            {searchQuery ? 'No results found' : 'No watch history found'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={history}
                        keyExtractor={(item: any, index) => item?.id?.toString() || index.toString()}
                        renderItem={renderItem}
                        scrollEnabled={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={["#0000ff"]}
                            />
                        }
                        onEndReached={() => {
                            if (history.length >= 5 && !loadingMore) {
                                loadHistory();
                            }
                        }}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            loadingMore ? <ActivityIndicator color="#0000ff" style={tw`my-4`} /> : null
                        }
                        contentContainerStyle={tw`px-6 pb-6`}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default HistoryScreen;