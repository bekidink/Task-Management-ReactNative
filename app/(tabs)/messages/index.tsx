// app/(tabs)/messages/index.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Search, Plus, X, Users, User } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getMessages } from '@/lib/services/messages';

type DM = {
  userId: string;
  userName: string;
  userAvatar: string | null;
  lastMessage: {
    content: string;
    sender: { name: string };
    createdAt: string;
    chatRoomId: string;
  } | null;
  unreadCount: number;
};

type TeamChat = {
  teamId: string;
  teamName: string;
  teamAvatar: string | null;
  lastMessage: {
    content: string;
    sender: { name: string };
    createdAt: string;
    chatRoomId: string;
  } | null;
  unreadCount: number;
};

type ChatItem = (DM | TeamChat) & { type: 'dm' | 'team' };

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // All hooks at the top — NEVER conditional
  const { data, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: getMessages,
    select: (res) => ({
      dms: (res.data?.dms || []) as DM[],
      teams: (res.data?.teams || []) as TeamChat[],
    }),
  });

  const dms: DM[] = data?.dms || [];
  const teams: TeamChat[] = data?.teams || [];

  const allChats: ChatItem[] = useMemo(() => {
    const items: ChatItem[] = [
      ...dms.map((dm) => ({ ...dm, type: 'dm' }) as ChatItem),
      ...teams.map((team) => ({ ...team, type: 'team' }) as ChatItem),
    ];

    return items
      .filter((chat) => chat.lastMessage !== null)
      .sort((a, b) => {
        const timeA = a.lastMessage?.createdAt || '0';
        const timeB = b.lastMessage?.createdAt || '0';
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });
  }, [dms, teams]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return allChats;
    const q = searchQuery.toLowerCase();
    return allChats.filter((chat) => {
      const name = 'userName' in chat ? chat.userName : chat.teamName;
      const content = chat.lastMessage?.content || '';
      const sender = chat.lastMessage?.sender.name || '';
      return (
        name.toLowerCase().includes(q) ||
        content.toLowerCase().includes(q) ||
        sender.toLowerCase().includes(q)
      );
    });
  }, [allChats, searchQuery]);

  const formatTime = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true });

  const getChatName = (chat: ChatItem) => ('userName' in chat ? chat.userName : chat.teamName);

  const getChatAvatar = (chat: ChatItem) =>
    'userAvatar' in chat ? chat.userAvatar : chat.teamAvatar;

  // Fixed: Always use chatRoomId from lastMessage
  const getChatRoute = (chat: ChatItem): string => {
    const roomId = chat.lastMessage?.chatRoomId;
    if (!roomId) return '/messages';
    return chat.type === 'dm'
      ? `/messages/${roomId}` // or `/messages/dm/${chat.userId}` if you have separate DM routes
      : `/messages/${roomId}`;
  };

  // Early loading return — AFTER all hooks
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#9333EA" />
        <Text className="mt-4 text-gray-500">Loading chats...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 12 }} className="border-b border-gray-100 px-5 pb-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Chat</Text>
          <Pressable
            onPress={() => {
              /* navigate to new chat */
            }}>
            <Plus size={28} color="#9333EA" />
          </Pressable>
        </View>

        <View className="flex-row items-center rounded-2xl bg-gray-100 px-4 py-3.5">
          <Search size={20} color="#9CA3AF" className="mr-3" />
          <TextInput
            placeholder="Search chats"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-gray-700"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Chat List */}
      {filteredChats.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center text-lg text-gray-500">
            {searchQuery ? 'No chats found' : 'No messages yet'}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-5 pb-32 pt-4">
            {filteredChats.map((chat) => {
              const route = getChatRoute(chat);
              const key = chat.type === 'dm' ? (chat as DM).userId : (chat as TeamChat).teamId;

              return (
                <Link href={route as never} key={key} asChild>
                  <Pressable className="flex-row items-center border-b border-gray-100 py-4">
                    <View className="relative">
                      <Image
                        source={{ uri: getChatAvatar(chat) || 'https://i.pravatar.cc/150' }}
                        className="mr-4 h-14 w-14 rounded-full"
                      />
                      <View className="absolute bottom-0 right-3 rounded-full bg-white p-1">
                        {chat.type === 'dm' ? (
                          <User size={16} color="#9333EA" />
                        ) : (
                          <Users size={16} color="#9333EA" />
                        )}
                      </View>
                      {chat.unreadCount > 0 && (
                        <View className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-red-500" />
                      )}
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-semibold text-gray-900">
                          {getChatName(chat)}
                        </Text>
                        {chat.lastMessage && (
                          <Text className="text-xs text-gray-500">
                            {formatTime(chat.lastMessage.createdAt)}
                          </Text>
                        )}
                      </View>

                      <Text className="mt-1 text-sm text-gray-600" numberOfLines={1}>
                        {chat.lastMessage
                          ? `${chat.lastMessage.sender.name}: ${chat.lastMessage.content}`
                          : 'No messages yet'}
                      </Text>
                    </View>

                    {chat.unreadCount > 0 && (
                      <View className="ml-3 h-6 min-w-6 items-center justify-center rounded-full bg-purple-600 px-2">
                        <Text className="text-xs font-bold text-white">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </Link>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
