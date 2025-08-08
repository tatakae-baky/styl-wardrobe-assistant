import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from "react-native-reanimated";
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

interface RouteParams {
  selectedItems: ClothingItem[];
  date: string;
  savedOutfits: { [key: string]: ClothingItem[] };
}

const DraggableClothingItem = ({item, idx, onUpdatePosition, draggableAreaBounds}: {
    item: ClothingItem, 
    idx: number,
    onUpdatePosition: (id: number, x: number, y: number) => void,
    draggableAreaBounds: {top: number, bottom: number, left: number, right: number}
}) => {
    const translateX = useSharedValue(item?.x || 0);
    const translateY = useSharedValue(item?.y || 0);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    // Update shared values when item position changes
    React.useEffect(() => {
        translateX.value = item?.x || 0;
        translateY.value = item?.y || 0;
    }, [item?.x, item?.y, translateX, translateY]);
    
    // Track the context of the current gesture
    const context = useSharedValue({ x: 0, y: 0 });

    const panGesture = Gesture.Pan()
        .onStart(() => {
            // Save the current position when gesture starts
            context.value = {
                x: translateX.value,
                y: translateY.value
            };
        })
        .onUpdate((e) => {
            // Calculate from the position at gesture start
            const newX = e.translationX + context.value.x;
            const newY = e.translationY + context.value.y;
            
            // No boundary constraints - items can be dragged anywhere
            translateX.value = newX;
            translateY.value = newY;
        })
        .onEnd(() => {
            // Use runOnJS to safely call JavaScript function from UI thread
            if (onUpdatePosition && item?.id) {
                runOnJS(onUpdatePosition)(item.id, translateX.value, translateY.value);
            }
        });

    const animateStyle = useAnimatedStyle(() => {
        // Determine z-index based on clothing type for proper layering
        let zIndex = 10; // Default
        if (item?.type === "shoes") zIndex = 5;
        else if (item?.type === "pants") zIndex = 10;
        else if (item?.type === "shirt" || item?.type === "skirt") zIndex = 15;
        
        return {
            transform: [
                {translateX: translateX.value},
                {translateY: translateY.value},
            ],
            position: "absolute",
            zIndex: zIndex
        };
    });

    return(
        <GestureDetector gesture={panGesture}>
            <Animated.View style={animateStyle}>
                <Image 
                    resizeMode="contain" 
                    source={{uri: item.image}} 
                    style={{
                        width: 240, 
                        height: item?.type === "shoes" ? 180 : 240,
                        opacity: imageError ? 0 : 1
                    }}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                    }}
                    onLoadStart={() => setImageLoading(true)}
                />
                
                {imageLoading && !imageError && (
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 240, 
                        height: item?.type === "shoes" ? 180 : 240,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.3)'
                    }}>
                        <ActivityIndicator size="small" color="white" />
                    </View>
                )}
                
                {imageError && (
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 240, 
                        height: item?.type === "shoes" ? 180 : 240,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.2)',
                        borderStyle: 'dashed'
                    }}>
                        <Text style={{color: 'white', textAlign: 'center', fontSize: 12}}>
                            Image{'\n'}Not Found
                        </Text>
                    </View>
                )}
            </Animated.View>
        </GestureDetector>
    )
};

