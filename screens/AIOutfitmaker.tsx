import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
  } from "react-native";
  import React, { useState } from "react";
  import { Ionicons } from "@expo/vector-icons";
  import { useNavigation } from "@react-navigation/native";
  import axios from "axios";
  import Modal from "react-native-modal";
  import env from "../config/env";
  
  const AIOutfitmaker = () => {
    const [query, setQuery] = useState("");
    const [extraPrompt, setExtraPrompt] = useState("");
    const [occasion, setOccasion] = useState("none");
    const [outfits, setOutfits] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();
    const occasions = [
      { label: "Select Occasion", value: "none" },
      { label: "Date", value: "date" },
      { label: "Coffee", value: "coffee" },
      { label: "Interview", value: "interview" },
      { label: "Party", value: "party" },
      { label: "Beach", value: "beach" },
    ];
  
    const handleSearch = async () => {
      console.log("🔥 HANDLE SEARCH CALLED!"); // Debug log
      if (!query.trim() && !extraPrompt.trim() && occasion == "none") {
        setError("please enter a query or select a occasion");
        return;
      }
      setLoading(true);
      setError("");
      try {
        let searchQuery = query.trim() || extraPrompt.trim();
        if (!searchQuery.toLowerCase().includes(occasion) && occasion == "none") {
          searchQuery = `${occasion} ${searchQuery}`.trim();
        }
  
        console.log("Data",searchQuery);
  
        const response = await axios.get(
          `${env.API_BASE_URL}/smart-search?query=${encodeURIComponent(
            searchQuery
          )}`
        );
        
  
        setOutfits(response.data);
      } catch (error) {
        console.log("Error fetching outfits", error);
        setError("Failed to fetch outfits, please try again");
      } finally {
        setLoading(false);
      }
    };
  
    const selectOccasion = (value:string) => {
      console.log("🔥 SELECT OCCASION CALLED:", value); // Debug log
      setOccasion(value);
      setModalVisible(false);
    };
  
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-4 py-2">
          <TouchableOpacity 
            onPress={() => {
              console.log("🔥 BACK BUTTON PRESSED!"); // Debug log
              navigation.goBack();
            }}
            style={{ padding: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" color={"black"} size={24} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold flex-1 text-center mr-6">
            Outfit Suggestions
          </Text>
        </View>
  
        <ScrollView>
          <View className="items-center mt-4">
            <View className="relative">
              <Image
                source={{
                  uri: "https://images.pexels.com/photos/19501169/pexels-photo-19501169.jpeg",
                }}
                className="w-24 h-24 rounded-full"
              />
              <View className="absolute -top-5 left-16 bg-white border border-gray-200 rounded-lg px-2 py-1">
                <Text className="text-xs">I'm your personal AI stylist</Text>
              </View>
            </View>
            <Text className="text-lg font-semibold mt-3">Eli</Text>
            <Text className="text-gray-500 mt-1">Minimal • Timeless</Text>
            <TouchableOpacity 
              style={{
                marginTop: 8,
                backgroundColor: '#e5e5e5',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}
              onPress={() => console.log("🔥 CHANGE STYLIST PRESSED!")}
              activeOpacity={0.7}
            >
              <Text style={{ color: '#666', fontSize: 14, fontWeight: '500' }}>
                Change Stylist
              </Text>
            </TouchableOpacity>
          </View>
  
          <View className="mt-6 px-4">
            <Text className="text-base font-semibold">Outfit Request</Text>
  
            <TouchableOpacity
              onPress={() => {
                console.log("🔥 MODAL OPEN PRESSED!"); // Debug log
                setModalVisible(true);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e5e5',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="briefcase-outline" color={"black"} size={24} />
              <Text style={{ marginLeft: 12, fontSize: 16, flex: 1 }}>
                {occasions.find((o) => o.value === occasion)?.label ||
                  "Select Occasion"}{" "}
              </Text>
              <Ionicons name="chevron-down" color={"gray"} size={20} />
            </TouchableOpacity>
  
            <View className="flex-row items-center py-3 border-b border-gray-200 mt-2">
              <Ionicons name="shirt-outline" color={"black"} size={24} />
              <TextInput
                placeholder="E.g first date dinner, casual vibe"
                value={query}
                onChangeText={setQuery}
                className="ml-3 text-base flex-1"
              />
            </View>
  
            <View className="mt-6">
              <Text className="text-base font-semibold mb-2">
                Additional Prompt
              </Text>
  
              <TextInput
                placeholder="Add more details(optional)"
                value={extraPrompt}
                onChangeText={setExtraPrompt}
                className="border border-gray-300 rounded-lg p-3 text-gray-700 h-20"
                multiline
                maxLength={200}
              />
              <Text className="text-gray-400 text-xs mt-1">
                Max 200 characters
              </Text>
            </View>
  
            {(query || extraPrompt || occasion !== "none") && (
              <Text className="text-gray-500 mt-4 px-4">
                Searching for:{" "}
                {`${
                  occasion !== "none" ? occasion : ""
                } ${query} ${extraPrompt}`.trim()}
              </Text>
            )}
  
            {error && <Text className="text-red-500 mt-4 px-4">{error}</Text>}
  
            <TouchableOpacity
              style={{
                marginTop: 32,
                marginHorizontal: 16,
                backgroundColor: loading ? '#666' : '#000',
                paddingVertical: 16,
                borderRadius: 25,
                alignItems: 'center',
              }}
              disabled={loading}
              onPress={handleSearch}
              activeOpacity={0.8}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>
                {loading ? "Searching..." : "✨ Make Outfits"}
              </Text>
            </TouchableOpacity>
  
            {loading && (
              <Text className="text-center text-gray-500 mt-6">
                Searching Outfits
              </Text>
            )}
  
            {!loading && outfits.length > 0 && (
              <View className="mt-6 px-4">
                <Text className="text-lg font-semibold mb-3">
                  Suggested Outfits
                </Text>
                {outfits?.map((outfit:any) => (
                  <View key={outfit._id}>
                    <View className="flex items-center">
                      <Image
                        resizeMode="contain"
                        style={{ aspectRatio: 0.75 }}
                        className="w-3/4 h-72"
                        source={{ uri: outfit?.image }}
                      />
                    </View>
                    <View className="mt-4">
                      <Text className="text-sm font-medium text-gray-900">
                        Items:
                      </Text>
                      <Text className="text-base mt-1">
                        {outfit.items.join(", ")}
                      </Text>
                    </View>
                    <View className="mt-3">
                      <Text className="text-sm font-medium text-gray-900">
                        Details:
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {outfit.style} • {outfit.occasion} • Score:{" "}
                        {(outfit.score * 100).toFixed(1)}%
                      </Text>
                    </View>
                    <TouchableOpacity className="mt-4 bg-gray-200 px-4 py-2 rounded-full mx-auto">
                      <Text className="text-gray-700 text-sm font-medium text-center">
                        Like
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
  
            {!loading &&
              outfits.length == 0 &&
              (query || extraPrompt || occasion !== "none") && (
                <Text className="text-center text-gray-400 mt-6">
                  No outfits match your search
                </Text>
              )}
          </View>
        </ScrollView>
  
        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          style={{ justifyContent: "flex-end", margin: 0 }}
          backdropColor="black"
          backdropOpacity={0.3}
          animationIn="slideInUp"
          animationOut="slideOutDown"
        >
          <View className="bg-white rounded-t-2xl p-4 max-h-[50%]">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
              <Text className="text-lg font-semibold mt-2">Select Occasion</Text>
            </View>
            {occasions.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#e5e5e5',
                }}
                onPress={() => selectOccasion(item.value)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 16, textAlign: 'center' }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      </SafeAreaView>
    );
  };
  
  export default AIOutfitmaker;
  
  const styles = StyleSheet.create({});