// app/(tabs)/task/[id].tsx
import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Users,
  Calendar,
  Image as ImageIcon,
  MessageCircle,
  Send,
  Paperclip,
  X,
  File,
  FileText,
  Download,
  UserPlus,
  Edit2,
  Share2,
  Trash2,
  Check,
  Flag,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTaskById,
  createComment,
  updateTask,
  deleteTask,
  completeTask,
  reassignTask,
  addTaskAttachments,
  
  updateTaskPriority,
  updateTaskStatus,
} from '@/lib/services/tasks';
import { getProjectById, getProjects } from '@/lib/services/projects';
import Header from '@/components/layout/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import TaskForm from '@/components/task/TaskForm';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  project: {
    id: string;
    name: string;
    ownerId: string;
    teamId: string;
    team?: {
      id: string;
      name: string;
      members: Array<{
        id: string;
        role: 'admin' | 'manager' | 'member';
        user: { id: string; name: string; email: string; avatar: string | null };
      }>;
    };
  };
  assignee: { id: string; name: string; avatar: string | null } | null;
  assigneeId: string | null;
  creator: { id: string; name: string; avatar: string | null };
  createdBy: string;
  files: Array<{ id: string; url: string; name: string; mimeType: string; uploadedBy: string }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; name: string; avatar: string | null };
    files: Array<{ id: string; url: string; name: string; mimeType: string }>;
  }>;
  startDate: string | null;
  endDate: string | null;
};

type UserType = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

const flagConfig = {
  NORMAL: { color: 'bg-gray-100 text-gray-700', label: 'Normal' },
  URGENT: { color: 'bg-orange-100 text-orange-700', label: 'Urgent' },
  CRITICAL: { color: 'bg-red-100 text-red-700', label: 'Critical' },
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
const { user } = useAuthStore();
const snapPoints = useMemo(() => ['94%'], []);

  // BottomSheet refs
  const assigneeBottomSheetRef = useRef<BottomSheet>(null);
  const editBottomSheetRef = useRef<BottomSheet>(null);
  const statusBottomSheetRef = useRef<BottomSheet>(null);
  const priorityBottomSheetRef = useRef<BottomSheet>(null);
  const dateBottomSheetRef = useRef<BottomSheet>(null);
  const attachmentsBottomSheetRef = useRef<BottomSheet>(null);
  const commentFilesBottomSheetRef = useRef<BottomSheet>(null);

  // States
  const [comment, setComment] = useState('');
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();

  // Edit states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [selectedPriority, setSelectedPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>(
    'MEDIUM'
  );
  const [selectedAssignee, setSelectedAssignee] = useState<UserType | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [newAttachments, setNewAttachments] = useState<any[]>([]);
  const [commentAttachments, setCommentAttachments] = useState<any[]>([]);

  // Current user - in real app, get from auth context
  const [currentUser] = useState<UserType>({
    id: 'current-user-id',
    name: 'Current User',
    email: 'user@example.com',
    avatar: null,
  });

  // Fetch task
  const {
    data: task,
    isLoading,
    error,
    refetch: refetchTask,
  } = useQuery({
    queryKey: ['task', id],
    queryFn: () => getTaskById(id),
    select: (res) => res.data,
  });
const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    select: (res) => res.data || [],
  });
  // Fetch project with team members
  const { data: projectDetails } = useQuery({
    queryKey: ['project', task?.project?.id],
    queryFn: () => getProjectById(task!.project.id),
    enabled: !!task?.project?.id,
    select: (res) => res.data,
  });
