// app/(tabs)/teams/index.tsx
import React from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Users, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getTeams } from '@/lib/services/teams';

export default function TeamsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    select: (res) => res.data,
  });

  return (
    <View className="flex-1 bg-gray-50">
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="border-b border-gray-200 bg-white px-5 pb-4">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Teams</Text>
          <Pressable onPress={() => router.push('/teams/create-team' as never)}>
            <Plus size={28} color="#9333EA" />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      ) : teams.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Users size={64} color="#9333EA" className="mb-4" />
          <Text className="text-center text-lg text-gray-500">No teams yet</Text>
          <Text className="mt-2 text-center text-gray-500">Create your first team!</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="space-y-4 px-5 py-6">
            {teams.map((team: any) => (
              <Pressable
                key={team.id}
                className="flex-row items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: team.avatar || 'https://i.pravatar.cc/150?img=1' }}
                    className="mr-4 h-16 w-16 rounded-2xl"
                  />
                  <View>
                    <Text className="text-lg font-bold text-gray-900">{team.name}</Text>
                    <Text className="text-sm text-gray-500">
                      {team.members.length} member{team.members.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={24} color="#9CA3AF" />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
