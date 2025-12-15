// app/(tabs)/task/[id].tsx
import React, { useState, useRef, useMemo } from 'react';
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
  MoreVertical,
  Users,
  Calendar,
  Image as ImageIcon,
  MessageCircle,
  Send,
  Paperclip,
  X,
  AtSign,
} from 'lucide-react-native';
import Popover from 'react-native-popover-view';
import * as DocumentPicker from 'expo-document-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaskById, createComment, uploadCommentFile } from '@/lib/services/tasks';
import { getProjectMembers } from '@/lib/services/projects';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  project: { id: string; name: string; ownerId: string };
  assignee: { id: string; name: string; avatar: string | null } | null;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string; avatar: string | null };
    files: Array<{ id: string; url: string; name: string }>;
  }>;
};

const currentUserId = '691d625d1cf9817035d54762'; // Replace with your auth context

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const moreButtonRef = useRef<View>(null);

  const [comment, setComment] = useState('');
  const [showPopover, setShowPopover] = useState(false);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => getTaskById(id),
    select: (res) => res.data,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['project-members', task?.project.id],
    queryFn: () => getProjectMembers(task!.project.id),
    enabled: !!task,
    select: (res) => res.data || [],
  });

  const isOwner = task?.project.ownerId === currentUserId;

  const commentMutation = useMutation({
    mutationFn: (data: { content: string; files?: any[] }) =>
      createComment({ taskId: id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setComment('');
    },
  });

  const filteredMembers = useMemo(() => {
    if (!mentionSearch) return [];
    return members.filter((m: any) => m.name.toLowerCase().includes(mentionSearch.toLowerCase()));
  }, [mentionSearch, members]);

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

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: true });
    if (!result.canceled && result.assets) {
      const files = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType,
      }));
      // Upload and attach to comment
      const uploaded = await Promise.all(files.map((f) => uploadCommentFile(f)));
      commentMutation.mutate({
        content: comment || 'Attached files',
        files: uploaded,
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      keyboardVerticalOffset={90}>
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center justify-between border-b border-gray-100 bg-white px-5 pb-4">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={28} color="#374151" />
        </Pressable>
        <Text className="max-w-[70%] text-xl font-bold text-gray-900">{task?.title}</Text>
        <Pressable ref={moreButtonRef} onPress={() => setShowPopover(true)}>
          <MoreVertical size={24} color="#6B7280" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-32 pt-6">
          {/* Assignee Picker - Only for Owner */}
          {isOwner && (
            <View className="mb-8">
              <Text className="mb-3 text-base font-medium text-gray-900">Assign To</Text>
              <Pressable className="flex-row items-center rounded-2xl border-2 border-purple-300 bg-purple-50 px-5 py-4">
                {task?.assignee ? (
                  <>
                    <Image
                      source={{ uri: task.assignee.avatar || 'https://i.pravatar.cc/150' }}
                      className="mr-3 h-10 w-10 rounded-full"
                    />
                    <Text className="text-base font-medium text-purple-900">
                      {task.assignee.name}
                    </Text>
                  </>
                ) : (
                  <>
                    <Users size={20} color="#9333EA" className="mr-3" />
                    <Text className="text-base text-purple-700">Assign someone...</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* Project */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600">Project</Text>
            <Text className="text-lg font-bold text-purple-900">{task?.project.name}</Text>
          </View>

          {/* Priority */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600">Priority</Text>
            <View
              className={`mt-1 inline-flex rounded-full px-4 py-2 ${
                task?.priority === 'HIGH'
                  ? 'bg-red-100'
                  : task?.priority === 'MEDIUM'
                    ? 'bg-yellow-100'
                    : 'bg-green-100'
              }`}>
              <Text
                className={`font-bold ${
                  task?.priority === 'HIGH'
                    ? 'text-red-700'
                    : task?.priority === 'MEDIUM'
                      ? 'text-yellow-700'
                      : 'text-green-700'
                }`}>
                {task?.priority}
              </Text>
            </View>
          </View>

          {/* Comments */}
          <View className="mt-8">
            <Text className="mb-5 text-lg font-bold text-gray-900">
              Activity ({task?.comments.length || 0})
            </Text>

            {task?.comments.map((c) => (
              <View key={c.id} className="mb-6 flex-row">
                <Image
                  source={{ uri: c.author.avatar || 'https://i.pravatar.cc/150' }}
                  className="mr-3 h-10 w-10 rounded-full"
                />
                <View className="flex-1">
                  <View className="rounded-2xl bg-gray-50 px-4 py-3">
                    <Text className="font-semibold text-gray-900">{c.author.name}</Text>
                    <Text className="mt-1 whitespace-pre-wrap text-gray-700">{c.content}</Text>
                    {/* {c.files.length > 0 && (
                      <View className="mt-3 space-y-2">
                        {c.files.map((f) => (
                          <Pressable
                            key={f.id}
                            className="flex-row items-center rounded-xl bg-white px-3 py-2">
                            <Paperclip size={16} color="#9333EA" />
                            <Text className="ml-2 text-sm text-purple-700">{f.name}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )} */}
                  </View>
                  <Text className="ml-1 mt-2 text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Comment Input with @mentions & file */}
      <View className="border-t border-gray-200 bg-white px-5 py-4">
        <View className="relative">
          <View className="flex-row items-center">
            <TextInput
              placeholder="Add a comment... (@ to mention)"
              value={comment}
              onChangeText={handleCommentChange}
              multiline
              className="mr-3 flex-1 rounded-2xl bg-gray-100 px-4 py-3 text-base"
            />
            <Pressable onPress={handleFilePick} className="mr-2">
              <Paperclip size={24} color="#9333EA" />
            </Pressable>
            <Pressable
              onPress={() => commentMutation.mutate({ content: comment || 'Sent a file' })}
              disabled={!comment.trim() && commentMutation.isPending}>
              <Send size={24} color={comment.trim() ? '#9333EA' : '#9CA3AF'} />
            </Pressable>
          </View>

          {/* @mention dropdown */}
          {showMentionList && filteredMembers.length > 0 && (
            <View className="absolute bottom-full left-4 right-4 mb-2 max-h-64 rounded-2xl border border-gray-200 bg-white shadow-lg">
              <ScrollView nestedScrollEnabled>
                {filteredMembers.map((member: any) => (
                  <Pressable
                    key={member.id}
                    onPress={() => insertMention(member.name)}
                    className="flex-row items-center border-b border-gray-100 px-4 py-3 last:border-0">
                    <Image
                      source={{ uri: member.avatar || 'https://i.pravatar.cc/150' }}
                      className="mr-3 h-8 w-8 rounded-full"
                    />
                    <Text className="text-base text-gray-900">{member.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
