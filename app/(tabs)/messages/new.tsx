// app/(tabs)/messages/new.tsx
import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ChevronLeft, ArrowRight } from 'lucide-react-native';

const recent = [
  { name: 'Tien Tom', status: 'Online 20m ago', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Thuan Ngo', status: 'Offline 20m ago', avatar: 'https://i.pravatar.cc/150?img=8' },
  { name: 'Minh Ha', status: 'Offline 20m ago', avatar: 'https://i.pravatar.cc/150?img=5' },
];

export default function NewMessage() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <View className="border-b border-gray-100 px-5 pb-6 pt-16">
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={28} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900">New message</Text>
          <View className="w-8" />
        </View>
      </View>

      <View className="px-5 pt-6">
        <Link href={`/messages/create-group`} className="flex-row items-center justify-between border-b border-gray-100 py-4">
          <Text className="text-base font-medium text-purple-600">Create a group chat</Text>
          <ArrowRight size={20} color="#9333EA" />
        </Link>

        <Text className="mb-4 mt-8 text-sm font-medium text-gray-500">Recently</Text>
        {recent.map((r) => (
          <Pressable key={r.name} className="flex-row items-center justify-between py-4">
            <View className="flex-row items-center">
              <Image source={{ uri: r.avatar }} className="mr-4 h-14 w-14 rounded-full" />
              <View>
                <Text className="font-semibold text-gray-900">{r.name}</Text>
                <Text className="text-sm text-gray-500">{r.status}</Text>
              </View>
            </View>
            <View className="h-6 w-6 rounded-full border-2 border-purple-600" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
