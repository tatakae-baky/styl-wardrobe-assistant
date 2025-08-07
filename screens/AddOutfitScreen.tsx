import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { mpants, pants, shoes, skirts, tops, mshirts } from "../images";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Define route param types
type AddOutfitScreenParams = {
  date: string;
  savedOutfits?: any[];
};

const AddOutfitScreen = () => {
  const route =
    useRoute<RouteProp<Record<string, AddOutfitScreenParams>, string>>();
  const { date, savedOutfits = [] } = route.params;
  const navigation = useNavigation<any>();
  const popularClothes = [
    ...skirts,
    ...pants,
    ...shoes,
    ...mpants,
    ...mshirts,
    ...tops,
  ]
    .map((item, idx) => ({
      ...item,
      id: idx + 1,
    }))
    .filter((item) => item.image);

  const [selectedItem, setSelectedItem] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedItem((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Section */}
      <View className="flex-row items-center justify-between px-4 pt-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Add Outfit</Text>
        <Text className="text-gray-500">{date}</Text>
      </View>

      {/* Add Outfit Section */}
      <View className="flex-row justify-around mt-4 px-4">
        <TouchableOpacity className="bg-gray-100 w-[30%] py-3 rounded-lg items-center">
          <Ionicons name="camera-outline" size={22} color="black" />
          <Text className="font-medium mt-1">Selfie</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-gray-100 w-[30%] py-3 rounded-lg items-center">
          <Ionicons name="sparkles-outline" size={22} color="black" />
          <Text className="font-medium mt-1">Suggestions</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-gray-100 w-[30%] py-3 rounded-lg items-center">
          <Ionicons name="shirt-outline" size={22} color="black" />
          <Text className="font-medium mt-1">Saved Outfits</Text>
        </TouchableOpacity>
      </View>

      {/* Popular Clothes Section */}
      <ScrollView className="flex-1 mt-4 mb-20">
        <Text className="text-lg font-semibold px-4 mt-4">Popular Clothes</Text>
        <View className="flex-row flex-wrap px-4 mt-2 mb-20">
          {popularClothes.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              className="w-1/3 h-32 rounded-md"
              onPress={() => toggleSelect(item.id)}
            >
              <Image
                source={{ uri: item?.image }}
                resizeMode="contain"
                className="w-full h-32 rounded-md"
              />
              <View className="absolute top-2 right-2 w-6 h-6 rounded-full border-1 border-gray-650 items-center justify-center">
                <Text>
                  {item.gender === "f"
                    ? "♀"
                    : item.gender === "m"
                      ? "♂"
                      : "⚥"}
                </Text>
              </View>
              <View
                className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 ${selectedItem.includes(item.id) ? "bg-black" : "border-gray-400"} items-center justify-center`}
              >
                {selectedItem.includes(item.id) && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedItem.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedItem.map((id) => {
              const item = popularClothes.find((item) => item.id === id);
              return (
                <Image
                  key={id}
                  source={{ uri: item?.image }}
                  className="w-16 h-16  mr-3 rounded-md"
                />
              );
            })}
          </ScrollView>
          <TouchableOpacity className="bg-black w-24 py-3 rounded-lg items-center self-end mt-3 mb-3">
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AddOutfitScreen;

const styles = StyleSheet.create({});
