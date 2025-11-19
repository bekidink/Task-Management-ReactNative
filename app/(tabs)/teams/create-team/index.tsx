// app/(tabs)/teams/create-team/index.tsx
import React from 'react';
import { View, Text, Pressable, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Camera, Users, Lock, Globe, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCreateTeamStore } from '@/store/useCreateTeamStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeam } from '@/lib/services/teams';

export default function CreateTeamScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { name, avatar, privacy, selectedMembers, setName, setAvatar, setPrivacy, reset } =
    useCreateTeamStore();

  const mutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      reset();
      router.replace('/teams');
      Alert.alert('Success', 'Team created successfully!');
    },
    onError: (err: any) => {
        
      Alert.alert('Error', err.message || 'Failed to create team');
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Team name is required');
      return;
    }

    mutation.mutate({
      name: name.trim(),
      avatar:avatar!,
      privacy,
      memberIds: selectedMembers.map((m) => m.id),
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="border-b border-gray-100 px-5 pb-4 pt-16">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => {
              reset();
              router.back();
            }}>
            <X size={28} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900">Create team</Text>
          <View className="w-8" />
        </View>
      </View>

      {/* Avatar */}
      <View className="items-center pt-10">
        <Pressable onPress={pickImage} className="relative">
          {avatar ? (
            <Image source={{ uri: avatar }} className="h-32 w-32 rounded-3xl" />
          ) : (
            <View className="h-32 w-32 items-center justify-center rounded-3xl bg-purple-100">
              <Users size={48} color="#9333EA" />
            </View>
          )}
          <View className="absolute bottom-2 right-2 rounded-full bg-purple-600 p-3">
            <Camera size={20} color="white" />
          </View>
        </Pressable>
        <Text className="mt-3 text-xs text-gray-500">Tap to upload image</Text>
      </View>

      {/* Name */}
      <View className="mt-10 px-5">
        <Text className="mb-2 text-sm text-gray-700">Name</Text>
        <TextInput
          placeholder="Team name"
          value={name}
          onChangeText={setName}
          className="rounded-2xl border border-purple-200 bg-gray-50 px-5 py-4 text-base"
        />
      </View>

      {/* Add Members */}
      <Pressable
        onPress={() => router.push('/teams/create-team/add-members')}
        className="mx-5 mt-8 flex-row items-center justify-between rounded-2xl border border-purple-200 bg-gray-50 p-5">
        <Text className="text-gray-700">Add member</Text>
        <View className="flex-row -space-x-3">
          {selectedMembers.slice(0, 3).map((m) => (
            <Image
              key={m.id}
              source={{ uri: m.avatar || 'https://i.pravatar.cc/150' }}
              className="h-10 w-10 rounded-full border-2 border-white"
            />
          ))}
          {selectedMembers.length > 3 && (
            <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-purple-100">
              <Text className="text-xs font-bold text-purple-600">
                +{selectedMembers.length - 3}
              </Text>
            </View>
          )}
          <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-purple-100">
            <Plus size={20} color="#9333EA" />
          </View>
        </View>
      </Pressable>

      {/* Privacy */}
      <View className="mt-8 px-5">
        <Text className="mb-3 text-sm text-gray-700">Privacy</Text>
        <View className="flex-row rounded-2xl bg-gray-50 p-1">
          {(['private', 'public'] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPrivacy(p)}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${privacy === p ? 'bg-purple-600' : ''}`}>
              {p === 'private' ? (
                <Lock size={18} color={privacy === p ? 'white' : '#9333EA'} />
              ) : (
                <Globe size={18} color={privacy === p ? 'white' : '#9333EA'} />
              )}
              <Text
                className={`ml-2 font-medium capitalize ${privacy === p ? 'text-white' : 'text-purple-600'}`}>
                {p}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Create Button */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 py-6">
        <Pressable
          onPress={handleCreate}
          disabled={mutation.isPending || !name.trim()}
          className={`flex-row items-center justify-center rounded-2xl py-4 ${name.trim() && !mutation.isPending ? 'bg-purple-600' : 'bg-gray-300'}`}>
          {mutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text
                className={`mr-3 text-lg font-bold ${name.trim() ? 'text-white' : 'text-gray-500'}`}>
                Create
              </Text>
              <Text className="text-2xl text-white">Right Arrow</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
