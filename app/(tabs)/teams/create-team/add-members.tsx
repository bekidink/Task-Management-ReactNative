// app/(tabs)/teams/create-team/add-members.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput,Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, Check } from 'lucide-react-native';
import { useCreateTeamStore } from '@/store/useCreateTeamStore';

const contacts = [
  {
    id: 1,
    name: 'Tien Tom',
    role: 'Product Designer',
    status: 'Online',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    name: 'Minh Ha',
    role: 'Product Manager',
    status: 'Offline 25m ago',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 3,
    name: 'Thuan Ngo',
    role: 'UI/UX Designer',
    status: 'Offline 1 day ago',
    avatar: 'https://i.pravatar.cc/150?img=8',
  },
  {
    id: 4,
    name: 'Thuy Ky',
    role: 'UI/UX Designer',
    status: 'Offline 2h ago',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 5,
    name: 'Tien Tom',
    role: 'UI/UX Designer',
    status: 'Online',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

export default function AddMembersScreen() {
  const router = useRouter();
  const { selectedMembers, toggleMember } = useCreateTeamStore();
  const [search, setSearch] = useState('');

  return (
    <View className="flex-1 bg-white">
      <View className="border-b border-gray-100 px-5 pb-4 pt-16">
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={28} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900">Add member</Text>
          <View className="w-8" />
        </View>

        <View className="flex-row items-center rounded-2xl bg-gray-100 px-4 py-3.5">
          <Search size={20} color="#9CA3AF" className="mr-3" />
          <TextInput
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-gray-700"
          />
        </View>
      </View>

      {selectedMembers.length > 0 && (
        <View className="bg-purple-50 px-5 py-3">
          <Text className="font-medium text-purple-700">Selected ({selectedMembers.length})</Text>
        </View>
      )}

      <ScrollView>
        <View className="px-5 pt-4">
          <Text className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
            Suggested
          </Text>

          {contacts.map((c) => {
            const isSelected = selectedMembers.some((m) => m.id === c.id);
            return (
              <Pressable
                key={c.id}
                onPress={() => toggleMember(c)}
                className="flex-row items-center border-b border-gray-100 py-4">
                <Image source={{ uri: c.avatar }} className="mr-4 h-14 w-14 rounded-full" />
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">{c.name}</Text>
                  <Text className="text-sm text-gray-500">
                    {c.role} • {c.status}
                  </Text>
                </View>
                <View
                  className={`h-7 w-7 items-center justify-center rounded-full border-2 ${isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>
                  {isSelected && <Check size={16} color="white" />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="border-t border-gray-100 bg-white px-5 py-6">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center justify-center rounded-2xl bg-purple-600 py-4">
          <Text className="mr-3 text-lg font-bold text-white">Done</Text>
          <Text className="text-2xl text-white">Right Arrow</Text>
        </Pressable>
      </View>
    </View>
  );
}
