import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

interface ClothingItem {
  id: number;
  image: string;
  x: number;
  y: number;
  type?: "pants" | "shirt" | "skirt" | "shoes";
  gender?: "f" | "m" | "unisex";
}

const DraggableClothingItem = ({item, idx}: {item: ClothingItem, idx: number}) => {
    const translateX = useSharedValue(item?.x);
    const translateY = useSharedValue(item?.y);

    const panGesture = Gesture.Pan().onUpdate((e) => {
        translateX.value = e.translationX + item.x;
        translateY.value = e.translationY + item.y;
    }).onEnd(() => {
        item.x = translateX.value;
        item.y = translateY.value;
    });

    const animateStyle = useAnimatedStyle(() => ({
        transform: [
            {translateX: translateX.value},
            {translateY: translateY.value},
        ],
        position: "absolute",
        zIndex: item.type === "shirt"|| item.type === "skirt" ? 20 : 10
    }))
    return(
        <GestureDetector gesture={panGesture}>
            <Animated.View style={animateStyle}>
                <Image resizeMode="contain" source={{uri: item.image}} style={{width: 240, height: item.type === "shoes" ? 180 : 240}} />
            </Animated.View>
        </GestureDetector>
    )
}
    


const DesignRoomScreen = () => {
  const route = useRoute();
  const { selectedItems, date, savedOutfits } = route.params as {
    selectedItems: ClothingItem[];
    date: string;
    savedOutfits: { [key: string]: any[] };
  };

  const [clothes, setClothes] = useState<ClothingItem[]>([]);

  useEffect(() => {
    const initialClothes = selectedItems.map((item, idx) => {
       const xPosition = width / 2 - 120;
       let yPosition;
       const shirtItem = selectedItems.find((id) =>  id.type === "shirt");
       const pantsItem = selectedItems.find((id) =>  id.type === "pants");
       const shoesItems = selectedItems.find((id)=> id.type=== "shoes");

       if (item?.type === "shirt" || item?.type === "skirt"){
        yPosition = height / 2 - 240  - 100;
       }else if(item.type == "pants"){
        yPosition = shirtItem? height/2 -100 : height/2;
       }else if(item.type === "shoes"){
        yPosition = shoesItems? height/2 - 100 : height/2;
       }else{
        yPosition = height/2;
       }

       return {
        ...item,
        x: xPosition,
        y: yPosition,
       }
    });
    setClothes(initialClothes);
  }, [selectedItems]);

  return (
    <SafeAreaView className="flex-1 bg-black">
        <View className="flex-row items-center justify-between p-4">
            <Text className="text-white text-lg">{date}</Text>
            <TouchableOpacity className="bg-gray-700 p-2 rounded">
                <Text className="text-white">Next</Text>
            </TouchableOpacity>
        </View>
        
        <View>
            {
                clothes.map((item, idx) => (
                    <DraggableClothingItem item={item} idx={idx}/>
                ))
            }
        </View>
    </SafeAreaView>
  );
};

export default DesignRoomScreen;

const styles = StyleSheet.create({});
