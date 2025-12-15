// app/(tabs)/home.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Bell, TrendingUp } from 'lucide-react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/lib/services/dashboard';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Analytics'>('Overview');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    select: (response) => response.data, // This fixes the error!
  });

  // Now `data` is your actual JSON object
  const overview = data?.overview;
  const analytics = data?.analytics;
  const stats = data?.stats;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-10">
        <Text className="text-center text-gray-500">Failed to load dashboard</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="border-b border-gray-200 bg-gray-50 px-5 pb-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>
          <Pressable>
            <Bell size={24} color="#6B7280" />
          </Pressable>
        </View>

        <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
          <Search size={20} color="#9CA3AF" className="mr-3" />
          <Text className="flex-1 text-gray-500">Search</Text>
        </View>

        <View className="mt-5 flex-row rounded-2xl bg-white p-1 shadow-sm">
          {(['Overview', 'Analytics'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 rounded-xl py-2.5 ${activeTab === tab ? 'bg-purple-600' : ''}`}>
              <Text
                className={`text-center text-sm font-semibold ${activeTab === tab ? 'text-white' : 'text-gray-600'}`}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'Overview' ? (
          <>
            {/* Your Project */}
            <View className="mt-6 px-5">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-gray-900">Your project</Text>
                <Text className="text-sm font-medium text-purple-600">Right Arrow</Text>
              </View>

              <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-gray-900">
                    {overview?.project?.name || 'No active project'}
                  </Text>
                  <View className="flex-row -space-x-2">
                    {overview?.project?.members
                      ?.slice(0, 4)
                      .map((_: any, i: number) => (
                        <View
                          key={i}
                          className="h-9 w-9 rounded-full border-2 border-white bg-gray-300"
                        />
                      )) || []}
                    {overview?.project?.members?.length > 4 && (
                      <View className="h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-purple-100">
                        <Text className="text-xs font-bold text-purple-600">
                          +{overview.project.members.length - 4}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="mb-3 flex-row justify-between text-xs text-gray-500">
                  <Text>{overview?.project?.dateRange || 'No deadline'}</Text>
                  <Text>
                    {overview?.project?.doneTasks || 0}/{overview?.project?.totalTasks || 0} tasks
                  </Text>
                </View>

                <View className="h-3 overflow-hidden rounded-full bg-gray-200">
                  <View
                    className="h-full rounded-full bg-purple-600"
                    style={{ width: `${overview?.project?.progress || 0}%` }}
                  />
                </View>
                <Text className="mt-1 text-right text-xs font-medium text-purple-600">
                  {overview?.project?.progress || 0}%
                </Text>
              </View>
            </View>

            {/* Recent Tasks */}
            <View className="mt-8 px-5">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-gray-900">Your recent tasks</Text>
                <Text className="text-sm font-medium text-purple-600">Right Arrow</Text>
              </View>

              {!overview?.recentTasks || overview.recentTasks.length === 0 ? (
                <Text className="py-8 text-center text-gray-500">No recent tasks</Text>
              ) : (
                overview.recentTasks.map((task: any) => (
                  <View
                    key={task.id}
                    className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                      <Text className="text-xl text-purple-600">Up Arrow</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">{task.title}</Text>
                      <Text className="mt-1 text-xs text-gray-500">
                        {task.projectName}
                        {task.deadline && ` • ${new Date(task.deadline).toLocaleDateString()}`}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          /* ANALYTICS TAB */
          <View className="mt-6 px-5">
            <View className="mb-4 flex-row items-center">
              <TrendingUp size={22} color="#FB923C" className="mr-2" />
              <Text className="text-lg font-semibold text-gray-900">Task productivity</Text>
            </View>

            {/* Weekly Bar Chart */}
            <Text className="mb-4 text-sm text-gray-600">Tasks in 7 days</Text>
            <View className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <BarChart
                data={analytics?.weeklyTasks || []}
                barWidth={28}
                spacing={20}
                radius={8}
                height={300}
                maxValue={
                  Math.max(...(analytics?.weeklyTasks?.map((d: any) => d.value) || [1]), 5) + 10
                }
                noOfSections={5}
                frontColor="#9333EA"
                initialSpacing={10}
              />

              <View className="mt-6 flex-row justify-center gap-10">
                <View className="flex-row items-center">
                  <View className="mr-2 h-3 w-3 rounded-full bg-purple-600" />
                  <Text className="font-medium text-purple-600">
                    {stats?.totalTasks || 0} tasks
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="mr-2 h-3 w-3 rounded-full bg-green-500" />
                  <Text className="font-medium text-green-600">
                    {stats?.completionRate || 0}% completed
                  </Text>
                </View>
              </View>
            </View>

            {/* Monthly Line Chart */}
            <Text className="mb-4 text-sm text-gray-600">Tasks this month</Text>
            <View className="relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <LineChart
                data={analytics?.monthlyTasks || []}
                height={300}
                width={320}
                color="#9333EA"
                thickness={4}
                curveType="CATMULL_ROM"
                maxValue={
                  Math.max(...(analytics?.monthlyTasks?.map((d: any) => d.value) || [1]), 5) + 20
                }
                noOfSections={5}
                initialSpacing={30}
                spacing={50}
              />

              <View className="absolute left-1/2 top-32 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-lg">
                <Text className="text-center text-2xl font-bold text-gray-900">
                  {analytics?.totalTasksThisMonth || 0}
                </Text>
                <Text className="text-center text-xs text-gray-500">tasks this month</Text>
              </View>
            </View>
          </View>
        )}

        <View className="h-40" />
      </ScrollView>
    </View>
  );
}
