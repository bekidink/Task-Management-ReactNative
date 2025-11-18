// app/(tabs)/tasks.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import {
  Search,
  Plus,
  ChevronLeft,
  X,
  Clock,
  AlertCircle,
  Check,
  Circle,
  Flag,
  Plus as PlusIcon,
  Calendar,
  Users,
  ChevronDown,
} from 'lucide-react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Swipeable from 'react-native-gesture-handler/Swipeable';

type Task = {
  id: number;
  title: string;
  project: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  done: boolean;
  flagged: boolean;
};

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Userflow',
    project: 'Mane UIKit',
    deadline: '20/01/2021',
    priority: 'High',
    done: false,
    flagged: false,
  },
  {
    id: 2,
    title: 'Wireframe',
    project: 'Mane UIKit',
    deadline: '20/01/2021',
    priority: 'High',
    done: true,
    flagged: false,
  },
  {
    id: 3,
    title: 'UI design',
    project: 'Mane UIKit',
    deadline: '20/01/2021',
    priority: 'High',
    done: false,
    flagged: true,
  },
];

const projects = [
  { id: 1, name: 'Mane UIKit', color: '#9333EA' },
  { id: 2, name: 'E-commerce App', color: '#3B82F6' },
  { id: 3, name: 'Website Redesign', color: '#10B981' },
  { id: 4, name: 'Mobile Banking', color: '#F59E0B' },
];

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<'Projects' | 'Completed' | 'Flag'>('Projects');
  const [tasks] = useState(mockTasks);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['94%'], []);

  const openSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
    setIsSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsSheetOpen(false);
    setShowProjectDropdown(false);
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    setIsSheetOpen(index >= 0);
    if (index < 0) {
      setShowProjectDropdown(false);
    }
  }, []);

  // Navigate to task detail
  const navigateToTaskDetail = (taskId: number) => {
    router.push(`/tasks/${taskId}` as never);
  };

  const filteredTasks = tasks.filter((t) => {
    if (tab === 'Completed') return t.done;
    if (tab === 'Flag') return t.flagged;
    return true;
  });

  const renderRightActions = (id: number) => (
    <View className="flex-row">
      <TouchableOpacity className="justify-center bg-purple-600 px-6">
        <Flag size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity className="justify-center bg-green-500 px-6">
        <Check size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

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
          <Text className="text-2xl font-bold text-gray-900">Tasks</Text>
          <Pressable onPress={openSheet}>
            <Plus size={28} color="#9333EA" />
          </Pressable>
        </View>

        <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
          <Search size={20} color="#9CA3AF" className="mr-3" />
          <TextInput placeholder="Search" className="flex-1 text-gray-700" />
        </View>

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

      {/* Task Cards */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-6 space-y-4 px-5 pb-40">
          {filteredTasks.map((task) => (
            <Swipeable key={task.id} renderRightActions={() => renderRightActions(task.id)}>
              <Pressable
                onPress={() => navigateToTaskDetail(task.id)}
                className={`rounded-3xl border bg-white p-5 shadow-sm ${task.flagged ? 'border-2 border-purple-500' : 'border-gray-100'}`}>
                <View className="mb-3 flex-row items-start justify-between">
                  <Text className="text-lg font-bold text-gray-900">{task.title}</Text>
                  {task.flagged && <Flag size={20} color="#9333EA" fill="#9333EA" />}
                </View>
                <View className="mb-2 flex-row items-center">
                  <Clock size={16} color="#9333EA" className="mr-2" />
                  <Text className="text-sm text-purple-700">Deadline {task.deadline}</Text>
                </View>
                <View className="mb-3 flex-row items-center">
                  <AlertCircle size={16} color="#FB923C" className="mr-2" />
                  <Text className="text-sm font-medium text-orange-600">
                    Priority {task.priority}
                  </Text>
                </View>
                <Pressable className="flex-row items-center">
                  {task.done ? (
                    <Check size={20} color="#10B981" />
                  ) : (
                    <Circle size={20} color="#D1D5DB" />
                  )}
                  <Text
                    className={`ml-2 ${task.done ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                    {task.done ? 'Done' : 'Mark as done'}
                  </Text>
                </Pressable>
              </Pressable>
            </Swipeable>
          ))}
        </View>
      </ScrollView>

      {/* CREATE TASK BOTTOM SHEET */}
      {isSheetOpen && (
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onChange={handleSheetChanges}
          handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
          backgroundStyle={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
          }}>
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pb-3 pt-4">
              <Text className="text-xl font-bold text-gray-900">Create task</Text>
              <Pressable onPress={closeSheet}>
                <X size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Project Selector */}
            <View className="border-b border-gray-100 px-6 pb-3">
              <Text className="mb-2 text-xs text-gray-500">Project</Text>
              <View className="relative">
                <Pressable
                  onPress={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                  <View className="flex-row items-center">
                    <View
                      className="mr-3 h-3 w-3 rounded-full"
                      style={{ backgroundColor: selectedProject.color }}
                    />
                    <Text className="text-base font-medium text-gray-900">
                      {selectedProject.name}
                    </Text>
                  </View>
                  <ChevronDown size={20} color="#9333EA" />
                </Pressable>

                {/* Project Dropdown */}
                {showProjectDropdown && (
                  <View className="absolute left-0 right-0 top-full z-10 mt-2 rounded-2xl border border-gray-200 bg-white shadow-lg">
                    {projects.map((project) => (
                      <Pressable
                        key={project.id}
                        onPress={() => {
                          setSelectedProject(project);
                          setShowProjectDropdown(false);
                        }}
                        className="flex-row items-center border-b border-gray-100 px-4 py-3 last:border-b-0">
                        <View
                          className="mr-3 h-3 w-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <Text className="text-base font-medium text-gray-900">{project.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <BottomSheetScrollView className="flex-1">
              <View className="px-6 pb-20 pt-6">
                {/* Name */}
                <Text className="mb-2 text-sm text-gray-700">Name</Text>
                <TextInput
                  placeholder="Task name"
                  className="mb-6 rounded-2xl border border-purple-300 bg-white px-5 py-4 text-base"
                  style={{ borderWidth: 1.5 }}
                />

                {/* Add member */}
                <Text className="mb-3 text-sm text-gray-700">Add member</Text>
                <View className="mb-8 flex-row items-center">
                  <View className="mr-4 h-12 w-12 rounded-full bg-gray-600" />
                  <View className="mr-4 h-12 w-12 rounded-full bg-pink-500" />
                  <View className="mr-4 h-12 w-12 rounded-full bg-yellow-500" />
                  <Pressable className="h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-purple-400">
                    <PlusIcon size={20} color="#9333EA" />
                  </Pressable>
                </View>

                {/* Calendar */}
                <Text className="mb-3 text-sm text-gray-700">Calendar</Text>
                <View className="mb-8 flex-row justify-between">
                  <View className="flex-row items-center rounded-2xl bg-purple-100 px-5 py-3.5">
                    <Calendar size={18} color="#9333EA" className="mr-2" />
                    <Text className="font-medium text-purple-700">Jan 1 2021</Text>
                  </View>
                  <View className="flex-row items-center rounded-2xl bg-purple-100 px-5 py-3.5">
                    <Calendar size={18} color="#9333EA" className="mr-2" />
                    <Text className="font-medium text-purple-700">Jan 1 2021</Text>
                  </View>
                </View>

                {/* Add label */}
                <Text className="mb-3 text-sm text-gray-700">Add label</Text>
                <View className="mb-8 flex-row">
                  {['#FCE7F3', '#FEF3C7', '#CCFBF1', '#FECACA'].map((c) => (
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

                {/* Description */}
                <Text className="mb-2 text-sm text-gray-700">Description</Text>
                <TextInput
                  placeholder="Task description"
                  multiline
                  numberOfLines={5}
                  className="mb-10 rounded-2xl border border-purple-300 bg-white px-5 py-4 text-base"
                  style={{ textAlignVertical: 'top', borderWidth: 1.5 }}
                />

                {/* Create Button */}
                <Pressable className="flex-row items-center justify-center rounded-2xl bg-purple-600 py-4 shadow-lg">
                  <Text className="mr-3 text-lg font-bold text-white">Create</Text>
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
