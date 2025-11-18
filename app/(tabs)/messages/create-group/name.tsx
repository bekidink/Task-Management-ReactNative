// app/(tabs)/messages/create-group/name.tsx
import React from 'react';
import { View, Text, Pressable, TextInput,Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { useCreateGroupStore } from '@/store/useCreateGroupStore';

export default function CreateGroupStep2() {
  const router = useRouter();
  const { selectedMembers, groupName, setGroupName } = useCreateGroupStore();

  return (
    <View className="flex-1 bg-white">
      <View className="border-b border-gray-100 px-5 pb-4 pt-16">
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={28} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900">Create group chat</Text>
          <View className="w-8" />
        </View>
      </View>

      <View className="flex-1 px-5 pt-8">
        <Text className="mb-3 text-sm font-medium text-gray-700">Name</Text>
        <TextInput
          placeholder="Text"
          value={groupName}
          onChangeText={setGroupName}
          className="mb-8 rounded-2xl border border-purple-300 bg-white px-5 py-4 text-lg"
          style={{ borderWidth: 1.5 }}
        />

        <Text className="mb-4 text-sm font-medium text-gray-700">
          Members ({selectedMembers.length})
        </Text>
        <View className="-mx-2 flex-row flex-wrap">
          {selectedMembers.map((m) => (
            <View key={m.id} className="mx-2 mb-6 items-center">
              <Image source={{ uri: m.avatar }} className="mb-2 h-16 w-16 rounded-full" />
              <Text className="text-sm text-gray-900">{m.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="border-t border-gray-100 bg-white px-5 py-6">
        <Pressable
          onPress={() => router.push('/messages/create-group/confirm')}
          className="flex-row items-center justify-center rounded-2xl bg-purple-600 py-4">
          <Text className="mr-3 text-lg font-bold text-white">Create</Text>
          <Text className="text-2xl text-white">Right Arrow</Text>
        </Pressable>
      </View>
    </View>
  );
}
