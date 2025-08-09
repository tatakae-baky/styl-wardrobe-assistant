import {
    ActivityIndicator,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
  } from "react-native";
  import React, { useState } from "react";
  import { useNavigation } from "@react-navigation/native";
  import { Ionicons } from "@expo/vector-icons";
  import env from "../config/env";
  
  const AIAssistant = () => {
    const navigation = useNavigation();
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([
      {
        id: 1,
        text: "Hello! How can I assist you with your outfit today? 😊",
        sender: "ai",
      },
    ]);
    const suggestions = [
      "Suggest a casual outfit for a coffee date ☕",
      "Recommend a formal look for an interview 👔",
      "Best party outfit for tonight 🎉",
      "Summer dress ideas for a beach trip 🌴",
    ];
   
  
  // Use Gemini API key from environment config
  const GEMINI_API_KEY = env.GEMINI_API_KEY;
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = { id: Date.now(), text: query, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a fashion assistant. Provide outfit suggestions with emojis and include links to relevant products or places where applicable. User query: ${query}`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts ||
        !data.candidates[0].content.parts[0] ||
        !data.candidates[0].content.parts[0].text
      ) {
        throw new Error("Invalid response from Gemini API");
      }

      const aiResponse = data.candidates[0].content.parts[0].text;
  
        const enhancedResponse = aiResponse
          .replace("dress", "dress 👗")
          .replace("suit", "suit 🕴️")
          .replace("casual", "casual 😎")
          .replace("party", "party 🎉")
          .replace("http", " [Link](")
          .replace(" ", ") ");
  
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: enhancedResponse, sender: "ai" },
        ]);
      } catch (error:any) {
        console.log("Gemini AI error", error);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: `Sorry, I couldn't get suggestions. Try again! 😔 (Error: ${error.message})`,
            sender: "ai",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    const handleSuggestion = (suggestion: string) => {
      setQuery(suggestion);
      handleSend();
    };
  
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">
            AI Fashion Assistant
          </Text>
          <View className="w-6" />
        </View>
        <ScrollView
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {messages?.map((message) => (
            <View
              key={message.id}
              className={`mb-4 p-3 rounded-lg max-w-[80%] ${
                message.sender == "user"
                  ? "bg-cyan-200 self-end"
                  : "bg-cyan-100 self-start"
              }`}
            >
              <Text className="text-base text-gray-800">{message.text}</Text>
              {message.sender === "ai" &&
                message.text.includes("[Link]") &&
                message.text
                  .split("[Link](")
                  .slice(1)
                  .map((part, index) => {
                    const [url, rest] = part.split(") ");
                    if (url) {
                      return (
                        <TouchableOpacity
                          key={index}
                          onPress={() => Linking.openURL(url)}
                          className="mt-2"
                        >
                          <Text className="text-blue-600 text-sm">
                            🌐 Visit {url}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                    return null;
                  })}
            </View>
          ))}
  
          {isLoading && (
            <View className="flex items-center mt-4">
              <ActivityIndicator size={"large"} color="#1e90ff" />
              <Text className="text-gray-600 mt-2">Fetching Suggestions</Text>
            </View>
          )}
        </ScrollView>
  
        <View className="p-4 bg-white border-t border-gray-200">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Quick Suggestions:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {suggestions?.map((sugg, index) => (
              <TouchableOpacity
                onPress={() => handleSuggestion(sugg)}
                key={index}
                className="bg-gray-200 px-4 py-2 rounded-full mr-2"
              >
                <Text>{sugg}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
  
        <View className="flex-row items-center p-4 bg-white border-t border-gray-200">
          <TextInput
            className="flex-1 h-10 bg-gray-100 rounded-full px-4 text-base text-gray-800"
            value={query}
            onChangeText={setQuery}
            placeholder="Ask me anything about fashion..."
            placeholderTextColor={"#999"}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={isLoading}
            className={`ml-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center`}
          >
            <Ionicons name="send" size={20} color={isLoading ? "#ccc" : "#fff"} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };
  
  export default AIAssistant;
  
  const styles = StyleSheet.create({});