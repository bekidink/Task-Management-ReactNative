// app/(tabs)/messages/[id].tsx
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Paperclip, Send, Smile } from 'lucide-react-native';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, sendMessage } from '@/lib/services/messages';

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  senderId: string;
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState('');

  // Fetch messages for this chatRoomId (team chat)
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => getChatMessages(id),
    select: (res) => res.data || [],
  });

  // Inside your ChatScreen component
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      sendMessage({
        type: 'team', // or detect from route
        teamId: '691d70fcb7763820bc14fc80', // your team ID
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setInputText('');
    },
  });

  // Auto-scroll to bottom when new message
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return '';
    }
  };

  const currentUserId = '691d625d1cf9817035d54762'; // Replace with your auth user ID

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
      keyboardVerticalOffset={90}>
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-5 py-4">
        <Pressable onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={28} color="#374151" />
        </Pressable>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=1' }}
          className="mr-3 h-10 w-10 rounded-full"
        />
        <View>
          <Text className="text-lg font-bold text-gray-900">My Freelance App</Text>
          <Text className="text-xs text-green-600">Team Chat</Text>
        </View>
      </View>

      {/* Messages */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-5 pt-6"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}>
          {messages.length === 0 ? (
            <Text className="mt-10 text-center text-gray-500">
              No messages yet. Start the conversation!
            </Text>
          ) : (
            messages.map((msg: Message) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <View
                  key={msg.id}
                  className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <View className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Sender Name (only for others) */}
                    {!isMe && (
                      <Text className="mb-1 ml-2 text-xs text-gray-500">{msg.sender.name}</Text>
                    )}

                    {/* Message Bubble */}
                    <View
                      className={`rounded-2xl px-4 py-3 ${
                        isMe ? 'bg-purple-600' : 'border border-gray-200 bg-white'
                      } shadow-sm`}>
                      <Text className={isMe ? 'text-white' : 'text-gray-900'}>{msg.content}</Text>
                    </View>

                    {/* Timestamp */}
                    <Text className="mr-2 mt-1 text-xs text-gray-400">
                      {formatTime(msg.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
          <View className="h-32" />
        </ScrollView>
      )}

      {/* Input */}
      <View className="flex-row items-center border-t border-gray-200 bg-white px-5 py-4">
        <Pressable className="mr-3">
          <Paperclip size={24} color="#9333EA" />
        </Pressable>

        <TextInput
          placeholder="Write a message"
          value={inputText}
          onChangeText={setInputText}
          className="mr-3 flex-1 rounded-2xl bg-gray-100 px-4 py-3 text-base"
          multiline
        />

        <Pressable className="mr-2">
          <Smile size={24} color="#9333EA" />
        </Pressable>

        <Pressable
          onPress={() => {
            if (inputText.trim()) {
              sendMutation.mutate(inputText.trim());
            }
          }}
          disabled={sendMutation.isPending || !inputText.trim()}>
          {sendMutation.isPending ? (
            <ActivityIndicator color="#9333EA" />
          ) : (
            <Send size={24} color={inputText.trim() ? '#9333EA' : '#9CA3AF'} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
