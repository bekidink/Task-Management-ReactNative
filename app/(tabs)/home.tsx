// app/(tabs)/home.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Search, Plus, Bell, MoreVertical, TrendingUp } from 'lucide-react-native';

// Gifted Charts – Simple, stable, Expo-ready
import { BarChart, LineChart } from 'react-native-gifted-charts';

// Mock data
const weeklyData = [
  { value: 160, label: 'Mon', frontColor: '#FB923C' },
  { value: 180, label: 'Tue', frontColor: '#9333EA' },
  { value: 140, label: 'Wed', frontColor: '#9333EA' },
  { value: 120, label: 'Thu', frontColor: '#9333EA' },
  { value: 170, label: 'Fri', frontColor: '#9333EA' },
  { value: 100, label: 'Sat', frontColor: '#9333EA' },
  { value: 90, label: 'Sun', frontColor: '#FB923C' },
];

const monthlyData = [
  { value: 80, label: '1' },
  { value: 110, label: '7' },
  { value: 160, label: '14' },
  { value: 90, label: '21' },
  { value: 140, label: '28' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Analytics'>('Overview');

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
          <MoreVertical size={20} color="#9CA3AF" />
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
          /* OVERVIEW TAB – Unchanged, Figma-Perfect */
          <>
            <View className="mt-6 px-5">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-gray-900">Your project</Text>
                <Text className="text-sm font-medium text-purple-600">→</Text>
              </View>

              <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-gray-900">Mane UIKit</Text>
                  <View className="flex-row -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <View
                        key={i}
                        className="h-9 w-9 rounded-full border-2 border-white bg-gray-300"
                      />
                    ))}
                    <View className="h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-purple-100">
                      <Text className="text-xs font-bold text-purple-600">+4</Text>
                    </View>
                  </View>
                </View>

                <View className="mb-3 flex-row justify-between text-xs text-gray-500">
                  <Text>01/01/2021 → 01/02/2021</Text>
                  <Text>2/48 tasks</Text>
                </View>

                <View className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <View className="h-full rounded-full bg-purple-600" style={{ width: '50%' }} />
                </View>
                <Text className="mt-1 text-right text-xs font-medium text-purple-600">50%</Text>
              </View>
            </View>

            <View className="mt-8 px-5">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-gray-900">Your recent tasks</Text>
                <Text className="text-sm font-medium text-purple-600">→</Text>
              </View>

              {['Userflow Mane UIKit', 'Userflow Mane UIKit'].map((task, i) => (
                <View
                  key={i}
                  className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                    <Text className="text-xl text-purple-600">↑</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">{task}</Text>
                    {i === 0 && (
                      <Text className="mt-1 text-xs text-gray-500">Deadline: 03/12/2021</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          /* ANALYTICS TAB – Gifted-Charts Bar & Line */
          <View className="mt-6 px-5">
            <View className="mb-4 flex-row items-center">
              <TrendingUp size={22} color="#FB923C" className="mr-2" />
              <Text className="text-lg font-semibold text-gray-900">Task productivity</Text>
            </View>

            {/* Bar Chart – 7 Days */}
            <Text className="mb-4 text-sm text-gray-600">Tasks in 7 days</Text>
            <View className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <BarChart
                data={weeklyData}
                barWidth={28}
                spacing={20}
                radius={8} // Rounded corners like Figma
                yAxisLabelTextNumberOfLines={3}
                xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 12 }}
                yAxisLabelTextStyle={{ color: '#6B7280', fontSize: 12 }}
                yAxisTextNumberOfLines={3}
                height={300}
                showGrid={true}
                gridColor="#E5E7EB"
                initialSpacing={0}
                noOfSections={7}
                maxValue={200}
                yAxisOffset={10}
              />

              <View className="mt-4 flex-row justify-center gap-10">
                <View className="flex-row items-center">
                  <View className="mr-2 h-3 w-3 rounded-full bg-orange-500" />
                  <Text className="font-medium text-orange-500">108 tasks</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="mr-2 h-3 w-3 rounded-full bg-purple-600" />
                  <Text className="font-medium text-purple-600">7 projects</Text>
                </View>
              </View>
            </View>

            {/* Line Chart – This Month */}
            <Text className="mb-4 text-sm text-gray-600">Tasks in this month</Text>
            <View className="relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <LineChart
                data={monthlyData}
                spacing={50}
                width={320}
                height={300}
                yAxisLabelTextNumberOfLines={3}
                xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 12 }}
                yAxisLabelTextStyle={{ color: '#6B7280', fontSize: 12 }}
                textShiftX={-10}
                textShiftY={10}
                maxValue={180}
                yAxisOffset={10}
                color="#9333EA"
                thickness={4}
                initialSpacing={0}
                showGrid={true}
                gridColor="#E5E7EB"
                curveType="CATMULL_ROM" // Smooth curve like Figma
              />

              <View className="absolute left-1/2 top-32 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-lg">
                <Text className="text-2xl font-bold text-gray-900">90 tasks</Text>
                <Text className="text-center text-xs text-gray-500">Jul, 2021</Text>
              </View>
            </View>
          </View>
        )}

        <View className="h-40" />
      </ScrollView>

      <View className="absolute right-5" style={{ bottom: insets.bottom + 80 }}>
        <Link href="/tasks/new" asChild>
          <Pressable className="h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 shadow-2xl">
            <Plus size={28} color="white" />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
