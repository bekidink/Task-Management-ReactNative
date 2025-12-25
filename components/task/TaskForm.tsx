// components/TaskForm.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Paperclip,
  Image as ImageIcon,
  File,
  Trash2,
  ChevronDown,
  Calendar,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BottomSheetView } from '@gorhom/bottom-sheet';

type FileAttachment = {
  uri: string;
  name: string;
  type: string;
  size: number;
};

type Project = {
  id: string;
  name: string;
  _count?: { tasks: number };
};

type TaskFormProps = {
  mode: 'create' | 'edit';
  initialData?: {
    title?: string;
    description?: string | null;
    projectId?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    assigneeId?: string | null;
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    startDate?: string | null;
    endDate?: string | null;
    attachments?: FileAttachment[];
  };
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject?: (projectId: string) => void;
  onSubmit: (data: {
    title: string;
    description?: string | null;
    projectId: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    assigneeId?: string | null;
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    startDate?: string | null;
    endDate?: string | null;
    attachments?: FileAttachment[];
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  allowStatusChange?: boolean;
  allowAssigneeChange?: boolean;
  assignees?: Array<{ id: string; name: string; avatar?: string }>;
  selectedAssigneeId?: string | null;
  onSelectAssignee?: (assigneeId: string | null) => void;
  title?: string;
};

export default function TaskForm({
  mode,
  initialData = {},
  projects,
  selectedProjectId,
  onSelectProject,
  onSubmit,
  onCancel,
  isSubmitting,
  allowStatusChange = true,
  allowAssigneeChange = true,
  assignees = [],
  selectedAssigneeId = null,
  onSelectAssignee,
  title = mode === 'create' ? 'Create Task' : 'Edit Task',
}: TaskFormProps) {
  // Form states
  const [taskTitle, setTaskTitle] = useState(initialData.title || '');
  const [taskDescription, setTaskDescription] = useState(initialData.description || '');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>(
    initialData.priority || 'MEDIUM'
  );
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>(
    initialData.status || 'TODO'
  );
  const [attachments, setAttachments] = useState<FileAttachment[]>(initialData.attachments || []);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(
    initialData.startDate ? new Date(initialData.startDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialData.endDate ? new Date(initialData.endDate) : null
  );

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // File picker functions
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'image/*',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newAttachment: FileAttachment = {
          uri: asset.uri,
          name: asset.name || 'Document',
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          size: asset.fileSize || 0,
        }));
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.includes('pdf')) return File;
    if (type.includes('word') || type.includes('document')) return File;
    if (type.includes('excel') || type.includes('spreadsheet')) return File;
    return Paperclip;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }
    if (!selectedProjectId) {
      Alert.alert('Error', 'Please select a project');
      return;
    }

    try {
      await onSubmit({
        title: taskTitle.trim(),
        description: taskDescription.trim() || null,
        projectId: selectedProjectId,
        priority,
        assigneeId: selectedAssigneeId,
        status: allowStatusChange ? status : undefined,
        startDate: startDate?.toISOString() || null,
        endDate: endDate?.toISOString() || null,
        attachments,
      });
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(null);
    if (selectedDate) {
      if (showDatePicker === 'start') {
        setStartDate(selectedDate);
      } else if (showDatePicker === 'end') {
        setEndDate(selectedDate);
      }
    }
  };

  return (
    <BottomSheetView style={{ flex: 1 }}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 pb-3 pt-4">
          <Text className="text-2xl font-bold text-gray-900">{title}</Text>
          <Pressable onPress={onCancel}>
            <X size={26} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView className="flex-1">
          <View className="px-6 pb-20">
            {/* Task Title */}
            <Text className="mb-2 mt-4 text-sm font-medium text-gray-700">Task Title</Text>
            <TextInput
              placeholder="Enter task title"
              value={taskTitle}
              onChangeText={setTaskTitle}
              className="rounded-2xl border border-gray-300 bg-white px-5 py-4 text-base"
            />

            {/* Project Selector */}
            <Text className="mb-2 mt-6 text-sm font-medium text-gray-700">Project</Text>
            <View className="relative">
              <Pressable
                onPress={() => setShowProjectDropdown(!showProjectDropdown)}
                className="flex-row items-center justify-between rounded-2xl border border-gray-300 bg-white px-5 py-4">
                <Text
                  className={`text-base ${selectedProject ? 'text-gray-900' : 'text-gray-500'}`}>
                  {selectedProject?.name || 'Select a project'}
                </Text>
                <ChevronDown
                  size={20}
                  color="#9333EA"
                  style={{ transform: [{ rotate: showProjectDropdown ? '180deg' : '0deg' }] }}
                />
              </Pressable>

              {showProjectDropdown && (
                <View className="absolute top-full z-10 mt-2 max-h-64 w-full rounded-2xl border border-gray-200 bg-white shadow-lg">
                  <ScrollView nestedScrollEnabled>
                    {projects.length === 0 ? (
                      <Text className="py-6 text-center text-gray-500">No projects available</Text>
                    ) : (
                      projects.map((project: Project) => (
                        <Pressable
                          key={project.id}
                          onPress={() => {
                            onSelectProject?.(project.id);
                            setShowProjectDropdown(false);
                          }}
                          className="border-b border-gray-100 px-5 py-4 last:border-b-0">
                          <Text className="font-medium text-gray-900">{project.name}</Text>
                          {project._count?.tasks !== undefined && (
                            <Text className="text-xs text-gray-500">
                              {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}
                            </Text>
                          )}
                        </Pressable>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Assignee Selector */}
            {allowAssigneeChange && assignees.length > 0 && (
              <>
                <Text className="mb-2 mt-6 text-sm font-medium text-gray-700">Assignee</Text>
                <View className="relative">
                  <Pressable
                    onPress={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                    className="flex-row items-center justify-between rounded-2xl border border-gray-300 bg-white px-5 py-4">
                    <Text
                      className={`text-base ${selectedAssigneeId ? 'text-gray-900' : 'text-gray-500'}`}>
                      {selectedAssigneeId
                        ? assignees.find((a) => a.id === selectedAssigneeId)?.name ||
                          'Select assignee'
                        : 'Unassigned'}
                    </Text>
                    <ChevronDown
                      size={20}
                      color="#9333EA"
                      style={{ transform: [{ rotate: showAssigneeDropdown ? '180deg' : '0deg' }] }}
                    />
                  </Pressable>

                  {showAssigneeDropdown && (
                    <View className="absolute top-full z-10 mt-2 max-h-64 w-full rounded-2xl border border-gray-200 bg-white shadow-lg">
                      <ScrollView nestedScrollEnabled>
                        <Pressable
                          onPress={() => {
                            onSelectAssignee?.(null);
                            setShowAssigneeDropdown(false);
                          }}
                          className="border-b border-gray-100 px-5 py-4">
                          <Text className="font-medium text-gray-900">Unassigned</Text>
                        </Pressable>
                        {assignees.map((assignee) => (
                          <Pressable
                            key={assignee.id}
                            onPress={() => {
                              onSelectAssignee?.(assignee.id);
                              setShowAssigneeDropdown(false);
                            }}
                            className="border-b border-gray-100 px-5 py-4 last:border-b-0">
                            <Text className="font-medium text-gray-900">{assignee.name}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Status Selector */}
            {allowStatusChange && (
              <>
                <Text className="mb-2 mt-6 text-sm font-medium text-gray-700">Status</Text>
                <View className="relative">
                  <Pressable
                    onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="flex-row items-center justify-between rounded-2xl border border-gray-300 bg-white px-5 py-4">
                    <Text className="text-base text-gray-900">{status}</Text>
                    <ChevronDown
                      size={20}
                      color="#9333EA"
                      style={{ transform: [{ rotate: showStatusDropdown ? '180deg' : '0deg' }] }}
                    />
                  </Pressable>

                  {showStatusDropdown && (
                    <View className="absolute top-full z-10 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-lg">
                      {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((statusOption) => (
                        <Pressable
                          key={statusOption}
                          onPress={() => {
                            setStatus(statusOption);
                            setShowStatusDropdown(false);
                          }}
                          className="border-b border-gray-100 px-5 py-4 last:border-b-0">
                          <Text className="font-medium text-gray-900">{statusOption}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Priority Selector */}
            <Text className="mb-2 mt-6 text-sm font-medium text-gray-700">Priority</Text>
            <View className="flex-row gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((level) => (
                <Pressable
                  key={level}
                  onPress={() => setPriority(level)}
                  className={`flex-1 items-center rounded-xl py-3 ${
                    priority === level
                      ? level === 'LOW'
                        ? 'border-2 border-green-500 bg-green-100'
                        : level === 'MEDIUM'
                          ? 'border-2 border-yellow-500 bg-yellow-100'
                          : level === 'HIGH'
                            ? 'border-2 border-orange-500 bg-orange-100'
                            : 'border-2 border-red-500 bg-red-100'
                      : 'bg-gray-100'
                  }`}>
                  <Text
                    className={`font-medium ${
                      priority === level
                        ? level === 'LOW'
                          ? 'text-green-700'
                          : level === 'MEDIUM'
                            ? 'text-yellow-700'
                            : level === 'HIGH'
                              ? 'text-orange-700'
                              : 'text-red-700'
                        : 'text-gray-700'
                    }`}>
                    {level}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Dates */}
            <View className="mt-6">
              <Text className="mb-2 text-sm font-medium text-gray-700">Dates</Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowDatePicker('start')}
                  className="flex-1 flex-row items-center justify-between rounded-2xl border border-gray-300 bg-white px-5 py-4">
                  <View>
                    <Text className="text-sm text-gray-600">Start Date</Text>
                    <Text className="font-medium text-gray-900">{formatDate(startDate)}</Text>
                  </View>
                  <Calendar size={20} color="#9333EA" />
                </Pressable>
                <Pressable
                  onPress={() => setShowDatePicker('end')}
                  className="flex-1 flex-row items-center justify-between rounded-2xl border border-gray-300 bg-white px-5 py-4">
                  <View>
                    <Text className="text-sm text-gray-600">Due Date</Text>
                    <Text className="font-medium text-gray-900">{formatDate(endDate)}</Text>
                  </View>
                  <Calendar size={20} color="#9333EA" />
                </Pressable>
              </View>
            </View>

            {/* Description */}
            <Text className="mb-2 mt-6 text-sm font-medium text-gray-700">
              Description (Optional)
            </Text>
            <TextInput
              placeholder="Add a description..."
              value={taskDescription}
              onChangeText={setTaskDescription}
              multiline
              numberOfLines={5}
              className="rounded-2xl border border-gray-300 bg-white px-5 py-4"
              style={{ textAlignVertical: 'top' }}
            />

            {/* Attachments Section */}
            <View className="mt-6">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-700">Attachments</Text>
                <Text className="text-xs text-gray-500">
                  {attachments.length} file{attachments.length !== 1 ? 's' : ''}
                </Text>
              </View>

              {/* File Upload Buttons */}
              <View className="mb-4 flex-row gap-3">
                <Pressable
                  onPress={pickDocument}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3">
                  <Paperclip size={20} color="#9333EA" />
                  <Text className="font-medium text-purple-600">Document</Text>
                </Pressable>
                <Pressable
                  onPress={pickImage}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3">
                  <ImageIcon size={20} color="#9333EA" />
                  <Text className="font-medium text-purple-600">Image</Text>
                </Pressable>
              </View>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <View className="mb-4 space-y-2">
                  {attachments.map((attachment, index) => {
                    const FileIcon = getFileIcon(attachment.type);
                    return (
                      <View
                        key={index}
                        className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <View className="mr-3 rounded-lg bg-purple-100 p-2">
                          <FileIcon size={20} color="#9333EA" />
                        </View>
                        <View className="flex-1">
                          <Text className="font-medium text-gray-900" numberOfLines={1}>
                            {attachment.name}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => removeAttachment(index)}
                          className="ml-2 rounded-full p-1">
                          <Trash2 size={18} color="#EF4444" />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting || !taskTitle.trim() || !selectedProjectId}
              className={`mt-10 rounded-2xl py-5 ${
                taskTitle.trim() && selectedProjectId && !isSubmitting
                  ? 'bg-purple-600'
                  : 'bg-gray-300'
              }`}>
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-lg font-bold text-white">
                  {mode === 'create' ? 'Create Task' : 'Update Task'}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={showDatePicker === 'start' ? startDate || new Date() : endDate || new Date()}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
          />
        )}
      </View>
    </BottomSheetView>
  );
}
