// app/(tabs)/messages/create-group/confirm.tsx
import React from 'react';
import { View, Text, Pressable,Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { useCreateGroupStore } from '@/store/useCreateGroupStore';

export default function CreateGroupStep3() {
  const router = useRouter();
  const { selectedMembers, groupName, reset } = useCreateGroupStore();

  const handleCreate = () => {
    // TODO: Call your API to create group
    reset(); // Clear store
    router.replace('/messages'); // Go back to chat list
  };

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

      <View className="flex-1 items-center pt-12">
        <View className="mb-6 h-32 w-32 items-center justify-center rounded-3xl bg-purple-100">
          <Text className="text-5xl">Group</Text>
        </View>
        <Text className="mb-2 text-2xl font-bold text-gray-900">{groupName || 'New Group'}</Text>
        <Text className="mb-8 text-gray-500">{selectedMembers.length} members</Text>

        <View className="flex-row -space-x-4">
          {selectedMembers.slice(0, 4).map((m, i) => (
            <Image
              key={m.id}
              source={{ uri: m.avatar }}
              className="h-16 w-16 rounded-full border-4 border-white"
            />
          ))}
          {selectedMembers.length > 4 && (
            <View className="h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-purple-100">
              <Text className="text-lg font-bold text-purple-600">
                +{selectedMembers.length - 4}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="border-t border-gray-100 bg-white px-5 py-6">
        <Pressable
          onPress={handleCreate}
          className="flex-row items-center justify-center rounded-2xl bg-purple-600 py-4">
          <Text className="mr-3 text-lg font-bold text-white">Create</Text>
          <Text className="text-2xl text-white">Right Arrow</Text>
        </Pressable>
      </View>
    </View>
  );
}