const DesignRoomScreen = () => {
  const route = useRoute<RouteProp<{params: RouteParams}, 'params'>>();
  const navigation = useNavigation();
  const { selectedItems, date, savedOutfits } = route.params;

  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [outfitWarning, setOutfitWarning] = useState<string>("");
  const [backgroundColor, setBackgroundColor] = useState<string>("#fff"); // Default light gray

  // Available background colors
  const backgroundColors = [ "#FEF3C7", "#DBEAFE", "#F3E8FF", "#ECFDF5", "#FEE2E2", "#fff"];

  // Validate outfit combinations
  const validateOutfit = useCallback((items: ClothingItem[]) => {
    const hasSkirt = items.some(item => item?.type === "skirt");
    const hasPants = items.some(item => item?.type === "pants");
    
    if (hasSkirt && hasPants) {
      setOutfitWarning("You have both a skirt and pants selected. Consider choosing one.");
    } else {
      setOutfitWarning("");
    }
  }, []);

  // Callback to update item position
  const handleUpdatePosition = useCallback((id: number, x: number, y: number) => {
    setClothes(prevClothes => 
      prevClothes.map(item => 
        item.id === id ? { ...item, x, y } : item
      )
    );
  }, []);

  // Handle background color change
  const handleBackgroundColorChange = useCallback(() => {
    const currentIndex = backgroundColors.indexOf(backgroundColor);
    const nextIndex = (currentIndex + 1) % backgroundColors.length;
    setBackgroundColor(backgroundColors[nextIndex]);
  }, [backgroundColor, backgroundColors]);

  // Handle adding more items
  const handleAddMoreItems = useCallback(() => {
    navigation.goBack(); // Navigate back to the previous screen to add more items
  }, [navigation]);

  useEffect(() => {
    // Calculate draggable area dimensions
    const draggableAreaHeight = height * 0.75; // 75% of screen height for draggable area
    const draggableAreaTop = height * 0.05; // 5% from top

    const initialClothes = selectedItems.map((item, idx) => {
       // Group items by type to calculate staggered positions
       const sameTypeItems = selectedItems.filter(i => i?.type === item?.type);
       const itemIndex = sameTypeItems.findIndex(i => i.id === item.id);
       
       // Base X position (centered) with staggered offset for multiple items of same type
       const baseXPosition = width / 2 - 120;
       const staggerOffset = itemIndex * 60; // 60px offset for each additional item
       const xPosition = sameTypeItems.length > 1 ? 
         baseXPosition + staggerOffset - ((sameTypeItems.length - 1) * 30) : // Center the group
         baseXPosition;
       
       let yPosition;
       const shirtItem = selectedItems.find((id) => id?.type === "shirt");
       const pantsItem = selectedItems.find((id) => id?.type === "pants");
       
       // Improved positioning logic relative to draggable area
       if (item?.type === "shirt" || item?.type === "skirt"){
        yPosition = draggableAreaTop + (draggableAreaHeight * 0.15); // 15% within draggable area
       } else if(item?.type === "pants"){
        yPosition = shirtItem ? draggableAreaTop + (draggableAreaHeight * 0.45) : draggableAreaTop + (draggableAreaHeight * 0.30);
       } else if(item?.type === "shoes"){
        yPosition = pantsItem ? draggableAreaTop + (draggableAreaHeight * 0.70) : draggableAreaTop + (draggableAreaHeight * 0.50);
       } else {
        yPosition = draggableAreaTop + (draggableAreaHeight * 0.40);
       }

       return {
        ...item,
        x: xPosition,
        y: yPosition,
       }
    });
    setClothes(initialClothes);
    validateOutfit(initialClothes);
  }, [selectedItems, validateOutfit]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
        {/* Header with date */}
        <View style={{paddingHorizontal: 16, paddingVertical: 8}}>
            <Text style={{color: 'white', fontSize: 18, textAlign: 'center'}}>{date}</Text>
        </View>
        
        {/* Outfit warning */}
        {outfitWarning && (
            <View style={{marginHorizontal: 16, marginBottom: 8, padding: 12, backgroundColor: '#D97706', borderRadius: 8}}>
                <Text style={{color: 'white', fontSize: 14}}>{outfitWarning}</Text>
            </View>
        )}
        
        {/* Main draggable area with dotted background */}
        <View style={{flex: 1, marginHorizontal: 16, marginBottom: 120}}>
            <View 
                style={{
                    flex: 1,
                    backgroundColor: backgroundColor,
                    borderRadius: 24,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Dotted pattern overlay for white background */}
                {backgroundColor === "#fff" && (
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1,
                    }}>
                        {Array.from({ length: Math.floor((height * 0.75) / 25) }).map((_, rowIndex) => (
                            <View key={rowIndex} style={{flexDirection: 'row'}}>
                                {Array.from({ length: Math.floor((width - 32) / 25) }).map((_, colIndex) => (
                                    <View
                                        key={`${rowIndex}-${colIndex}`}
                                        style={{
                                            width: 25,
                                            height: 25,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 3,
                                                height: 3,
                                                borderRadius: 1.5,
                                                backgroundColor: 'rgba(0,0,0,0.15)',
                                            }}
                                        />
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}
                
                {/* Draggable clothing items container */}
                <View style={{flex: 1, position: 'relative', zIndex: 2}}>
                    {
                        clothes.map((item, idx) => (
                            <DraggableClothingItem 
                                key={item.id}
                                item={item} 
                                idx={idx}
                                onUpdatePosition={handleUpdatePosition}
                                draggableAreaBounds={{
                                    top: 0,
                                    bottom: height * 0.75,
                                    left: 0,
                                    right: width - 32 // Account for margin
                                }}
                            />
                        ))
                    }
                </View>
            </View>
        </View>
        
        {/* Bottom buttons */}
        <View 
            className="absolute bottom-8 left-0 right-0 px-4"
            style={{
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 16
            }}
        >
            {/* Background color changer button */}
            <TouchableOpacity 
                onPress={handleBackgroundColorChange}
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: 'white',
                    backgroundColor: backgroundColor,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <View 
                    style={{
                        width: 20, 
                        height: 20, 
                        borderRadius: 10, 
                        backgroundColor: backgroundColors[(backgroundColors.indexOf(backgroundColor) + 1) % backgroundColors.length],
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0.2)'
                    }} 
                />
            </TouchableOpacity>
            
            {/* Add more items button */}
            <TouchableOpacity 
                onPress={handleAddMoreItems}
                style={{
                    width: 56,
                    height: 56,
                    backgroundColor: 'white',
                    borderRadius: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                }}
            >
                <Text style={{color: 'black', fontSize: 32, fontWeight: '400'}}>+</Text>
            </TouchableOpacity>
            
            {/* Next button */}
            <TouchableOpacity 
                style={{
                    backgroundColor: '#4F46E5',
                    paddingHorizontal: 32,
                    paddingVertical: 12,
                    borderRadius: 25,
                }}
            >
                <Text style={{color: 'white', fontSize: 18, fontWeight: '500'}}>Next</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

export default DesignRoomScreen;

const styles = StyleSheet.create({});