useEffect(() => {
    if (task && !selectedProjectId) {
      setSelectedProjectId(task!.project.id);
    }
  }, [task, selectedProjectId]);
  const teamMembers = projectDetails?.team?.members?.map((m) => m.user) || [];

  // Check permissions
  const isOwner = task?.project.ownerId === user?.user?.id;
  const isCreator = task?.createdBy === user?.user?.id;
  const isAssignee = task?.assigneeId === user?.user?.id;
  const isTeamMember = teamMembers.some((m) => m.id === user?.user?.id);

  const canEdit = isCreator || isAssignee || isTeamMember || isOwner;
  const canDelete = isCreator || isOwner;

  // Mutations
  const commentMutation = useMutation({
    mutationFn: (data: { content: string; files?: any[] }) =>
      createComment({ taskId: id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setComment('');
      setCommentAttachments([]);
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to post comment');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: any) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      editBottomSheetRef.current?.close();
      Alert.alert('Success', 'Task updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update task');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      Alert.alert('Success', 'Task deleted successfully');
      router.back();
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to delete task');
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: () => completeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      Alert.alert('Success', 'Task marked as complete');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to complete task');
    },
  });

  const reassignTaskMutation = useMutation({
    mutationFn: (assigneeId: string) => reassignTask(id, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      assigneeBottomSheetRef.current?.close();
      Alert.alert('Success', 'Task reassigned successfully');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to reassign task');
    },
  });

  const addAttachmentsMutation = useMutation({
    mutationFn: (files: any[]) => addTaskAttachments(id, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setNewAttachments([]);
      attachmentsBottomSheetRef.current?.close();
      Alert.alert('Success', 'Attachments added successfully');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to add attachments');
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: (priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') =>
      updateTaskPriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      priorityBottomSheetRef.current?.close();
      Alert.alert('Success', 'Priority updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update priority');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: 'TODO' | 'IN_PROGRESS' | 'DONE') => updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      statusBottomSheetRef.current?.close();
      Alert.alert('Success', 'Status updated successfully');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update status');
    },
  });

  // Handler functions
  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    try {
      // const fileUri = FileSystem. + fileName;
      // const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);
      // await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    Alert.alert('Delete File', 'Are you sure you want to delete this file?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Implement delete file mutation
            // await deleteTaskFile(id, fileId);
            queryClient.invalidateQueries({ queryKey: ['task', id] });
            Alert.alert('Success', 'File deleted successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete file');
          }
        },
      },
    ]);
  };

  const filteredMembers = useMemo(() => {
    if (!mentionSearch) return [];
    return teamMembers.filter(
      (m: any) =>
        m.name.toLowerCase().includes(mentionSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(mentionSearch.toLowerCase())
    );
  }, [mentionSearch, teamMembers]);

  const handleCommentChange = (text: string) => {
    setComment(text);
    const lastAt = text.lastIndexOf('@');
    if (lastAt !== -1 && text.slice(lastAt).includes(' ')) {
      setShowMentionList(false);
      setMentionSearch('');
    } else if (lastAt !== -1 && text[lastAt] === '@') {
      setShowMentionList(true);
      setMentionSearch('');
    } else if (lastAt !== -1) {
      setShowMentionList(true);
      setMentionSearch(text.slice(lastAt + 1));
    } else {
      setShowMentionList(false);
    }
  };

  const insertMention = (name: string) => {
    const lastAt = comment.lastIndexOf('@');
    const newComment = comment.slice(0, lastAt) + `@${name} `;
    setComment(newComment);
    setShowMentionList(false);
    setMentionSearch('');
  };

  // Header Action Handlers
  const handleAssign = () => {
    assigneeBottomSheetRef.current?.snapToIndex(0);
  };

  const handleEdit =async (data:any) => {
    console.log("edit",data)
   await updateTaskMutation.mutateAsync({
      title: data.title.trim(),
      description: data.description.trim() || null,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
    })
  };

  const handleChangeStatus = () => {
    if (!task) return;
    setSelectedStatus(task.status);
    statusBottomSheetRef.current?.snapToIndex(0);
  };

  const handleChangePriority = () => {
    if (!task) return;
    setSelectedPriority(task.priority);
    priorityBottomSheetRef.current?.snapToIndex(0);
  };

  const handleAddAttachments = () => {
    attachmentsBottomSheetRef.current?.snapToIndex(0);
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share task details (implement sharing logic)');
  };

  const handleDelete = () => {
    if (!canDelete) {
      Alert.alert('Error', 'You do not have permission to delete this task');
      return;
    }

    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTaskMutation.mutate(),
        },
      ]
    );
  };

  const handleComplete = () => {
    completeTaskMutation.mutate();
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    updateTaskMutation.mutate({
      title: editTitle.trim(),
      description: editDescription.trim() || null,
      status: selectedStatus,
      priority: selectedPriority,
      assigneeId: selectedAssignee?.id || null,
      startDate: selectedStartDate || null,
      endDate: selectedEndDate || null,
    });
  };

  // File picker functions
  const handlePickAttachments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: ['image/*', 'application/pdf', 'application/*', 'text/*'],
      });

      if (!result.canceled && result.assets) {
        const files = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name || 'file',
          type: asset.mimeType,
        }));

        setNewAttachments((prev) => [...prev, ...files]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick files');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeTypes.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const files = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        }));

        setNewAttachments((prev) => [...prev, ...files]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handlePickCommentAttachments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: ['image/*', 'application/pdf', 'application/*', 'text/*'],
      });

      if (!result.canceled && result.assets) {
        const files = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name || 'file',
          type: asset.mimeType,
        }));

        setCommentAttachments((prev) => [...prev, ...files]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick files');
    }
  };

  const handlePickCommentImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeTypes.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const files = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        }));

        setCommentAttachments((prev) => [...prev, ...files]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeAttachment = (index: number, isComment: boolean = false) => {
    if (isComment) {
      setCommentAttachments((prev) => prev.filter((_, i) => i !== index));
    } else {
      setNewAttachments((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveAttachments = () => {
    if (newAttachments.length > 0) {
      addAttachmentsMutation.mutate(newAttachments);
    } else {
      Alert.alert('Error', 'Please select files to upload');
    }
  };

  const handleSendComment = () => {
    if (!comment.trim() && commentAttachments.length === 0) {
      Alert.alert('Error', 'Please enter a comment or attach files');
      return;
    }

    commentMutation.mutate({
      content: comment.trim() || 'Attached files',
      files: commentAttachments,
    });
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  const openSheet = () => editBottomSheetRef.current?.snapToIndex(0);

const closeSheet = () => {
    editBottomSheetRef.current?.close();
  };
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-600">Failed to load task</Text>
        <Pressable
          className="mt-4 rounded-lg bg-purple-600 px-4 py-2"
          onPress={() => refetchTask()}>
          <Text className="text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  // Define actions based on permissions
  const headerActions = [];

  if (task.status !== 'DONE') {
    headerActions.push('complete');
  }

  if (!canEdit) {
    headerActions.push('assign');
    headerActions.push('edit');
    headerActions.push('priority');
    headerActions.push('status');
    headerActions.push('attachments');
  }

  headerActions.push('share');

  if (canDelete) {
    headerActions.push('delete');
  }
const initialData={
  title:task.title,
  description:task.description,
  projectId:task?.project?.id,
  priority:task?.priority,
  assigneeId:task?.assigneeId,
  status:task?.status,
  startDate:task?.startDate,
  endDate:task?.endDate,
}
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        {/* Header with Actions */}
        <Header
          title="Task Detail"
          actions={headerActions}
          actionTitle="Task"
          onComplete={handleComplete}
          onAssign={handleAssign}
          onEdit={openSheet}
          onPriority={handleChangePriority}
          onStatus={handleChangeStatus}
          onAttachments={handleAddAttachments}
          onShare={handleShare}
          onDelete={handleDelete}
        />

        <ScrollView className="flex-1">
          <View className="px-5 pb-32 pt-6">
            {/* Title & Description */}
            <View className="mb-6 rounded-xl bg-white p-5">
              <Text className="text-2xl font-bold text-gray-900">{task.title}</Text>
              {task.description && (
                <Text className="mt-3 text-base text-gray-700">{task.description}</Text>
              )}
            </View>

            {/* Task Info Card */}
            <View className="mb-6 rounded-xl bg-white p-5">
              <View className="mb-4 flex-row items-center justify-between">
                {/* Status */}
                <Pressable
                  onPress={handleChangeStatus}
                  className={`rounded-full px-4 py-2 ${
                    task.status === 'DONE'
                      ? 'bg-green-100'
                      : task.status === 'IN_PROGRESS'
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                  }`}>
                  <Text
                    className={`font-medium ${
                      task.status === 'DONE'
                        ? 'text-green-700'
                        : task.status === 'IN_PROGRESS'
                          ? 'text-blue-700'
                          : 'text-gray-700'
                    }`}>
                    {task.status}
                  </Text>
                </Pressable>

                {/* Priority */}
                <Pressable
                  onPress={handleChangePriority}
                  className={`rounded-full px-4 py-2 ${
                    task.priority === 'CRITICAL'
                      ? 'bg-red-100'
                      : task.priority === 'HIGH'
                        ? 'bg-orange-100'
                        : task.priority === 'MEDIUM'
                          ? 'bg-yellow-100'
                          : 'bg-green-100'
                  }`}>
                  <Text
                    className={`font-medium ${
                      task.priority === 'CRITICAL'
                        ? 'text-red-700'
                        : task.priority === 'HIGH'
                          ? 'text-orange-700'
                          : task.priority === 'MEDIUM'
                            ? 'text-yellow-700'
                            : 'text-green-700'
                    }`}>
                    {task.priority}
                  </Text>
                </Pressable>
              </View>

              {/* Project */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600">Project</Text>
                <Text className="text-lg font-bold text-purple-900">{task.project.name}</Text>
              </View>

              {/* Assignee */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600">Assignee</Text>
                {task.assignee ? (
                  <View className="mt-2 flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Text className="font-semibold text-purple-600">
                        {task.assignee.name?.[0]?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <Text className="text-lg font-medium text-gray-900">{task.assignee.name}</Text>
                  </View>
                ) : (
                  <Text className="text-gray-500">Unassigned</Text>
                )}
              </View>

              {/* Creator */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600">Created By</Text>
                <View className="mt-2 flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Text className="font-semibold text-gray-600">
                      {task.creator.name?.[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <Text className="text-lg font-medium text-gray-900">{task.creator.name}</Text>
                </View>
              </View>

              {/* Dates */}
              <View className="flex-row justify-between">
                {task.startDate && (
                  <View>
                    <Text className="text-sm text-gray-600">Start Date</Text>
                    <Text className="font-medium text-gray-900">{formatDate(task.startDate)}</Text>
                  </View>
                )}
                {task.endDate && (
                  <View>
                    <Text className="text-sm text-gray-600">Due Date</Text>
                    <Text className="font-medium text-gray-900">{formatDate(task.endDate)}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Task Files */}
            {task.files && task.files.length > 0 && (
              <View className="mb-6 rounded-xl bg-white p-5">
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-lg font-semibold">Attachments ({task.files.length})</Text>
                  {canEdit && (
                    <Pressable onPress={handleAddAttachments}>
                      <Text className="text-purple-600">Add More</Text>
                    </Pressable>
                  )}
                </View>
                <View className="space-y-3">
                  {task.files.map((file) => (
                    <Pressable
                      key={file.id}
                      onPress={() => handleDownloadFile(file.url, file.name)}
                      className="flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-3">
                      <FileText size={20} color="#9333EA" className="mr-3" />
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                          {file.name}
                        </Text>
                        <Text className="text-xs text-gray-500">{file.mimeType}</Text>
                      </View>
                      {canEdit && (
                        <Pressable
                          onPress={() => handleDeleteFile(file.id)}
                          className="ml-2 rounded-full p-1">
                          <Trash2 size={18} color="#EF4444" />
                        </Pressable>
                      )}
                      <Download size={18} color="#9333EA" className="ml-2" />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Comments */}
            <View className="rounded-xl bg-white p-5">
              <Text className="mb-5 text-lg font-semibold">
                Activity ({task.comments?.length || 0})
              </Text>

              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <View key={comment.id} className="mb-6 flex-row">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Text className="font-semibold text-gray-600">
                        {comment.author.name?.[0]?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <View className="rounded-2xl bg-gray-50 px-4 py-3">
                        <Text className="font-semibold text-gray-900">{comment.author.name}</Text>
                        <Text className="mt-1 whitespace-pre-wrap text-gray-700">
                          {comment.content}
                        </Text>
                        {comment.files && comment.files.length > 0 && (
                          <View className="mt-3 space-y-2">
                            {comment.files.map((file) => (
                              <Pressable
                                key={file.id}
                                onPress={() => handleDownloadFile(file.url, file.name)}
                                className="flex-row items-center rounded-xl bg-white px-3 py-2">
                                <Paperclip size={16} color="#9333EA" />
                                <Text
                                  className="ml-2 flex-1 text-sm text-purple-700"
                                  numberOfLines={1}>
                                  {file.name}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        )}
                      </View>
                      <Text className="ml-1 mt-2 text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className="py-8">
                  <MessageCircle size={48} color="#D1D5DB" className="mx-auto mb-3" />
                  <Text className="text-center text-gray-500">No comments yet</Text>
                </View>
              )}

              {/* Comment Input */}
              <View className="mt-6">
                <View className="relative">
                  <View className="flex-row items-start">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Text className="font-semibold text-gray-600">
                        {user?.user?.name?.[0]?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <TextInput
                        placeholder="Add a comment..."
                        value={comment}
                        onChangeText={handleCommentChange}
                        multiline
                        className="rounded-2xl bg-gray-100 px-4 py-3 text-base"
                      />

                      {/* Comment Attachments Preview */}
                      {commentAttachments.length > 0 && (
                        <View className="mt-3 space-y-2">
                          {commentAttachments.map((attachment, index) => {
                            const FileIcon = getFileIcon(attachment.type);
                            return (
                              <View
                                key={index}
                                className="flex-row items-center rounded-xl border border-gray-200 bg-white p-3">
                                <View className="mr-3 rounded-lg bg-purple-100 p-2">
                                  <FileIcon size={20} color="#9333EA" />
                                </View>
                                <View className="flex-1">
                                  <Text className="font-medium text-gray-900" numberOfLines={1}>
                                    {attachment.name}
                                  </Text>
                                </View>
                                <Pressable
                                  onPress={() => removeAttachment(index, true)}
                                  className="ml-2 rounded-full p-1">
                                  <X size={18} color="#EF4444" />
                                </Pressable>
                              </View>
                            );
                          })}
                        </View>
                      )}

                      <View className="mt-3 flex-row items-center justify-between">
                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={() => commentFilesBottomSheetRef.current?.snapToIndex(0)}
                            className="rounded-lg bg-gray-200 p-2">
                            <Paperclip size={20} color="#6B7280" />
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              const lastAt = comment.lastIndexOf('@');
                              const newComment = comment + (lastAt === -1 ? '@' : ' @');
                              setComment(newComment);
                            }}
                            className="rounded-lg bg-gray-200 p-2">
                            <Text className="font-medium text-gray-700">@</Text>
                          </Pressable>
                        </View>
                        <Pressable
                          onPress={handleSendComment}
                          disabled={
                            (!comment.trim() && commentAttachments.length === 0) ||
                            commentMutation.isPending
                          }
                          className={`rounded-lg px-4 py-2 ${
                            comment.trim() || commentAttachments.length > 0
                              ? 'bg-purple-600'
                              : 'bg-gray-300'
                          }`}>
                          {commentMutation.isPending ? (
                            <ActivityIndicator color="white" size="small" />
                          ) : (
                            <Text className="font-semibold text-white">Send</Text>
                          )}
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {/* @mention dropdown */}
                  {showMentionList && filteredMembers.length > 0 && (
                    <View className="absolute bottom-full left-16 right-0 mb-2 max-h-64 rounded-2xl border border-gray-200 bg-white shadow-lg">
                      <ScrollView nestedScrollEnabled>
                        {filteredMembers.map((member: any) => (
                          <Pressable
                            key={member.id}
                            onPress={() => insertMention(member.name)}
                            className="flex-row items-center border-b border-gray-100 px-4 py-3 last:border-0">
                            <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                              <Text className="text-sm font-semibold text-gray-600">
                                {member.name?.[0]?.toUpperCase() || 'U'}
                              </Text>
                            </View>
                            <View>
                              <Text className="text-base text-gray-900">{member.name}</Text>
                              <Text className="text-xs text-gray-500">{member.email}</Text>
                            </View>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Sheets */}

      {/* Assignee Bottom Sheet */}
      <BottomSheet
        ref={assigneeBottomSheetRef}
        index={-1}
        snapPoints={['70%']}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: 'white' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}>
        <BottomSheetView style={{ flex: 1 }}>
          <View className="flex-1 px-6 pt-4">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold">Assign Task</Text>
              <Pressable onPress={() => assigneeBottomSheetRef.current?.close()}>
                <X size={24} color="#666" />
              </Pressable>
            </View>

            <Text className="mb-6 text-gray-600">Select a team member to assign this task</Text>

            <BottomSheetScrollView>
              <View className="space-y-3">
                <Pressable
                  onPress={() => {
                    setSelectedAssignee(null);
                    reassignTaskMutation.mutate('');
                  }}
                  className={`flex-row items-center rounded-xl border-2 px-4 py-4 ${
                    selectedAssignee === null
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}>
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <User size={20} color="#6B7280" />
                  </View>
                  <View>
                    <Text className="font-medium text-gray-900">Unassigned</Text>
                    <Text className="text-sm text-gray-500">No assignee</Text>
                  </View>
                </Pressable>

                {teamMembers.map((member: any) => (
                  <Pressable
                    key={member.id}
                    onPress={() => {
                      setSelectedAssignee(member);
                      reassignTaskMutation.mutate(member.id);
                    }}
                    className={`flex-row items-center rounded-xl border-2 px-4 py-4 ${
                      selectedAssignee?.id === member.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white'
                    }`}>
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Text className="font-semibold text-purple-600">
                        {member.name?.[0]?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-medium text-gray-900">{member.name}</Text>
                      <Text className="text-sm text-gray-500">{member.email}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </BottomSheetScrollView>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* Edit Task Bottom Sheet */}
      <BottomSheet
        ref={editBottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={closeSheet}
        backgroundStyle={{ backgroundColor: '#FFFFFF' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}>
        <TaskForm
          mode="edit"
          initialData={initialData}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onSubmit={handleEdit}
          onCancel={closeSheet}
          isSubmitting={updateTaskMutation.isPending}
        />
      </BottomSheet>

      {/* Status Bottom Sheet */}
      <BottomSheet
        ref={statusBottomSheetRef}
        index={-1}
        snapPoints={['40%']}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: 'white' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}>
        <BottomSheetView>
          <View className="px-6 pt-4">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold">Change Status</Text>
              <Pressable onPress={() => statusBottomSheetRef.current?.close()}>
                <X size={24} color="#666" />
              </Pressable>
            </View>

            <View className="space-y-3">
              {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((status) => (
                <Pressable
                  key={status}
                  onPress={() => {
                    setSelectedStatus(status);
                    updateStatusMutation.mutate(status);
                  }}
                  className={`flex-row items-center justify-between rounded-xl border-2 px-4 py-4 ${
                    selectedStatus === status
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}>
                  <View className="flex-row items-center">
                    {status === 'TODO' && <Clock size={20} color="#6B7280" className="mr-3" />}
                    {status === 'IN_PROGRESS' && (
                      <AlertCircle size={20} color="#3B82F6" className="mr-3" />
                    )}
                    {status === 'DONE' && (
                      <CheckCircle size={20} color="#10B981" className="mr-3" />
                    )}
                    <Text className="text-lg font-medium text-gray-900">{status}</Text>
                  </View>
                  {selectedStatus === status && <Check size={20} color="#9333EA" />}
                </Pressable>
              ))}
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* Priority Bottom Sheet */}
      <BottomSheet
        ref={priorityBottomSheetRef}
        index={-1}
        snapPoints={['50%']}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: 'white' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}>
        <BottomSheetView>
          <View className="px-6 pt-4">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold">Change Priority</Text>
              <Pressable onPress={() => priorityBottomSheetRef.current?.close()}>
                <X size={24} color="#666" />
              </Pressable>
            </View>

            <View className="space-y-3">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((priority) => (
                <Pressable
                  key={priority}
                  onPress={() => {
                    setSelectedPriority(priority);
                    updatePriorityMutation.mutate(priority);
                  }}
                  className={`flex-row items-center justify-between rounded-xl border-2 px-4 py-4 ${
                    selectedPriority === priority
                      ? priority === 'LOW'
                        ? 'border-green-500 bg-green-50'
                        : priority === 'MEDIUM'
                          ? 'border-yellow-500 bg-yellow-50'
                          : priority === 'HIGH'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white'
                  }`}>
                  <View className="flex-row items-center">
                    <Flag
                      size={20}
                      color={
                        priority === 'LOW'
                          ? '#10B981'
                          : priority === 'MEDIUM'
                            ? '#F59E0B'
                            : priority === 'HIGH'
                              ? '#F97316'
                              : '#EF4444'
                      }
                      className="mr-3"
                    />
                    <Text className="text-lg font-medium text-gray-900">{priority}</Text>
                  </View>
                  {selectedPriority === priority && <Check size={20} color="#9333EA" />}
                </Pressable>
              ))}
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* Add Attachments Bottom Sheet */}
      <BottomSheet
        ref={attachmentsBottomSheetRef}
        index={-1}
        snapPoints={['70%']}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: 'white' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}>
        <BottomSheetView style={{ flex: 1 }}>
          <View className="flex-1 px-6 pt-4">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold">Add Attachments</Text>
              <Pressable onPress={() => attachmentsBottomSheetRef.current?.close()}>
                <X size={24} color="#666" />
              </Pressable>
            </View>

            <Text className="mb-6 text-gray-600">Add files to this task</Text>

            {/* File Upload Buttons */}
            <View className="mb-6 flex-row gap-3">
              <Pressable
                // onPress={handlePickDocument}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3">
                <File size={20} color="#9333EA" />
                <Text className="font-medium text-purple-600">Document</Text>
              </Pressable>
              <Pressable
                onPress={handlePickImage}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3">
                <ImageIcon size={20} color="#9333EA" />
                <Text className="font-medium text-purple-600">Image</Text>
              </Pressable>
            </View>

            {/* Selected Attachments */}
            {newAttachments.length > 0 && (
              <View className="mb-6">
                <Text className="mb-3 font-medium">Selected Files ({newAttachments.length})</Text>
                <View className="space-y-2">
                  {newAttachments.map((attachment, index) => {
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
                        </View>
                        <Pressable
                          onPress={() => removeAttachment(index)}
                          className="ml-2 rounded-full p-1">
                          <X size={18} color="#EF4444" />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            <View className="mb-6 mt-auto space-y-3">
              <Pressable
                className={`items-center rounded-xl py-4 ${
                  addAttachmentsMutation.isPending ? 'bg-purple-400' : 'bg-purple-600'
                }`}
                onPress={handleSaveAttachments}
                disabled={addAttachmentsMutation.isPending || newAttachments.length === 0}>
                {addAttachmentsMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-lg font-semibold text-white">
                    Upload {newAttachments.length} File(s)
                  </Text>
                )}
              </Pressable>

              <Pressable
                className="items-center rounded-xl border border-gray-300 py-4"
                onPress={() => attachmentsBottomSheetRef.current?.close()}>
                <Text className="font-semibold text-gray-700">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* Comment Files Bottom Sheet */}
      <BottomSheet
        ref={commentFilesBottomSheetRef}
        index={-1}
        snapPoints={['40%']}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: 'white' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}>
        <BottomSheetView>
          <View className="px-6 pt-4">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold">Attach to Comment</Text>
              <Pressable onPress={() => commentFilesBottomSheetRef.current?.close()}>
                <X size={24} color="#666" />
              </Pressable>
            </View>

            <View className="space-y-3">
              <Pressable
                onPress={handlePickCommentAttachments}
                className="flex-row items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-4">
                <View className="flex-row items-center">
                  <File size={20} color="#9333EA" className="mr-3" />
                  <Text className="font-medium text-gray-900">Document</Text>
                </View>
                <Text className="text-sm text-gray-500">PDF, Word, Excel, etc.</Text>
              </Pressable>

              <Pressable
                onPress={handlePickCommentImages}
                className="flex-row items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-4">
                <View className="flex-row items-center">
                  <ImageIcon size={20} color="#9333EA" className="mr-3" />
                  <Text className="font-medium text-gray-900">Image</Text>
                </View>
                <Text className="text-sm text-gray-500">JPG, PNG, GIF</Text>
              </Pressable>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}
