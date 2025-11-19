// app/(tabs)/tasks.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Search, Plus, ChevronLeft, X, Check, Circle, Flag, Clock } from 'lucide-react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyAssignedTasks, getMyCreatedTasks, createTask } from '@/lib/services/tasks';
import { getProjects } from '@/lib/services/projects';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  endDate: string | null;
  project: { id: string; name: string };
  flagged?: boolean;
};

type TabType = 'assigned' | 'created';

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['94%'], []);

  const [activeTab, setActiveTab] = useState<TabType>('assigned');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Fetch real tasks based on tab
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', activeTab],
    queryFn: activeTab === 'assigned' ? getMyAssignedTasks : getMyCreatedTasks,
    select: (res) =>
      res.data.map((t: any) => ({
        ...t,
        flagged: t.flag === 'FLAGGED',
      })),
  });

  // Fetch projects for create form
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    select: (res) => res.data,
  });

  React.useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeTab] });
      queryClient.invalidateQueries({
        queryKey: ['tasks', activeTab === 'assigned' ? 'created' : 'assigned'],
      });
      bottomSheetRef.current?.close();
      setTitle('');
      setDescription('');
      Alert.alert('Success', 'Task created!');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DONE' }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const flagMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag: 'FLAGGED' }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const openSheet = () => bottomSheetRef.current?.snapToIndex(0);
  const closeSheet = () => {
    bottomSheetRef.current?.close();
    setTitle('');
    setDescription('');
  };

  const renderRightActions = (task: Task) => (
    <View className="flex-row">
      <Pressable
        onPress={() => flagMutation.mutate(task.id)}
        className="justify-center bg-purple-600 px-6">
        <Flag size={24} color="white" fill={task.flagged ? 'white' : 'none'} />
      </Pressable>
      {task.status !== 'DONE' && (
        <Pressable
          onPress={() => completeMutation.mutate(task.id)}
          className="justify-center bg-green-500 px-6">
          <Check size={24} color="white" />
        </Pressable>
      )}
    </View>
  );

  const onCreate = () => {
    if (!title.trim()) return Alert.alert('Error', 'Task name required');
    if (!selectedProject) return Alert.alert('Error', 'Select a project');

    createMutation.mutate({
      title: title.trim(),
      description: description || null,
      projectId: selectedProject.id,
      priority: 'MEDIUM',
    });
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
          <Text className="text-2xl font-bold text-gray-900">My Tasks</Text>
          <Pressable onPress={openSheet}>
            <Plus size={28} color="#9333EA" />
          </Pressable>
        </View>

        {/* Search */}
        <View className="mb-4 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
          <Search size={20} color="#9CA3AF" className="mr-3" />
          <TextInput placeholder="Search tasks..." className="flex-1 text-gray-700" />
        </View>

        {/* Tabs */}
        <View className="flex-row rounded-2xl bg-white p-1 shadow-sm">
          <Pressable
            onPress={() => setActiveTab('assigned')}
            className={`flex-1 rounded-xl py-3 ${activeTab === 'assigned' ? 'bg-purple-600' : ''}`}>
            <Text
              className={`text-center font-semibold ${activeTab === 'assigned' ? 'text-white' : 'text-gray-600'}`}>
              Assigned to Me
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('created')}
            className={`flex-1 rounded-xl py-3 ${activeTab === 'created' ? 'bg-purple-600' : ''}`}>
            <Text
              className={`text-center font-semibold ${activeTab === 'created' ? 'text-white' : 'text-gray-600'}`}>
              Created by Me
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Tasks List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      ) : tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center text-lg text-gray-500">
            {activeTab === 'assigned' ? 'No tasks assigned tasks' : 'No tasks created by you'}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mt-6 space-y-4 px-5 pb-40">
            {tasks.map((task: Task) => (
              <Swipeable key={task.id} renderRightActions={() => renderRightActions(task)}>
                <Pressable
                  className={`rounded-3xl border-2 bg-white p-5 shadow-sm ${task.flagged ? 'border-purple-500' : 'border-gray-100'}`}>
                  <View className="mb-3 flex-row items-start justify-between">
                    <Text
                      className={`text-lg font-bold ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </Text>
                    {task.flagged && <Flag size={20} color="#9333EA" fill="#9333EA" />}
                  </View>

                  <Text className="mb-2 text-sm text-gray-600">{task.project.name}</Text>

                  {task.endDate && (
                    <View className="mb-3 flex-row items-center">
                      <Clock size={16} color="#9333EA" className="mr-2" />
                      <Text className="text-sm text-purple-700">
                        {new Date(task.endDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center">
                    {task.status === 'DONE' ? (
                      <Check size={20} color="#10B981" />
                    ) : (
                      <Circle size={20} color="#D1D5DB" />
                    )}
                    <Text
                      className={`ml-2 text-sm ${task.status === 'DONE' ? 'text-gray-500' : 'text-gray-700'}`}>
                      {task.status === 'DONE' ? 'Completed' : 'Mark as done'}
                    </Text>
                  </View>
                </Pressable>
              </Swipeable>
            ))}
          </View>
        </ScrollView>
      )}

      {/* CREATE TASK SHEET */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={closeSheet}
        backgroundStyle={{ backgroundColor: '#FFFFFF' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}>
        <View className="flex-1">
          <View className="flex-row items-center justify-between px-6 pb-3 pt-4">
            <Text className="text-xl font-bold">Create Task</Text>
            <Pressable onPress={closeSheet}>
              <X size={24} color="#6B7280" />
            </Pressable>
          </View>

          <BottomSheetScrollView>
            <View className="px-6 pb-20 pt-4">
              <Text className="mb-2 text-sm text-gray-700">Task Name</Text>
              <TextInput
                placeholder="Enter task title"
                value={title}
                onChangeText={setTitle}
                className="mb-6 rounded-2xl border-2 border-purple-300 bg-white px-5 py-4"
              />

              <Text className="mb-2 text-sm text-gray-700">Project</Text>
              <Pressable className="mb-6 rounded-2xl bg-gray-50 px-4 py-3">
                <Text className="text-base">{selectedProject?.name || 'Select project'}</Text>
              </Pressable>

              <Text className="mb-2 text-sm text-gray-700">Description (optional)</Text>
              <TextInput
                placeholder="Add description..."
                value={description}
                onChangeText={setDescription}
                multiline
                className="rounded-2xl border-2 border-purple-300 bg-white px-5 py-4"
                style={{ textAlignVertical: 'top', height: 100 }}
              />

              <Pressable
                onPress={onCreate}
                disabled={createMutation.isPending || !title.trim()}
                className={`mt-8 flex-row justify-center rounded-2xl py-4 ${title.trim() ? 'bg-purple-600' : 'bg-gray-300'}`}>
                {createMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text
                    className={`text-lg font-bold ${title.trim() ? 'text-white' : 'text-gray-500'}`}>
                    Create Task Right Arrow
                  </Text>
                )}
              </Pressable>
            </View>
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </View>
  );
}
