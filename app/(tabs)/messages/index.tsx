// app/(tabs)/messages/index.tsx
import React from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import {
  Search,
  Plus,
  MessageCircle,
  Home,
  FolderOpen,
  CheckSquare,
  Bell,
} from 'lucide-react-native';

const chats = [
  {
    id: 1,
    name: 'Tien Tom',
    lastMsg: 'Hello! Are you going to work?',
    time: '15 mins ago',
    avatar: 'https://i.pravatar.cc/150?img=1',
    unread: 3,
  },
  {
    id: 2,
    name: 'Tien Tom',
    lastMsg: "I'm done!",
    time: '15 mins ago',
    avatar: 'https://i.pravatar.cc/150?img=3',
    unread: 0,
  },
  {
    id: 3,
    name: 'Tien Tom',
    lastMsg: 'Have you checked my task?',
    time: '15 mins ago',
    avatar: 'https://i.pravatar.cc/150?img=5',
    unread: 1,
  },
  {
    id: 4,
    name: 'Tien Tom',
    lastMsg: 'Hello! Are you going to work?',
    time: '15 mins ago',
    avatar: 'https://i.pravatar.cc/150?img=7',
    unread: 0,
  },
];

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 12 }} className="border-b border-gray-100 px-5 pb-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Chat</Text>
          <Link href="/messages/new" asChild>
            <Pressable>
              <Plus size={28} color="#9333EA" />
            </Pressable>
          </Link>
        </View>

        <View className="flex-row items-center rounded-2xl bg-gray-100 px-4 py-3.5">
          <Search size={20} color="#9CA3AF" className="mr-3" />
          <TextInput placeholder="Search" className="flex-1 text-gray-700" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-32 pt-4">
          {chats.map((chat) => (
            <Link href={`/messages/${chat.id}`} key={chat.id} asChild>
              <Pressable className="flex-row items-center border-b border-gray-100 py-4">
                <Image source={{ uri: chat.avatar }} className="mr-4 h-14 w-14 rounded-full" />
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-gray-900">{chat.name}</Text>
                    <Text className="text-xs text-gray-500">{chat.time}</Text>
                  </View>
                  <Text className="mt-1 text-sm text-gray-600" numberOfLines={1}>
                    {chat.lastMsg}
                  </Text>
                </View>
                {chat.unread > 0 && (
                  <View className="ml-3 h-6 min-w-6 items-center justify-center rounded-full bg-purple-600">
                    <Text className="text-xs font-bold text-white">{chat.unread}</Text>
                  </View>
                )}
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>

      
    </View>
  );
}
