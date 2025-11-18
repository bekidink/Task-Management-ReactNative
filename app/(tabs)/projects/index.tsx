// app/(tabs)/projects.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Search, Plus, ChevronLeft, X, Calendar, Clock, Users } from 'lucide-react-native';
import Modal from 'react-native-modal';

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [tab, setTab] = useState<'Projects' | 'Completed' | 'Flag'>('Projects');

  const projects = [
    { id: 1, name: 'Mane UIKit', progress: 50, tasks: '2/48', members: 4 },
    { id: 2, name: 'Mane UIKit', progress: 50, tasks: '2/48', members: 4 },
    { id: 3, name: 'Mane UIKit', progress: 50, tasks: '2/48', members: 4 },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="border-b border-gray-200 bg-gray-50 px-5 pb-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Link href="/home" asChild>
            <Pressable>
              <ChevronLeft size={28} color="#6B7280" />
            </Pressable>
          </Link>
          <Text className="text-2xl font-bold text-gray-900">Project</Text>
          <Pressable onPress={() => setIsCreateModal(true)}>
            <Plus size={28} color="#9333EA" />
          </Pressable>
        </View>

        {/* Search */}
        <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
          <Search size={20} color="#9CA3AF" className="mr-3" />
          <TextInput placeholder="Search" className="flex-1 text-gray-700" />
        </View>

        {/* Tabs */}
        <View className="mt-5 flex-row rounded-2xl bg-white p-1 shadow-sm">
          {(['Projects', 'Completed', 'Flag'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 rounded-xl py-2.5 ${tab === t ? 'bg-purple-600' : ''}`}>
              <Text
                className={`text-center text-sm font-semibold ${tab === t ? 'text-white' : 'text-gray-600'}`}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-6 space-y-4 px-5">
          {projects.map((p) => (
            <Pressable
              key={p.id}
              className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              {/* Title + Members */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-gray-900">{p.name}</Text>
                <View className="flex-row -space-x-2">
                  {[...Array(p.members)].map((_, i) => (
                    <View
                      key={i}
                      className="h-9 w-9 rounded-full border-2 border-white bg-gray-300"
                    />
                  ))}
                  <View className="h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-purple-100">
                    <Text className="text-xs font-bold text-purple-600">+{p.members}</Text>
                  </View>
                </View>
              </View>

              {/* Date */}
              <View className="mb-3 flex-row items-center text-xs text-gray-500">
                <Text>01/01/2021</Text>
                <Text className="mx-2">→</Text>
                <Text>01/02/2021</Text>
              </View>

              {/* Progress Bar */}
              <View className="mb-1 flex-row items-center justify-between">
                <View className="mr-4 h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <View
                    className="h-full rounded-full bg-purple-600"
                    style={{ width: `${p.progress}%` }}
                  />
                </View>
                <Text className="text-xs text-gray-500">{p.tasks} tasks</Text>
              </View>
              <Text className="text-right text-sm font-medium text-purple-600">{p.progress}%</Text>
            </Pressable>
          ))}
        </View>
        <View className="h-40" />
      </ScrollView>

      {/* Create Project Modal */}
      <CreateProjectModal isVisible={isCreateModal} onClose={() => setIsCreateModal(false)} />
    </View>
  );
}

// ───────────────────────────────────────
// Create Project Modal (separate component)
// ───────────────────────────────────────
function CreateProjectModal({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} backdropOpacity={0.5}>
      <View className="mx-4 rounded-3xl bg-white p-6">
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">Create project</Text>
          <Pressable onPress={onClose}>
            <X size={24} color="#6B7280" />
          </Pressable>
        </View>

        {/* Name */}
        <Text className="mb-2 text-sm text-gray-700">Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Text"
          className="mb-5 rounded-2xl border border-purple-200 bg-gray-50 px-4 py-4 text-gray-900"
        />

        {/* Members */}
        <Text className="mb-3 text-sm text-gray-700">Add member</Text>
        <View className="mb-6 flex-row items-center">
          <View className="mr-3 h-12 w-12 rounded-full bg-gray-600" />
          <View className="mr-3 h-12 w-12 rounded-full bg-pink-500" />
          <View className="mr-3 h-12 w-12 rounded-full bg-yellow-500" />
          <Pressable className="h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-purple-400">
            <Plus size={20} color="#9333EA" />
          </Pressable>
        </View>

        {/* Date */}
        <Text className="mb-3 text-sm text-gray-700">Date and time</Text>
        <View className="mb-6 flex-row justify-between">
          <View className="flex-row items-center rounded-2xl bg-purple-100 px-4 py-3">
            <Clock size={18} color="#9333EA" className="mr-2" />
            <Text className="font-medium text-purple-700">Jan 1 2021</Text>
          </View>
          <View className="flex-row items-center rounded-2xl bg-purple-100 px-4 py-3">
            <Clock size={18} color="#9333EA" className="mr-2" />
            <Text className="font-medium text-purple-700">Jan 1 2021</Text>
          </View>
        </View>

        {/* Label */}
        <Text className="mb-3 text-sm text-gray-700">Add label</Text>
        <View className="mb-6 flex-row">
          {['#E9D5FF', '#FEF3C7', '#CCFBF1', '#FECACA'].map((color) => (
            <View
              key={color}
              className="mr-3 h-12 w-12 rounded-2xl"
              style={{ backgroundColor: color }}
            />
          ))}
          <Pressable className="h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-purple-400">
            <Plus size={20} color="#9333EA" />
          </Pressable>
        </View>

        {/* Description */}
        <Text className="mb-2 text-sm text-gray-700">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Text"
          multiline
          className="text-top mb-8 h-32 rounded-2xl border border-purple-200 bg-gray-50 px-4 py-4 text-gray-900"
        />

        {/* Create Button */}
        <Pressable className="flex-row items-center justify-center rounded-2xl bg-purple-600 py-4">
          <Text className="mr-2 text-lg font-bold text-white">Create</Text>
          <Text className="text-2xl text-white">→</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
