// app/(tabs)/messages/[id].tsx
import React from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Paperclip, Send, Smile } from 'lucide-react-native';

const messages = [
  { id: 1, text: 'Hi Jason! How are you?', isMe: false },
  { id: 2, text: "I'm good. How are you?", isMe: true },
  { id: 3, text: 'How is the work going?', isMe: false },
  { id: 4, text: "I've just checked done 5 tasks", isMe: true },
  { id: 5, text: 'Amazing good job !!!', isMe: false },
  { id: 6, text: 'Make me welcome friend', isMe: true },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-5 py-4">
        <Pressable onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={28} color="#374151" />
        </Pressable>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=1' }}
          className="mr-3 h-10 w-10 rounded-full"
        />
        <View>
          <Text className="text-lg font-bold text-gray-900">Tien Tom</Text>
          <Text className="text-xs text-green-600">Online</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        {messages.map((msg) => (
          <View key={msg.id} className={`mb-4 max-w-[80%] ${msg.isMe ? 'self-end' : 'self-start'}`}>
            <View
              className={`rounded-2xl px-4 py-3 ${
                msg.isMe ? 'bg-purple-600' : 'bg-white'
              } shadow-sm`}>
              <Text className={`${msg.isMe ? 'text-white' : 'text-gray-900'}`}>{msg.text}</Text>
            </View>
          </View>
        ))}
        <View className="h-32" />
      </ScrollView>

      {/* Input */}
      <View className="flex-row items-center border-t border-gray-200 bg-white px-5 py-4">
        <Pressable className="mr-3">
          <Paperclip size={24} color="#9333EA" />
        </Pressable>
        <TextInput
          placeholder="Write a message"
          className="mr-3 flex-1 rounded-2xl bg-gray-100 px-4 py-3"
        />
        <Pressable className="mr-2">
          <Smile size={24} color="#9333EA" />
        </Pressable>
        <Pressable>
          <Send size={24} color="#9333EA" />
        </Pressable>
      </View>
    </View>
  );
}
