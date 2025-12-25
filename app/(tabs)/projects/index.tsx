// app/(tabs)/projects.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Search, Plus, X, Clock, Users, ChevronRight } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProject, getProjects } from '@/lib/services/projects';
import { getTeams } from '@/lib/services/teams';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  teamId: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.date(),
  endTime: z.date(),
  labelColor: z.string().optional(),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

type Project = {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  _count: { tasks: number };
  owner: { name: string; avatar: string | null };
};

type Team = {
  id: string;
  name: string;
  avatar: string | null;
  members: { length: number };
};

const labelColors = ['#E9D5FF', '#FEF3C7', '#CCFBF1', '#FECACA'];

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['92%'], []);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch projects
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    select: (res) => res.data,
  });

  // Fetch teams for selection
  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    select: (res) => res.data,
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      bottomSheetRef.current?.close();
      reset();
    },
    onError: (error: any) => Alert.alert('Error', error.message || 'Failed to create project'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      teamId: '',
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      labelColor: labelColors[0],
    },
    mode: 'onChange',
  });

  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');
  const watchedTeamId = watch('teamId');
  const watchedLabelColor = watch('labelColor');

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const openSheet = useCallback(() => bottomSheetRef.current?.snapToIndex(0), []);
  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    reset();
  }, [reset]);

  const onSubmit = (data: CreateProjectForm) => {
    const startDateTime = new Date(
      data.startDate.getFullYear(),
      data.startDate.getMonth(),
      data.startDate.getDate(),
      data.startTime.getHours(),
      data.startTime.getMinutes()
    );

    const endDateTime = new Date(
      data.endDate.getFullYear(),
      data.endDate.getMonth(),
      data.endDate.getDate(),
      data.endTime.getHours(),
      data.endTime.getMinutes()
    );

    createMutation.mutate({
      name: data.name,
      description: data.description || null,
      teamId: data.teamId || null,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      labelColor: data.labelColor,
    });
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

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
          <Text className="text-2xl font-bold text-gray-900">Projects</Text>
          <Pressable onPress={openSheet}>
            <Plus size={28} color="#9333EA" />
          </Pressable>
        </View>

        <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm">
          <Search size={20} color="#9CA3AF" className="mr-3" />
          <TextInput placeholder="Search projects..." className="flex-1 text-gray-700" />
        </View>

        <View className="mt-5 flex-row rounded-2xl bg-white p-1 shadow-sm">
          {['Active', 'Completed', 'Flagged'].map((tab, i) => (
            <Pressable
              key={tab}
              className={`flex-1 rounded-xl py-2.5 ${i === 0 ? 'bg-primary' : ''}`}>
              <Text
                className={`text-center text-sm font-semibold ${i === 0 ? 'text-white' : 'text-gray-600'}`}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Projects List */}
      {loadingProjects ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      ) : projects.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Users size={64} color="#9333EA" className="mb-6" />
          <Text className="text-center text-xl font-semibold text-gray-700">No projects yet</Text>
          <Text className="mt-2 text-center text-gray-500">
            Create your first project to get started!
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mt-6 space-y-4 px-5 pb-40">
            {projects.map((project: Project) => (
              <Link href={`/projects/${project.id}`} key={project.id} asChild>
                <Pressable className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-gray-900">{project.name}</Text>
                    <View className="flex-row -space-x-2">
                      <Image
                        source={{ uri: project.owner.avatar || 'https://i.pravatar.cc/150' }}
                        className="h-9 w-9 rounded-full border-2 border-white"
                      />
                      <View className="h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-purple-100">
                        <Text className="text-xs font-bold text-purple-600">
                          +{project._count.tasks}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text className="mb-3 text-sm text-gray-600">{project.owner.name}</Text>

                  {(project.startDate || project.endDate) && (
                    <View className="mb-3 flex-row items-center">
                      <Clock size={16} color="#9CA3AF" className="mr-2" />
                      <Text className="text-xs text-gray-500">
                        {formatDate(new Date(project.startDate || new Date()))} →{' '}
                        {formatDate(new Date(project.endDate || new Date()))}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between">
                    <View className="mr-4 h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <View
                        className="h-full rounded-full bg-purple-600"
                        style={{ width: '45%' }}
                      />
                    </View>
                    <Text className="text-sm font-medium text-purple-600">45% Complete</Text>
                  </View>
                  <Text className="mt-1 text-right text-xs text-gray-500">
                    {project._count.tasks} tasks
                  </Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Create Project Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={closeSheet}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
        backgroundStyle={{ backgroundColor: '#FAFAFA' }}>
        <View className="flex-1">
          <View className="flex-row items-center justify-between px-6 pb-3 pt-4">
            <Text className="text-2xl font-bold text-gray-900">Create Project</Text>
            <Pressable onPress={closeSheet}>
              <X size={26} color="#6B7280" />
            </Pressable>
          </View>

          <BottomSheetScrollView>
            <View className="px-6 pb-20">
              {/* Project Name */}
              <Text className="mb-2 mt-4 text-sm font-medium text-gray-700">Project Name</Text>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <>
                    <TextInput
                      placeholder="Enter project name"
                      value={field.value}
                      onChangeText={field.onChange}
                      className={`rounded-2xl border ${errors.name ? 'border-red-500' : 'border-gray-300'} bg-white px-5 py-4 text-base`}
                    />
                    {errors.name && (
                      <Text className="mt-1 text-xs text-red-500">{errors.name.message}</Text>
                    )}
                  </>
                )}
              />

              {/* Select Team */}
              <Text className="mb-3 mt-6 text-sm font-medium text-gray-700">Assign to Team</Text>
              {loadingTeams ? (
                <ActivityIndicator color="#9333EA" />
              ) : teams.length === 0 ? (
                <Text className="text-sm text-gray-500">No teams available</Text>
              ) : (
                <View className="space-y-3">
                  {teams.map((team: Team) => (
                    <Pressable
                      key={team.id}
                      onPress={() => setValue('teamId', team.id)}
                      className={`flex-row items-center justify-between rounded-2xl border p-4 ${
                        watchedTeamId === team.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 bg-white'
                      }`}>
                      <View className="flex-row items-center">
                        <Image
                          source={{ uri: team.avatar || 'https://i.pravatar.cc/150' }}
                          className="mr-4 h-12 w-12 rounded-xl"
                        />
                        <View>
                          <Text className="font-semibold text-gray-900">{team.name}</Text>
                          <Text className="text-sm text-gray-500">
                            {team.members.length} member{team.members.length > 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                      {watchedTeamId === team.id && <ChevronRight size={20} color="#9333EA" />}
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Date & Time */}
              <Text className="mb-3 mt-6 text-sm font-medium text-gray-700">Date and Time</Text>
              <View className="mb-4 flex-row gap-4">
                <Controller
                  control={control}
                  name="startDate"
                  render={() => (
                    <DateTimeButton
                      label="Start Date"
                      value={formatDate(watchedStartDate)}
                      onPress={() => setShowStartDatePicker(true)}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="endDate"
                  render={() => (
                    <DateTimeButton
                      label="End Date"
                      value={formatDate(watchedEndDate)}
                      onPress={() => setShowEndDatePicker(true)}
                    />
                  )}
                />
              </View>

              <View className="mb-6 flex-row gap-4">
                <Controller
                  control={control}
                  name="startTime"
                  render={() => (
                    <DateTimeButton
                      label="Start Time"
                      value={formatTime(watchedStartDate)}
                      onPress={() => setShowStartTimePicker(true)}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="endTime"
                  render={() => (
                    <DateTimeButton
                      label="End Time"
                      value={formatTime(watchedEndDate)}
                      onPress={() => setShowEndTimePicker(true)}
                    />
                  )}
                />
              </View>

              {/* Pickers */}
              {showStartDatePicker && (
                <DateTimePicker
                  value={watchedStartDate}
                  mode="date"
                  onChange={(_, date) => {
                    setShowStartDatePicker(false);
                    if (date) setValue('startDate', date);
                  }}
                />
              )}
              {showEndDatePicker && (
                <DateTimePicker
                  value={watchedEndDate}
                  mode="date"
                  onChange={(_, date) => {
                    setShowEndDatePicker(false);
                    if (date) setValue('endDate', date);
                  }}
                />
              )}
              {showStartTimePicker && (
                <DateTimePicker
                  value={watchedStartDate}
                  mode="time"
                  onChange={(_, date) => {
                    setShowStartTimePicker(false);
                    if (date) setValue('startTime', date);
                  }}
                />
              )}
              {showEndTimePicker && (
                <DateTimePicker
                  value={watchedEndDate}
                  mode="time"
                  onChange={(_, date) => {
                    setShowEndTimePicker(false);
                    if (date) setValue('endTime', date);
                  }}
                />
              )}

              {/* Label Color */}
              <Text className="mb-3 text-sm font-medium text-gray-700">Label Color</Text>
              <View className="mb-6 flex-row">
                {labelColors.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setValue('labelColor', color)}
                    className={`mr-4 h-12 w-12 rounded-2xl border-4 ${
                      watchedLabelColor === color ? 'border-purple-600' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>

              {/* Description */}
              <Text className="mb-2 text-sm font-medium text-gray-700">Description (Optional)</Text>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextInput
                    placeholder="Add a description..."
                    value={field.value || ''}
                    onChangeText={field.onChange}
                    multiline
                    numberOfLines={5}
                    className="rounded-2xl border border-gray-300 bg-white px-5 py-4 text-base"
                    style={{ textAlignVertical: 'top' }}
                  />
                )}
              />

              {/* Create Button */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || createMutation.isPending}
                className={`mt-8 rounded-2xl py-5 ${
                  isValid && !createMutation.isPending ? 'bg-purple-600' : 'bg-gray-300'
                }`}>
                {createMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center text-lg font-bold text-white">Create Project</Text>
                )}
              </Pressable>
            </View>
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </View>
  );
}

// Reusable Date/Time Button Component
function DateTimeButton({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <View className="flex-1">
      <Text className="mb-2 text-xs text-gray-500">{label}</Text>
      <Pressable
        onPress={onPress}
        className="flex-row items-center rounded-2xl bg-purple-50 px-4 py-4">
        <Clock size={18} color="#9333EA" className="mr-3" />
        <Text className="text-base font-medium text-purple-800">{value}</Text>
      </Pressable>
    </View>
  );
}
