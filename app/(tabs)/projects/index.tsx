// app/(tabs)/projects.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Search, Plus, ChevronLeft, X, Clock, Plus as PlusIcon } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProject, getProjects } from '@/lib/services/projects';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Full original schema with dates & colors
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
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

const labelColors = ['#E9D5FF', '#FEF3C7', '#CCFBF1', '#FECACA'];

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['92%'], []);
  const queryClient = useQueryClient();

  // Fetch real projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    select: (res) => res.data,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      bottomSheetRef.current?.close();
      reset();
    },
    onError: (error: any) => Alert.alert('Error', error.message || 'Failed to create project'),
  });

  // Form with full original fields
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
    // Combine date + time before sending
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
      ...data,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
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
          {['Projects', 'Completed', 'Flag'].map((t, i) => (
            <Pressable
              key={t}
              className={`flex-1 rounded-xl py-2.5 ${i === 0 ? 'bg-purple-600' : ''}`}>
              <Text
                className={`text-center text-sm font-semibold ${i === 0 ? 'text-white' : 'text-gray-600'}`}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Real Projects List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mt-6 space-y-4 px-5 pb-40">
            {projects.length === 0 ? (
              <Text className="mt-20 text-center text-gray-500">No projects yet</Text>
            ) : (
              projects.map((p: Project) => (
                <Pressable
                  key={p.id}
                  className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-gray-900">{p.name}</Text>
                    <View className="flex-row -space-x-2">
                      <View className="h-9 w-9 rounded-full border-2 border-white bg-gray-300" />
                      <View className="h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-purple-100">
                        <Text className="text-xs font-bold text-purple-600">+1</Text>
                      </View>
                    </View>
                  </View>

                  <Text className="mb-3 text-sm text-gray-600">{p.owner.name}</Text>

                  {(p.startDate || p.endDate) && (
                    <View className="mb-3 flex-row items-center text-xs text-gray-500">
                      <Text>{formatDate(new Date(p.startDate || new Date()))}</Text>
                      <Text className="mx-2">Right Arrow</Text>
                      <Text>{formatDate(new Date(p.endDate || new Date()))}</Text>
                    </View>
                  )}

                  <View className="mb-1 flex-row items-center justify-between">
                    <View className="mr-4 h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <View
                        className="h-full rounded-full bg-purple-600"
                        style={{ width: '45%' }}
                      />
                    </View>
                    <Text className="text-xs text-gray-500">{p._count.tasks} tasks</Text>
                  </View>
                  <Text className="text-right text-sm font-medium text-purple-600">45%</Text>
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Original Full Create Project Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={closeSheet}
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
            <View className="px-6 pb-20">
              {/* Name */}
              <Text className="mb-2 mt-4 text-sm text-gray-700">Name</Text>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <>
                    <TextInput
                      placeholder="Project name"
                      value={field.value}
                      onChangeText={field.onChange}
                      className={`rounded-2xl border ${errors.name ? 'border-red-500' : 'border-purple-200'} bg-gray-50 px-4 py-4 text-base`}
                    />
                    {errors.name && (
                      <Text className="mt-1 text-xs text-red-500">{errors.name.message}</Text>
                    )}
                  </>
                )}
              />

              {/* Add member */}
              <Text className="mb-3 mt-6 text-sm text-gray-700">Add member</Text>
              <View className="mb-6 flex-row items-center">
                <View className="mr-3 h-12 w-12 rounded-full bg-gray-600" />
                <View className="mr-3 h-12 w-12 rounded-full bg-pink-500" />
                <View className="mr-3 h-12 w-12 rounded-full bg-yellow-500" />
                <Pressable className="h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-purple-400">
                  <PlusIcon size={20} color="#9333EA" />
                </Pressable>
              </View>

              {/* Date & Time */}
              <Text className="mb-3 text-sm text-gray-700">Date and time</Text>
              <View className="mb-4 flex-row justify-between">
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DateTimeButton
                      label="Start Date"
                      date={field.value}
                      onPress={() => setShowStartDatePicker(true)}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <DateTimeButton
                      label="End Date"
                      date={field.value}
                      onPress={() => setShowEndDatePicker(true)}
                    />
                  )}
                />
              </View>

              <View className="mb-8 flex-row justify-between">
                <Controller
                  control={control}
                  name="startTime"
                  render={({ field }) => (
                    <DateTimeButton
                      label="Start Time"
                      date={field.value}
                      timeOnly
                      onPress={() => setShowStartTimePicker(true)}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="endTime"
                  render={({ field }) => (
                    <DateTimeButton
                      label="End Time"
                      date={field.value}
                      timeOnly
                      onPress={() => setShowEndTimePicker(true)}
                    />
                  )}
                />
              </View>

              {/* DateTime Pickers */}
              {showStartDatePicker && (
                <DateTimePicker
                  value={watchedStartDate}
                  mode="date"
                  onChange={(e, date) => {
                    setShowStartDatePicker(false);
                    if (date) setValue('startDate', date);
                  }}
                />
              )}
              {showEndDatePicker && (
                <DateTimePicker
                  value={watchedEndDate}
                  mode="date"
                  onChange={(e, date) => {
                    setShowEndDatePicker(false);
                    if (date) setValue('endDate', date);
                  }}
                />
              )}
              {showStartTimePicker && (
                <DateTimePicker
                  value={watchedStartDate}
                  mode="time"
                  onChange={(e, date) => {
                    setShowStartTimePicker(false);
                    if (date) setValue('startTime', date);
                  }}
                />
              )}
              {showEndTimePicker && (
                <DateTimePicker
                  value={watchedEndDate}
                  mode="time"
                  onChange={(e, date) => {
                    setShowEndTimePicker(false);
                    if (date) setValue('endTime', date);
                  }}
                />
              )}

              {/* Label Colors */}
              <Text className="mb-3 text-sm text-gray-700">Add label</Text>
              <View className="mb-8 flex-row">
                {labelColors.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setValue('labelColor', color)}
                    className={`mr-3 h-12 w-12 rounded-2xl border-4 ${watchedLabelColor === color ? 'border-purple-600' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <Pressable className="h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-purple-400">
                  <PlusIcon size={20} color="#9333EA" />
                </Pressable>
              </View>

              {/* Description */}
              <Text className="mb-2 text-sm text-gray-700">Description</Text>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextInput
                    placeholder="Project description"
                    value={field.value || ''}
                    onChangeText={field.onChange}
                    multiline
                    numberOfLines={6}
                    className="rounded-2xl border border-purple-200 bg-gray-50 px-4 py-4 text-base"
                    style={{ textAlignVertical: 'top' }}
                  />
                )}
              />

              {/* Submit */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || createMutation.isPending}
                className={`mt-8 flex-row items-center justify-center rounded-2xl py-4 ${
                  isValid && !createMutation.isPending ? 'bg-purple-600' : 'bg-gray-300'
                }`}>
                {createMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text
                      className={`mr-2 text-lg font-bold ${isValid ? 'text-white' : 'text-gray-500'}`}>
                      Create
                    </Text>
                    <Text className="text-2xl text-white">Right Arrow</Text>
                  </>
                )}
              </Pressable>
            </View>
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </View>
  );
}

// Reusable Date/Time Button
function DateTimeButton({
  label,
  date,
  timeOnly,
  onPress,
}: {
  label: string;
  date: Date;
  timeOnly?: boolean;
  onPress: () => void;
}) {
  return (
    <View className="flex-1">
      <Text className="mb-2 text-xs text-gray-500">{label}</Text>
      <Pressable
        onPress={onPress}
        className="flex-row items-center rounded-2xl bg-purple-100 px-4 py-3.5">
        <Clock size={18} color="#9333EA" className="mr-2" />
        <Text className="font-medium text-purple-700">
          {timeOnly ? formatTime(date) : formatDate(date)}
        </Text>
      </Pressable>
    </View>
  );
}

// Helper format functions
const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (date: Date) =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
