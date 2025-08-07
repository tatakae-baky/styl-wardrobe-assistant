import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

const { width, height } = Dimensions.get("window");

const features = [
  {
    title: "AI Suggestions",
    image:
      "https://i.pinimg.com/736x/2e/3d/d1/2e3dd14ac81b207ee6d86bc99ef576eb.jpg",
    screen: "AIChat",
  },
  {
    title: "AI Outfit Maker",
    image:
      "https://i.pinimg.com/736x/50/83/0e/50830e372ee844c1f429b8ef89e26fd1.jpg",
    screen: "AIOutfit",
  },
  {
    title: "AI Try On",
    image:
      "https://i.pinimg.com/736x/c2/78/95/c2789530a2dc8c9dbfd4aa5e2e70d608.jpg",
    screen: "AITryOn",
  },
  {
    title: "Color Analysis",
    image:
      "https://i.pinimg.com/736x/84/bf/ce/84bfce1e46977d50631c4ef2f72f83b1.jpg",
    screen: "ColorAnalysis",
  },
];

const popularItems = [
  {
    username: "Trisha Wushres",
    profile: "https://randomuser.me/api/portraits/women/1.jpg",
    image:
      "https://res.cloudinary.com/db1ccefar/image/upload/v1753859289/skirt3_oanqxj.png",
    itemName: "Floral Skirt",
  },
  {
    username: "Anna Cris",
    profile: "https://randomuser.me/api/portraits/women/2.jpg",
    image:
      "https://res.cloudinary.com/db1ccefar/image/upload/v1753975629/Untitled_design_3_syip4x.png",
    itemName: "Mens Jeans",
  },
  {
    username: "Isabella",
    profile: "https://randomuser.me/api/portraits/women/3.jpg",
    image:
      "https://res.cloudinary.com/db1ccefar/image/upload/v1753975802/Untitled_design_11_p7t2us.png",
    itemName: "Shoes",
  },
  {
    username: "Trisha Wushres",
    profile: "https://randomuser.me/api/portraits/women/1.jpg",
    image:
      "https://res.cloudinary.com/db1ccefar/image/upload/v1753859289/skirt3_oanqxj.png",
    itemName: "Floral Skirt",
  },
];

const initialStories = [
  {
    username: "Your OOTD",
    avatar: "https://picsum.photos/100/100?random=8",
    isOwn: true,
    viewed: false,
  },
  {
    username: "_trishwushres",
    avatar: "https://picsum.photos/100/100?random=10",
    isOwn: false,
    viewed: false,
  },
  {
    username: "myglam",
    avatar: "https://picsum.photos/100/100?random=11",
    isOwn: false,
    viewed: false,
  },
  {
    username: "stylist",
    avatar: "https://picsum.photos/100/100?random=12",
    isOwn: false,
    viewed: false,
  },
];

const generateDates = () => {
  const today = moment().startOf("day");
  const dates = [];
  for (let i = -3; i <= 3; i++) {
    dates.push({
      label: today.clone().add(i, "days").format("ddd, DD MMM"),
      outfit: i === 1,
    });
  }
  return dates;
};

const dates = generateDates();

const HomeScreen = () => {
  const navigation = useNavigation();
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [stories, setStories] = useState(initialStories);
  const [showStory, setShowStory] = useState(false);
  const [currentStory, setCurrentStory] = useState<{
    username: string;
    avatar: string;
    duration: number;
  } | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 pt-4">
          <Text className="text-3xl font-bold">Fits</Text>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity className="bg-black rounded-full px-4 py-1">
              <Text className="text-white text-sm font-semibold">Upgrade</Text>
            </TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={"black"} />
            <Ionicons name="search-outline" size={24} color={"black"} />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 pl-4"
        >
          {stories.map((story, index) => (
            <Pressable key={index} className="mr-4 items-center">
              <View
                className={`w-16 h-16 rounded-full justify-center relative items-center ${story.viewed ? "border-2 border-gray-200" : "border-2 border-purple-400"}`}
              >
                <Image
                  source={{ uri: story.avatar }}
                  className="w-16 h-16 rounded-full"
                />
                {story.isOwn && (
                  <View className="absolute bottom-0 right-0 w-5 h-5 bg-black rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-semibold">+</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs mt-1 text-center">{story.username}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="flex-row items-center justify-between px-4 mt-6">
          <Text className="text-lg font-semibold">Your Week</Text>
          <Text className="text-gray-500">Planner</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 pl-4"
        >
          {dates.map((date, index) => {
            const today = moment().format("ddd, DD MMM");
            const outfit =
              savedOutfits[date.label] ||
              (date.label === today && savedOutfits[today]
                ? savedOutfits[today]
                : null);
            return (
              <View key={index} className="mr-4 ">
                <Pressable
                  onPress={() =>
                    navigation.navigate("AddOutfit", {
                      date: date.label,
                      savedOutfits,
                    })
                  }
                  key={index}
                  className={`w-24 h-40 rounded-xl justify-center overflow-hidden items-center shadow-md ${outfit ? "bg-white" : "bg-gray-50"}`}
                >
                  {!outfit && (
                    <View className="w-full h-full flex items-center justify-center">
                      <Text className="text-gray-400 text-3xl ">+</Text>
                    </View>
                  )}
                </Pressable>
                <Text className="text-gray-700 text-xs mt-1 text-center">
                  {date.label}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View className="flex-row flex-wrap justify-between px-4 mt-6">
          {features.map((feature, index) => (
            <Pressable
              style={{
                backgroundColor: ["#FFF1F2", "#EFF6FF", "#F0FFF4", "#FFFBEB"][
                  index % 4
                ],
                elevation: 3,
              }}
              key={index}
              className="mb-4 w-[48%] h-36 rounded-2xl overflow-hidden shadow-md"
            >
              <View className="p-3">
                <Text className="text-[16px] font-bold mt-2 text-gray-800">
                  {feature.title}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {index === 0
                    ? "Try on outfits virtually"
                    : index === 1
                      ? "Ai creates new looks"
                      : index === 2
                        ? "Instant Try on"
                        : "Find best colors"}
                </Text>
              </View>
              <Image
                style={{
                  transform: [{ rotate: "12deg" }],
                  opacity: 0.9,
                }}
                source={{ uri: feature.image }}
                className="w-20 h-20 absolute bottom-[-3] right-[-10] rounded-lg"
              />
            </Pressable>
          ))}
        </View>

        <View className="flex-row items-center justify-between mt-6 px-4">
          <Text className="text-lg font-semibold">Popular this week</Text>
          <Text className="text-gray-500">More</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 pl-4 mb-6"
        >
          {popularItems.map((item, index) => (
            <View key={index} className="w-36 mr-4">
              <Image
                source={{ uri: item?.image }}
                className="w-36 h-44 rounded-lg"
              />
              <View className="flex-row items-center mt-2">
                <Image
                  source={{ uri: item?.profile }}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <Text className="text-sm font-semibold">{item?.username}</Text>
              </View>
              <Text className="text-xs text-gray-500  mt-1">
                {item?.itemName}
              </Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
