// app/(tabs)/task/[id].tsx
import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Image, Alert } from 'react-native';
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
  Share2,
  Link,
  Trash2,
  FolderOpen,
  Plus,
} from 'lucide-react-native';
import Popover from 'react-native-popover-view';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [comment, setComment] = useState('');
  const [showPopover, setShowPopover] = useState(false);
  const moreButtonRef = useRef(null);

  const comments = [
    {
      id: 1,
      name: 'Tien Tom',
      avatar: 'https://i.pravatar.cc/150?img=1',
      text: 'Descriptive essays test your ability to use language in an original and creative way.',
    },
    {
      id: 2,
      name: 'Minh Ha',
      avatar: 'https://i.pravatar.cc/150?img=5',
      text: 'They are commonly assigned as writing exercises at high school and in composition classes.',
    },
  ];

  const moreActions = [
    { icon: FolderOpen, label: 'Move to', color: '#6B7280' },
    { icon: Share2, label: 'Share', color: '#6B7280' },
    { icon: Link, label: 'Copy link', color: '#6B7280' },
    { icon: Trash2, label: 'Delete', color: '#EF4444' },
  ];

  const handleMoreAction = (action: string) => {
    setShowPopover(false);

    switch (action) {
      case 'Move to':
        Alert.alert('Move Task', 'Select destination project');
        break;
      case 'Share':
        Alert.alert('Share Task', 'Sharing options');
        break;
      case 'Copy link':
        Alert.alert('Success', 'Link copied to clipboard');
        break;
      case 'Delete':
        Alert.alert(
          'Delete Task',
          'Are you sure you want to delete this task? This action cannot be undone.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                router.back();
              },
            },
          ]
        );
        break;
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center justify-between border-b border-gray-100 px-5 pb-4">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={28} color="#374151" />
        </Pressable>

        <Text className="text-xl font-bold text-gray-900">Wireframe</Text>

        <Pressable ref={moreButtonRef} onPress={() => setShowPopover(true)} className="p-2">
          <MoreVertical size={24} color="#6B7280" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-32 pt-6">
          {/* Assign */}
          <View className="mb-8 flex-row items-center">
            <Users size={20} color="#6B7280" className="mr-3" />
            <Text className="mr-3 text-base font-medium text-gray-900">Assign (2)</Text>
          </View>
          <View className="mb-10 flex-row items-center -space-x-3">
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=3' }}
              className="h-12 w-12 rounded-full border-2 border-white"
            />
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=8' }}
              className="h-12 w-12 rounded-full border-2 border-white"
            />
            <Pressable className="h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-purple-400 bg-purple-100">
              <Plus size={20} color="#9333EA" />
            </Pressable>
            <View className="ml-4">
              <Text className="text-sm font-medium text-gray-900">Tien</Text>
              <Text className="text-sm font-medium text-gray-900">Ha</Text>
            </View>
          </View>

          {/* Due Date */}
          <View className="mb-4 flex-row items-center">
            <Calendar size={20} color="#6B7280" className="mr-3" />
            <Text className="text-base font-medium text-gray-900">Due date</Text>
          </View>
          <View className="mb-10 flex-row justify-between">
            <View className="flex-row items-center rounded-2xl bg-purple-100 px-5 py-3">
              <Calendar size={18} color="#9333EA" className="mr-2" />
              <View>
                <Text className="font-medium text-purple-700">Jan 1 2021</Text>
                <Text className="text-xs text-purple-600">9:00 AM</Text>
              </View>
            </View>
            <View className="flex-row items-center rounded-2xl bg-purple-100 px-5 py-3">
              <Calendar size={18} color="#9333EA" className="mr-2" />
              <View>
                <Text className="font-medium text-purple-700">Jan 1 2021</Text>
                <Text className="text-xs text-purple-600">9:00 AM</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6 flex-row items-start">
            <MessageCircle size={20} color="#6B7280" className="mr-3 mt-1" />
            <View className="flex-1">
              <Text className="mb-2 text-base font-medium text-gray-900">Description</Text>
              <Text className="leading-6 text-gray-600">
                A descriptive essay gives a vivid, detailed description of something—generally a
                place or object.
              </Text>
            </View>
          </View>

          {/* Image */}
          <View className="mb-10 flex-row items-start">
            <ImageIcon size={20} color="#6B7280" className="mr-3 mt-1" />
            <Text className="mb-3 text-base font-medium text-gray-900">Image</Text>
          </View>
          <View className="flex-row items-center space-x-4">
            <Image
              source={{ uri: 'https://picsum.photos/400/300' }}
              className="h-20 w-28 rounded-2xl"
            />
            <Pressable className="h-20 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-purple-400">
              <Plus size={28} color="#9333EA" />
            </Pressable>
          </View>

          {/* Comments */}
          <View className="mt-10">
            <Text className="mb-5 text-base font-medium text-gray-900">Comment</Text>
            {comments.map((c) => (
              <View key={c.id} className="mb-6 flex-row">
                <Image source={{ uri: c.avatar }} className="mr-3 h-10 w-10 rounded-full" />
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">{c.name}</Text>
                  <Text className="mt-1 text-sm leading-5 text-gray-600">{c.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View className="absolute bottom-0 left-0 right-0 flex-row items-center border-t border-gray-200 bg-white px-5 py-4">
        <TextInput
          placeholder="Post your comment"
          value={comment}
          onChangeText={setComment}
          className="mr-3 flex-1 rounded-2xl bg-gray-100 px-4 py-3 text-base"
        />
        <Pressable>
          <Send size={24} color="#9333EA" />
        </Pressable>
      </View>

      {/* More Actions Popover */}
      <Popover
        isVisible={showPopover}
        onRequestClose={() => setShowPopover(false)}
        from={moreButtonRef!}
        backgroundStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        popoverStyle={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 5,
        }}
       
        offset={10}>
        <View className="w-48">
          {moreActions.map((action, index) => (
            <Pressable
              key={action.label}
              onPress={() => handleMoreAction(action.label)}
              className={`flex-row items-center px-4 py-3 ${
                index < moreActions.length - 1 ? 'border-b border-gray-100' : ''
              } active:bg-gray-50`}>
              <action.icon size={20} color={action.color} className="mr-3" />
              <Text
                className={`text-base font-medium ${
                  action.label === 'Delete' ? 'text-red-500' : 'text-gray-900'
                }`}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Popover>
    </View>
  );
}
