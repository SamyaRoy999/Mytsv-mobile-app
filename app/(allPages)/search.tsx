import { IconBackLeft, IconClose, IconErowBack, IconTime } from "@/icons/Icon";
import tw from "@/lib/tailwind";
import { useLazyGlobalSearchQuery } from "@/redux/apiSlices/globalSearch/globalSearchSlice";
import {
  useCategoriesQuery,
  useCityGetQuery,
  useStateGetQuery,
} from "@/redux/apiSlices/UploadVideo/uploadVideoSices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { SvgXml } from "react-native-svg";

// AsyncStorage keys
const SEARCH_HISTORY_KEY = "search_history";
const LOCATION_HISTORY_KEY = "location_history";

const Search = () => {
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [stateID, setStateID] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [formData, setFormData] = useState({
    state: "",
    city: "",
    category: "",
    category_id: "",
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [locationHistory, setLocationHistory] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const { data: categories, isLoading: isLoadingCategories } =
    useCategoriesQuery({});
  const { data: stateData, isLoading: isStateLoading } = useStateGetQuery({});
  const { data: cityData, isLoading: isCityLoading } = useCityGetQuery(stateID);
  const [triggerGlobalSearch, { data: searchResults, isLoading: isSearching }] =
    useLazyGlobalSearchQuery();

  const categoryData = categories?.data?.data;

  // Load search history on component mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoadingHistory(true);
        await Promise.all([loadSearchHistory(), loadLocationHistory()]);
      } catch (error) {
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  // .........Load search history from AsyncStorage.........//
  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {}
  };
  // ......Load location history from AsyncStorage....../
  const loadLocationHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(LOCATION_HISTORY_KEY);
      if (history) {
        setLocationHistory(JSON.parse(history));
      }
    } catch (error) {}
  };

  // Save search term to history
  const saveToSearchHistory = async (term: string) => {
    try {
      // Remove if already exists
      const updatedHistory = [
        term,
        ...searchHistory.filter((item) => item !== term),
      ].slice(0, 10); // Keep only last 10 items

      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );
    } catch (error) {}
  };

  // Save location to history
  const saveToLocationHistory = async (location: string) => {
    try {
      // Remove if already exists
      const updatedHistory = [
        location,
        ...locationHistory.filter((item) => item !== location),
      ].slice(0, 10); // Keep only last 10 items

      setLocationHistory(updatedHistory);
      await AsyncStorage.setItem(
        LOCATION_HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );
    } catch (error) {}
  };

  // Update form data
  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Save to history if it's a category or location
    if (field === "category") {
      saveToSearchHistory(value);
    } else if (field === "city" || field === "state") {
      saveToLocationHistory(value);
    }
  };

  const handleSearch = async () => {
    try {
      const result = await triggerGlobalSearch({
        city: formData.city,
        state: formData.state,
        service: formData.category_id,
        search: hashtag, // Changed from 'hashtag' to 'search' to match API
      });

      if (result.data?.status) {
        // Navigate to search results with the data
        router.push({
          pathname: "../details/search/[results]",
          params: {
            results: JSON.stringify(result.data),
            searchTerm: hashtag,
            location: formData.city || formData.state,
          },
        });
      } else {
        alert("No results found");
      }
    } catch (error) {
      alert("Search failed. Please try again.");
    }
  };
  // Render search history items
  const renderSearchHistory = () => {
    if (isLoadingHistory) {
      return (
        <ActivityIndicator size="small" color="#0000ff" style={tw`py-4`} />
      );
    }

    if (searchHistory.length === 0) {
      return (
        <Text style={tw`text-center text-gray-500 py-4`}>
          No search history yet
        </Text>
      );
    }
    return (
      <View style={tw`flex-row flex-wrap gap-2 px-5`}>
        {searchHistory.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => updateFormData("category", item)}
            style={tw`py-2 px-4 border justify-center border-primaryGray rounded-full`}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  //.... Render location history items .....//

  const renderLocationHistory = () => {
    if (isLoadingHistory) {
      return (
        <ActivityIndicator size="small" color="#0000ff" style={tw`py-4`} />
      );
    }

    if (locationHistory.length === 0) {
      return (
        <Text style={tw`text-center text-gray-500 py-4`}>
          No location history yet
        </Text>
      );
    }

    return (
      <View style={tw`flex-row flex-wrap gap-2 px-5`}>
        {locationHistory.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              // Determine if it's a state or city and update accordingly
              if (stateData?.data?.some((state: any) => state.name === item)) {
                updateFormData("state", item);
              } else if (
                cityData?.data?.some((city: any) => city.name === item)
              ) {
                updateFormData("city", item);
              }
            }}
            style={tw`py-2 px-4 border justify-center border-primaryGray rounded-full`}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={tw`pt-5 flex-1 bg-primary`}>
      <View style={tw`flex-row items-center justify-between gap-5 px-5 mb-8`}>
        <TouchableOpacity onPress={() => router.back()}>
          <View
            style={tw`bg-primaryText w-13 h-13 p-4 rounded-full flex-row items-center justify-center border border-primaryGray`}
          >
            <SvgXml xml={IconBackLeft} />
          </View>
        </TouchableOpacity>
        <Text style={tw`font-poppinsMedium text-xl`}>Search</Text>
        <View></View>
      </View>

      <View>
        {/* Hashtag Search */}
        <View
          style={tw`mt-4 mx-5 flex-row items-center justify-between border border-primaryGray rounded-full`}
        >
          <TextInput
            placeholder="Search by title or hashtag (e.g. Book Name, #good)"
            style={tw`flex-1 px-4 py-3 text-secondarygray`}
            value={hashtag}
            onChangeText={(text) => {
              setHashtag(text);
            }}
          />
        </View>
        {/* State Selection */}
        <View style={tw`pt-4 px-5`}>
          <TouchableOpacity
            onPress={() => setStateModalVisible(true)}
            style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full`}
          >
            <Text style={tw`font-poppins text-base`}>
              {formData.state || "State"}
            </Text>
            <SvgXml xml={IconErowBack} />
          </TouchableOpacity>
        </View>

        {/* City Selection */}
        <View style={tw`pt-4 px-5`}>
          <TouchableOpacity
            onPress={() => setCityModalVisible(true)}
            disabled={!formData.state} // Disable if no state selected
            style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full ${
              !formData.state ? "opacity-50" : ""
            }`}
          >
            <Text style={tw`font-poppins text-base`}>
              {formData.city || "City"}
            </Text>
            <SvgXml xml={IconErowBack} />
          </TouchableOpacity>
        </View>

        {/* Category Selection */}
        <View style={tw`pt-4 px-5`}>
          <TouchableOpacity
            onPress={() => setCategoryModalVisible(true)}
            style={tw`flex-row items-center justify-between border border-primaryGray px-6 py-3 rounded-full`}
          >
            <Text style={tw`font-poppins text-base`}>
              {formData.category || "Category"}
            </Text>
            <SvgXml xml={IconErowBack} />
          </TouchableOpacity>
        </View>
      </View>

      {/* History Section */}
      <View style={tw`flex-row w-full justify-between items-center px-5 py-6`}>
        <View style={tw`flex-row gap-3 items-center`}>
          <SvgXml xml={IconTime} />
          <Text style={tw`font-poppinsMedium text-base text-secondaryBlack`}>
            History
          </Text>
        </View>
        <Text style={tw`font-poppinsMedium text-base`}>Service</Text>
      </View>

      {/* Service History */}
      {renderSearchHistory()}

      <Text style={tw`px-5 py-6 text-right font-poppinsMedium text-base`}>
        Location
      </Text>

      {/* Location History */}
      {renderLocationHistory()}

      {/* Search Button */}
      <TouchableOpacity
        style={tw`bg-secondary rounded-full mx-6 mt-8 ${
          isSearching ? "opacity-50" : ""
        }`}
        onPress={handleSearch}
        disabled={isSearching}
      >
        <Text
          style={tw`text-primary text-center text-lg py-[14px] font-poppinsBold`}
        >
          {isSearching ? "Searching..." : "Search"}
        </Text>
      </TouchableOpacity>

      {/* State Selection Modal */}
      <Modal
        visible={stateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setStateModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={tw`bg-primary rounded-t-3xl w-full max-h-3/4`}>
            <View
              style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
            >
              <View></View>
              <Text style={tw`text-primary text-xl font-poppins`}>
                Select State
              </Text>
              <TouchableOpacity onPress={() => setStateModalVisible(false)}>
                <SvgXml xml={IconClose} />
              </TouchableOpacity>
            </View>
            <View style={tw`max-h-64`}>
              <ScrollView
                showsVerticalScrollIndicator={true}
                contentContainerStyle={tw`pb-4`}
              >
                {isStateLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#0000ff"
                    style={tw`py-4`}
                  />
                ) : stateData?.data?.length === 0 ? (
                  <Text style={tw`text-center font-poppins text-gray-500 py-4`}>
                    No states available
                  </Text>
                ) : (
                  stateData?.data?.map((state: any) => (
                    <TouchableOpacity
                      key={state.id}
                      onPress={() => {
                        updateFormData("state", state.name);
                        setStateID(state.id);
                        setStateModalVisible(false);
                      }}
                      style={tw`py-4 border-b border-primaryGray`}
                    >
                      <Text style={tw`text-center font-poppins text-base`}>
                        {state.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* City Selection Modal */}

      <Modal
        visible={cityModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCityModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={tw`bg-primary rounded-t-3xl w-full max-h-3/4`}>
            <View
              style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
            >
              <View></View>
              <Text style={tw`text-primary text-xl font-poppins`}>
                Select City
              </Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <SvgXml xml={IconClose} />
              </TouchableOpacity>
            </View>

            <View style={tw`max-h-64`}>
              <ScrollView
                showsVerticalScrollIndicator={true}
                contentContainerStyle={tw`pb-4`}
              >
                {isCityLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#0000ff"
                    style={tw`py-4`}
                  />
                ) : cityData?.data?.length === 0 ? (
                  <Text style={tw`text-center font-poppins text-gray-500 py-4`}>
                    {stateID
                      ? "No cities available for this state"
                      : "Please select a state first"}
                  </Text>
                ) : (
                  cityData?.data?.map((city: any) => (
                    <TouchableOpacity
                      key={city.id}
                      onPress={() => {
                        updateFormData("city", city.name);
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

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={tw`bg-primary rounded-t-3xl w-full max-h-3/4`}>
            <View
              style={tw`bg-secondary w-full h-16 rounded-t-3xl flex-row items-center justify-between px-4`}
            >
              <View></View>
              <Text style={tw`text-primary text-xl font-poppins`}>
                Select Category
              </Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <SvgXml xml={IconClose} />
              </TouchableOpacity>
            </View>
            <View style={tw`max-h-64`}>
              <ScrollView
                showsVerticalScrollIndicator={true}
                contentContainerStyle={tw`pb-4`}
              >
                {isLoadingCategories ? (
                  <ActivityIndicator
                    size="small"
                    color="#0000ff"
                    style={tw`py-4`}
                  />
                ) : categoryData?.length === 0 ? (
                  <Text style={tw`text-center font-poppins text-gray-500 py-4`}>
                    No categories available
                  </Text>
                ) : (
                  categoryData?.map((category: any) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => {
                        updateFormData("category", category.name);
                        updateFormData("category_id", category.id);
                        setCategoryModalVisible(false);
                      }}
                      style={tw`py-4 border-b border-primaryGray`}
                    >
                      <Text style={tw`text-center font-poppins text-base`}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Search;
