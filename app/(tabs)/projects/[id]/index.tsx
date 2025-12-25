// app/(tabs)/projects/[id].tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Users,
  Calendar,
  Flag,
  MoreVertical,
  Edit2,
  Check,
  X,
  Trash2,
  Share2,
  Archive,
} from 'lucide-react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectById, updateProject,  } from '@/lib/services/projects';
import Header from '@/components/layout/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

type Project = {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  flag: 'NORMAL' | 'URGENT' | 'CRITICAL';
  createdAt: string;
  owner: { name: string; avatar: string | null };
  team: {
    name: string;
    avatar: string | null;
    members: Array<{ user: { name: string; avatar: string | null } }>;
  };
  tasks: Array<{ id: string; title: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE' }>;
};

const flagConfig = {
  NORMAL: { color: 'bg-gray-100 text-gray-700', label: 'Normal' },
  URGENT: { color: 'bg-orange-100 text-orange-700', label: 'Urgent' },
  CRITICAL: { color: 'bg-red-100 text-red-700', label: 'Critical' },
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFlag, setEditFlag] = useState<'NORMAL' | 'URGENT' | 'CRITICAL'>('NORMAL');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id),
    select: (res) => res.data,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Project>) => updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsEditing(false);
      bottomSheetRef.current?.close();
      Alert.alert('Success', 'Project updated successfully');
    },
    onError: (error: any) => Alert.alert('Error', error.message || 'Failed to update project'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      Alert.alert('Deleted', 'Project has been deleted');
      router.back();
    },
    onError: (error: any) => Alert.alert('Error', error.message || 'Failed to delete project'),
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const completedTasks = project?.tasks.filter((t: any) => t.status === 'DONE').length || 0;
  const totalTasks = project?.tasks.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const openEditSheet = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description || '');
    setEditFlag(project.flag);
    setIsEditing(true);
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleSave = () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }

    updateMutation.mutate({
      name: editName.trim(),
      description: editDescription.trim() || null,
      flag: editFlag,
    });
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality can be implemented with react-native-share');
  };

  const handleArchive = () => {
    Alert.alert('Archive', 'Archive feature coming soon!');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-lg text-gray-500">Project not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        {/* Header with Popup Menu */}
        <Header
          title="Project Detail"
          actions={['edit', 'share', 'archive', 'delete']}
          onEdit={openEditSheet}
          onShare={handleShare}
          onArchive={handleArchive}
          onDelete={confirmDelete}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section with Flag Badge */}
          <View className="bg-gradient-to-br from-purple-600 to-purple-800 px-6 py-8">
            <View className="mb-3 flex-row items-start justify-between">
              <Text className="flex-1 pr-4 text-3xl font-bold ">{project.name}</Text>
              <View className={`rounded-full px-4 py-2 ${flagConfig[project.flag].color}`}>
                <Text className="text-sm font-bold">{flagConfig[project.flag].label}</Text>
              </View>
            </View>
            {project.description ? (
              <Text className="text-lg text-purple-400">{project.description}</Text>
            ) : (
              <Text className="italic text-purple-200">No description</Text>
            )}
          </View>

          {/* Progress */}
          <View className="mx-6 mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">Progress</Text>
              <Text className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</Text>
            </View>
            <View className="h-4 overflow-hidden rounded-full bg-gray-200">
              <View
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-700"
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="mt-2 text-sm text-gray-500">
              {completedTasks} of {totalTasks} tasks completed
            </Text>
          </View>

          {/* Details Cards - same as before */}
          <View className="mx-6 mt-6 gap-y-5">
            {/* Owner */}
            <View className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <View className="flex-row items-center">
                <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                  <Text className="text-2xl font-bold text-purple-600">
                    {project.owner.name[0].toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm text-gray-500">Owner</Text>
                  <Text className="text-lg font-semibold text-gray-900">{project.owner.name}</Text>
                </View>
              </View>
            </View>

            {/* Team */}
            <Pressable className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Users size={24} color="#9333EA" className="mr-4" />
                  <View>
                    <Text className="text-sm text-gray-500">Team</Text>
                    <Text className="text-lg font-semibold text-gray-900">{project.team.name}</Text>
                  </View>
                </View>
                <View className="rounded-full bg-purple-100 px-3 py-1">
                  <Text className="text-sm font-bold text-purple-700">
                    {project.team.members.length} members
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Timeline */}
            <View className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <View className="mb-4 flex-row items-center">
                <Calendar size={24} color="#9333EA" className="mr-4" />
                <Text className="text-lg font-bold text-gray-900">Timeline</Text>
              </View>
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Start Date</Text>
                  <Text className="font-medium text-gray-900">{formatDate(project.startDate)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">End Date</Text>
                  <Text className="font-medium text-gray-900">{formatDate(project.endDate)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Created</Text>
                  <Text className="font-medium text-gray-900">{formatDate(project.createdAt)}</Text>
                </View>
              </View>
            </View>

            {/* Tasks Preview */}
            <View className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-gray-900">Tasks</Text>
                <Text className="font-semibold text-purple-600">{totalTasks} total</Text>
              </View>
              {project.tasks.length === 0 ? (
                <Text className="py-8 text-center text-gray-500">No tasks yet</Text>
              ) : (
                <View className="space-y-3">
                  {project.tasks.slice(0, 5).map((task: any) => (
                    <View
                      key={task.id}
                      className="flex-row items-center justify-between border-b border-gray-100 py-3 last:border-0">
                      <Text
                        className={`text-base ${
                          task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'
                        }`}>
                        {task.title}
                      </Text>
                      {task.status === 'DONE' && <Check size={20} color="#10B981" />}
                    </View>
                  ))}
                  {project.tasks.length > 5 && (
                    <Pressable
                      onPress={() => router.push(`/projects/${id}/tasks`)}
                      className="mt-4 border-t border-gray-200 pt-4">
                      <Text className="text-center font-semibold text-purple-600">
                        View all {project.tasks.length} tasks →
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </View>

          <View className="h-32" />
        </ScrollView>
      </SafeAreaView>

      {/* Edit Project Bottom Sheet (unchanged) */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['80%']}
        enablePanDownToClose
        onClose={() => setIsEditing(false)}
        backgroundStyle={{ backgroundColor: '#FFFFFF' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 50 }}>
        <View className="flex-1">
          <View className="flex-row items-center justify-between border-b border-gray-100 px-6 pb-3 pt-4">
            <Text className="text-2xl font-bold text-gray-900">Edit Project</Text>
            <Pressable onPress={() => bottomSheetRef.current?.close()}>
              <X size={28} color="#6B7280" />
            </Pressable>
          </View>

          <BottomSheetScrollView>
            <View className="px-6 pb-32">
              <Text className="mb-3 mt-6 text-base font-medium text-gray-700">
                Project Name <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter project name"
                className="rounded-2xl border border-gray-300 bg-white px-5 py-4 text-base"
              />

              <Text className="mb-3 mt-6 text-base font-medium text-gray-700">Priority Flag</Text>
              <View className="flex-row gap-3">
                {(['NORMAL', 'URGENT', 'CRITICAL'] as const).map((flag) => (
                  <Pressable
                    key={flag}
                    onPress={() => setEditFlag(flag)}
                    className={`flex-1 rounded-2xl py-4 ${
                      editFlag === flag
                        ? flagConfig[flag].color
                        : 'border border-gray-300 bg-gray-100'
                    }`}>
                    <Text
                      className={`text-center font-semibold ${
                        editFlag === flag ? 'text-gray-700' : 'text-gray-700'
                      }`}>
                      {flagConfig[flag].label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="mb-3 mt-6 text-base font-medium text-gray-700">
                Description (Optional)
              </Text>
              <TextInput
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Add a description..."
                multiline
                numberOfLines={6}
                className="rounded-2xl border border-gray-300 bg-white px-5 py-4 text-base"
                style={{ textAlignVertical: 'top' }}
              />

              <Pressable
                onPress={handleSave}
                disabled={updateMutation.isPending || !editName.trim()}
                className={`mt-12 rounded-2xl py-5 shadow-lg ${
                  editName.trim() && !updateMutation.isPending ? 'bg-purple-600' : 'bg-gray-300'
                }`}>
                {updateMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center text-xl font-bold text-white">Save Changes</Text>
                )}
              </Pressable>
            </View>
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}
