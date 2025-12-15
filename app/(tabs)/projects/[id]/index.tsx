// app/(tabs)/projects/[id].tsx
import React from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Users, Calendar, Clock, Flag, MoreVertical } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getProjectById } from '@/lib/services/projects';

type Project = {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  owner: { name: string; avatar: string | null };
  team: {
    name: string;
    avatar: string | null;
    members: Array<{ user: { name: string; avatar: string | null } }>;
  };
  tasks: Array<{ id: string; title: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE' }>;
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id),
    select: (res) => res.data,
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const completedTasks = project?.tasks.filter((t:any) => t.status === 'DONE').length || 0;
  const totalTasks = project?.tasks.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="border-b border-gray-200 bg-white px-5 py-4 mt-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="-ml-2 p-2">
            <ChevronLeft size={28} color="#374151" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900">Project Detail</Text>
          <Pressable className="p-2">
            <MoreVertical size={24} color="#6B7280" />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="bg-gradient-to-br from-purple-600 to-purple-800 px-6 py-8">
          <Text className="mb-2 text-3xl font-bold ">{project.name}</Text>
          {project.description ? (
            <Text className="text-lg ">{project.description}</Text>
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
              className="h-full rounded-full bg-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text className="mt-2 text-sm text-gray-500">
            {completedTasks} of {totalTasks} tasks completed
          </Text>
        </View>

        {/* Details */}
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

          {/* Dates */}
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
                <Text className="font-medium text-gray-900">
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Tasks List */}
          <View className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">Tasks</Text>
              <Text className="font-semibold text-purple-600">{totalTasks} total</Text>
            </View>
            {project.tasks.length === 0 ? (
              <Text className="py-8 text-center text-gray-500">No tasks yet</Text>
            ) : (
              <View className="space-y-3">
                {project.tasks.slice(0, 5).map((task:any) => (
                  <View
                    key={task.id}
                    className="flex-row items-center justify-between border-b border-gray-100 py-3 last:border-0">
                    <Text
                      className={`text-base ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </Text>
                    {task.status === 'DONE' && (
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-green-500">
                        <Text className="text-xs font-bold text-white">Check</Text>
                      </View>
                    )}
                  </View>
                ))}
                {project.tasks.length > 5 && (
                  <Pressable
                    onPress={() => router.push(`/projects/${id}/tasks`)}
                    className="mt-4 border-t border-gray-200 py-3">
                    <Text className="text-center font-semibold text-purple-600">
                      View all {project.tasks.length} tasks
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>

        <View className="h-32" />
      </ScrollView>
    </View>
  );
}
