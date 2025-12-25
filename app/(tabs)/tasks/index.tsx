// app/(tabs)/tasks.tsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
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
import { Link } from 'expo-router';
import { Search, Plus, Check, Circle, Flag, Calendar } from 'lucide-react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyAssignedTasks,
  getMyCreatedTasks,
  createTask,
  updateTaskStatus,
  // toggleTaskFlag,
} from '@/lib/services/tasks';
import { getProjects } from '@/lib/services/projects';
import TaskForm from '@/components/task/TaskForm';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  endDate: string | null;
  flagged: boolean;
  project: { id: string; name: string };
  _count?: { comments: number };
};

type TabType = 'assigned' | 'created';

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['94%'], []);

  const [activeTab, setActiveTab] = useState<TabType>('assigned');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();

  // Fetch tasks based on active tab
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', activeTab],
    queryFn: activeTab === 'assigned' ? getMyAssignedTasks : getMyCreatedTasks,
    select: (res) =>
      res.data.map((t: any) => ({
        ...t,
        flagged: t.flagged || t.flag === 'FLAGGED',
      })),
  });

  // Fetch projects for dropdown
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    select: (res) => res.data || [],
  });

  // Auto-select first project when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string | null;
      projectId: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      attachments?: any[];
    }) => {
      const formData = new FormData();

      // Add text fields
      formData.append('title', data.title);
      formData.append('projectId', data.projectId);
      formData.append('priority', data.priority);
      if (data.description) {
        formData.append('description', data.description);
      }

      // Add attachments if any
      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach((attachment, index) => {
          formData.append('files', attachment);
        });
      }

      return createTask(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      closeSheet();
      Alert.alert('Success', 'Task created successfully!');
    },
    onError: (error: any) => Alert.alert('Error', error.message || 'Failed to create task'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task['status'] }) =>
      updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // const toggleFlagMutation = useMutation({
  //   mutationFn: toggleTaskFlag,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['tasks'] });
  //   },
  // });

  const openSheet = () => bottomSheetRef.current?.snapToIndex(0);

  const closeSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handleCreateTask = async (data: any) => {
    await createMutation.mutateAsync(data);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="border-b border-gray-200 bg-gray-50 px-5 pb-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Link href="/(tabs)/home" asChild>
            <Pressable>
              <Text className="text-lg font-medium text-purple-600">← Back</Text>
            </Pressable>
          </Link>
          <Text className="text-2xl font-bold text-gray-900">My Tasks</Text>
          <Pressable onPress={openSheet}>
            <Plus size={28} color="#9333EA" />
          </Pressable>
        </View>

        <View className="mb-4 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
          <Search size={20} color="#9CA3AF" className="mr-3" />
          <TextInput placeholder="Search tasks..." className="h-5 flex-1 text-gray-700" />
        </View>

        <View className="flex-row rounded-2xl bg-white p-1 shadow-sm">
          {(['assigned', 'created'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 rounded-xl py-3 ${activeTab === tab ? 'bg-purple-600' : ''}`}>
              <Text
                className={`text-center font-semibold ${activeTab === tab ? 'text-white' : 'text-gray-600'}`}>
                {tab === 'assigned' ? 'Assigned to Me' : 'Created by Me'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Tasks List */}
      {tasksLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      ) : tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Circle size={64} color="#9333EA" className="mb-6 opacity-20" />
          <Text className="text-center text-xl font-semibold text-gray-700">No tasks yet</Text>
          <Text className="mt-2 text-center text-gray-500">
            {activeTab === 'assigned'
              ? 'No tasks assigned to you'
              : "You haven't created any tasks"}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mt-6 space-y-4 px-5 pb-40">
            {tasks.map((task: Task) => (
              <Swipeable
                key={task.id}
                overshootRight={false}
                renderRightActions={() => (
                  <View className="flex-row">
                    <Pressable
                      // onPress={() => toggleFlagMutation.mutate(task.id)}
                      className="justify-center bg-orange-500 px-7">
                      <Flag size={24} color="white" fill={task.flagged ? 'white' : 'none'} />
                    </Pressable>
                    {task.status !== 'DONE' && (
                      <Pressable
                        onPress={() => updateStatusMutation.mutate({ id: task.id, status: 'DONE' })}
                        className="justify-center bg-green-600 px-7">
                        <Check size={24} color="white" />
                      </Pressable>
                    )}
                  </View>
                )}>
                <Link href={`/tasks/${task.id}`} asChild>
                  <Pressable
                    className={`rounded-3xl bg-white p-5 shadow-sm ${
                      task.flagged ? 'border-2 border-orange-400' : 'border border-gray-100'
                    }`}>
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-4">
                        <Text className="mt-3 text-xl font-medium text-purple-700">
                          {task.project.name}
                        </Text>
                        <Text
                          className={`text-2xl font-bold ${
                            task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'
                          }`}>
                          {task.title}
                        </Text>

                        {task.endDate && (
                          <View className="mt-3 flex-row items-center">
                            <Calendar size={16} color="#9333EA" className="mr-2" />
                            <Text className="text-sm text-purple-700">
                              {formatDate(task.endDate)}
                            </Text>
                          </View>
                        )}
                      </View>
                      {task.flagged && <Flag size={22} color="#F97316" fill="#F97316" />}
                    </View>

                    <View className="mt-4 flex-row items-center">
                      {task.status === 'DONE' ? (
                        <Check size={20} color="#10B981" />
                      ) : (
                        <Circle size={20} color="#D1D5DB" />
                      )}
                      <Text
                        className={`ml-2 text-sm font-medium ${
                          task.status === 'DONE' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                        {task.status === 'DONE' ? 'Completed' : task.status.replace('_', ' ')}
                      </Text>
                      {task?._count?.comments > 0 && (
                        <Text className="ml-auto text-xs text-gray-500">
                          {task._count.comments} comment{task._count.comments > 1 ? 's' : ''}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                </Link>
              </Swipeable>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Create Task Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={closeSheet}
        backgroundStyle={{ backgroundColor: '#FFFFFF' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}>
        <TaskForm
          mode="create"
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onSubmit={handleCreateTask}
          onCancel={closeSheet}
          isSubmitting={createMutation.isPending}
        />
      </BottomSheet>
    </View>
  );
}
