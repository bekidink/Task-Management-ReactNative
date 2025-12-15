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
import {
  Search,
  Plus,
  ChevronLeft,
  X,
  Check,
  Circle,
  Flag,
  Clock,
  ChevronDown,
} from 'lucide-react-native';
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

type Project = {
  id: string;
  name: string;
  _count: { tasks: number };
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', activeTab],
    queryFn: activeTab === 'assigned' ? getMyAssignedTasks : getMyCreatedTasks,
    select: (res) =>
      res.data.map((t: any) => ({
        ...t,
        flagged: t.flag === 'FLAGGED',
      })),
  });

  // Fetch real projects for dropdown
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    select: (res) => res.data || [],
  });

  // Auto-select first project
  React.useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      bottomSheetRef.current?.close();
      setTitle('');
      setDescription('');
      Alert.alert('Success', 'Task created successfully!');
    },
    onError: (error: any) => Alert.alert('Error', error.message || 'Failed to create task'),
  });

  const openSheet = () => bottomSheetRef.current?.snapToIndex(0);
  const closeSheet = () => {
    bottomSheetRef.current?.close();
    setTitle('');
    setDescription('');
    setShowProjectDropdown(false);
  };

  const onCreate = () => {
    if (!title.trim()) return Alert.alert('Error', 'Task name is required');
    if (!selectedProject) return Alert.alert('Error', 'Please select a project');

    createMutation.mutate({
      title: title.trim(),
      description: description || null,
      projectId: selectedProject.id,
      priority: 'MEDIUM' as const,
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

        <View className="mb-4 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
          <Search size={20} color="#9CA3AF" className="mr-3" />
          <TextInput placeholder="Search tasks..." className="flex-1 text-gray-700" />
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
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      ) : tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center text-lg text-gray-500">
            {activeTab === 'assigned' ? 'No tasks assigned to you' : 'No tasks created by you'}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mt-6 space-y-4 px-5 pb-40">
            {tasks.map((task: Task) => (
              <Swipeable
                key={task.id}
                renderRightActions={() => (
                  <View className="flex-row">
                    <Pressable className="justify-center bg-purple-600 px-6">
                      <Flag size={24} color="white" fill={task.flagged ? 'white' : 'none'} />
                    </Pressable>
                    {task.status !== 'DONE' && (
                      <Pressable className="justify-center bg-green-500 px-6">
                        <Check size={24} color="white" />
                      </Pressable>
                    )}
                  </View>
                )}>
                <Link
 href={`/tasks/${task.id}`}
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
                        {new Date(task.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
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
                </Link>
              </Swipeable>
            ))}
          </View>
        </ScrollView>
      )}

      {/* CREATE TASK BOTTOM SHEET */}
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
              {/* Task Name */}
              <Text className="mb-2 text-sm text-gray-700">Task Name</Text>
              <TextInput
                placeholder="Enter task title"
                value={title}
                onChangeText={setTitle}
                className="mb-6 rounded-2xl border-2 border-purple-300 bg-white px-5 py-4 text-base"
              />

              {/* Project Dropdown */}
              <Text className="mb-2 text-sm text-gray-700">Project</Text>
              <Pressable
                onPress={() => setShowProjectDropdown(!showProjectDropdown)}
                className="mb-2 flex-row items-center justify-between rounded-2xl border-2 border-purple-300 bg-white px-5 py-4">
                <Text className="text-base text-gray-900">
                  {selectedProject?.name || 'Select a project'}
                </Text>
                <ChevronDown size={20} color="#9333EA" />
              </Pressable>

              {/* Dropdown List */}
              {showProjectDropdown && (
                <View className="mb-6 max-h-64 rounded-2xl border-2 border-purple-200 bg-white shadow-lg">
                  <ScrollView nestedScrollEnabled>
                    {projectsLoading ? (
                      <View className="py-4">
                        <ActivityIndicator color="#9333EA" />
                      </View>
                    ) : projects.length === 0 ? (
                      <Text className="py-4 text-center text-gray-500">No projects found</Text>
                    ) : (
                      projects.map((project: Project) => (
                        <Pressable
                          key={project.id}
                          onPress={() => {
                            setSelectedProject(project);
                            setShowProjectDropdown(false);
                          }}
                          className="border-b border-gray-100 px-5 py-4 last:border-b-0">
                          <Text className="text-base font-medium text-gray-900">
                            {project.name}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {project._count.tasks} tasks
                          </Text>
                        </Pressable>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}

              {/* Description */}
              <Text className="mb-2 text-sm text-gray-700">Description (optional)</Text>
              <TextInput
                placeholder="Add description..."
                value={description}
                onChangeText={setDescription}
                multiline
                className="rounded-2xl border-2 border-purple-300 bg-white px-5 py-4"
                style={{ textAlignVertical: 'top', height: 120 }}
              />

              {/* Create Button */}
              <Pressable
                onPress={onCreate}
                disabled={createMutation.isPending || !title.trim() || !selectedProject}
                className={`mt-10 rounded-2xl py-5 ${
                  title.trim() && selectedProject ? 'bg-purple-600' : 'bg-gray-300'
                }`}>
                {createMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center text-lg font-bold text-white">Create Task</Text>
                )}
              </Pressable>
            </View>
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </View>
  );
}
