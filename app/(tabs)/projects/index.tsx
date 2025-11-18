// app/(tabs)/projects.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Search, Plus, ChevronLeft, X, Clock, Plus as PlusIcon } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

const projects = [
  { id: 1, name: 'Mane UIKit', progress: 50, tasks: '2/48', members: 4 },
  { id: 2, name: 'Mane UIKit', progress: 50, tasks: '2/48', members: 4 },
  { id: 3, name: 'Mane UIKit', progress: 50, tasks: '2/48', members: 4 },
];

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Snap points: 92% height
  const snapPoints = useMemo(() => ['92%'], []);

  // Open bottom sheet
  const openSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
    setIsSheetOpen(true);
  }, []);

  // Close bottom sheet
  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsSheetOpen(false);
  }, []);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    setIsSheetOpen(index >= 0);
  }, []);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle start date change
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  // Handle end date change
  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Handle start time change
  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  // Handle end time change
  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

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
          <Pressable onPress={openSheet}>
            <Plus size={28} color="#9333EA" />
          </Pressable>
        </View>

        <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
          <Search size={20} color="#9CA3AF" className="mr-3" />
          <TextInput placeholder="Search" className="flex-1 text-gray-700" />
        </View>

        <View className="mt-5 flex-row rounded-2xl bg-white p-1 shadow-sm">
          {['Projects', 'Completed', 'Flag'].map((t) => (
            <Pressable key={t} className="flex-1 rounded-xl bg-purple-600 py-2.5">
              <Text className="text-center text-sm font-semibold text-white">{t}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Projects List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-6 space-y-4 px-5 pb-40">
          {projects.map((p) => (
            <Pressable
              key={p.id}
              className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
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

              <View className="mb-3 flex-row items-center text-xs text-gray-500">
                <Text>01/01/2021</Text>
                <Text className="mx-2">→</Text>
                <Text>01/02/2021</Text>
              </View>

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
      </ScrollView>

      {/* Bottom Sheet – Only render when needed */}
      {isSheetOpen && (
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onChange={handleSheetChanges}
          backdropComponent={({ style }) => (
            <View style={[style, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
          )}
          handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
          backgroundStyle={{ backgroundColor: '#FAFAFA', borderRadius: 32 }}>
          <View className="flex-1">
            <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
              <Text className="text-xl font-bold text-gray-900">Create project</Text>
              <Pressable onPress={closeSheet}>
                <X size={24} color="#6B7280" />
              </Pressable>
            </View>

            <BottomSheetScrollView>
              <View className="px-6 pb-10">
                <Text className="mb-2 mt-4 text-sm text-gray-700">Name</Text>
                <TextInput
                  placeholder="Project name"
                  className="rounded-2xl border border-purple-200 bg-gray-50 px-4 py-4 text-base"
                />

                <Text className="mb-3 mt-6 text-sm text-gray-700">Add member</Text>
                <View className="mb-6 flex-row items-center">
                  <View className="mr-3 h-12 w-12 rounded-full bg-gray-600" />
                  <View className="mr-3 h-12 w-12 rounded-full bg-pink-500" />
                  <View className="mr-3 h-12 w-12 rounded-full bg-yellow-500" />
                  <Pressable className="h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-purple-400">
                    <PlusIcon size={20} color="#9333EA" />
                  </Pressable>
                </View>

                <Text className="mb-3 text-sm text-gray-700">Date and time</Text>
                <View className="mb-6 flex-row justify-between">
                  {/* Start Date Picker */}
                  <View className="flex-1 mr-2">
                    <Text className="mb-2 text-xs text-gray-500">Start Date</Text>
                    <Pressable 
                      onPress={() => setShowStartDatePicker(true)}
                      className="flex-row items-center rounded-2xl bg-purple-100 px-4 py-3.5"
                    >
                      <Clock size={18} color="#9333EA" className="mr-2" />
                      <Text className="font-medium text-purple-700">{formatDate(startDate)}</Text>
                    </Pressable>
                  </View>

                  {/* End Date Picker */}
                  <View className="flex-1 ml-2">
                    <Text className="mb-2 text-xs text-gray-500">End Date</Text>
                    <Pressable 
                      onPress={() => setShowEndDatePicker(true)}
                      className="flex-row items-center rounded-2xl bg-purple-100 px-4 py-3.5"
                    >
                      <Clock size={18} color="#9333EA" className="mr-2" />
                      <Text className="font-medium text-purple-700">{formatDate(endDate)}</Text>
                    </Pressable>
                  </View>
                </View>

                <View className="mb-6 flex-row justify-between">
                  {/* Start Time Picker */}
                  <View className="flex-1 mr-2">
                    <Text className="mb-2 text-xs text-gray-500">Start Time</Text>
                    <Pressable 
                      onPress={() => setShowStartTimePicker(true)}
                      className="flex-row items-center rounded-2xl bg-purple-100 px-4 py-3.5"
                    >
                      <Clock size={18} color="#9333EA" className="mr-2" />
                      <Text className="font-medium text-purple-700">{formatTime(startDate)}</Text>
                    </Pressable>
                  </View>

                  {/* End Time Picker */}
                  <View className="flex-1 ml-2">
                    <Text className="mb-2 text-xs text-gray-500">End Time</Text>
                    <Pressable 
                      onPress={() => setShowEndTimePicker(true)}
                      className="flex-row items-center rounded-2xl bg-purple-100 px-4 py-3.5"
                    >
                      <Clock size={18} color="#9333EA" className="mr-2" />
                      <Text className="font-medium text-purple-700">{formatTime(endDate)}</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Date Pickers */}
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onStartDateChange}
                  />
                )}

                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onEndDateChange}
                  />
                )}

                {/* Time Pickers */}
                {showStartTimePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onStartTimeChange}
                  />
                )}

                {showEndTimePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onEndTimeChange}
                  />
                )}

                <Text className="mb-3 text-sm text-gray-700">Add label</Text>
                <View className="mb-6 flex-row">
                  {['#E9D5FF', '#FEF3C7', '#CCFBF1', '#FECACA'].map((c) => (
                    <View
                      key={c}
                      className="mr-3 h-12 w-12 rounded-2xl"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <Pressable className="h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-purple-400">
                    <PlusIcon size={20} color="#9333EA" />
                  </Pressable>
                </View>

                <Text className="mb-2 text-sm text-gray-700">Description</Text>
                <TextInput
                  placeholder="Project description"
                  multiline
                  numberOfLines={6}
                  className="rounded-2xl border border-purple-200 bg-gray-50 px-4 py-4 text-base"
                  style={{ textAlignVertical: 'top' }}
                />

                <Pressable className="mt-8 flex-row items-center justify-center rounded-2xl bg-purple-600 py-4">
                  <Text className="mr-2 text-lg font-bold text-white">Create</Text>
                  <Text className="text-2xl text-white">→</Text>
                </Pressable>
              </View>
            </BottomSheetScrollView>
          </View>
        </BottomSheet>
      )}
    </View>
  );
}