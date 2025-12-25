// components/ProjectHeader.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, MoreVertical } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { Edit2, Share2, Archive, Trash2, UserPlus } from 'lucide-react-native';

type ActionType = 'invite' | 'edit' | 'share' | 'archive' | 'delete';

type HeaderProps = {
  title: string;
  actions?: ActionType[];
  actionTitle?:string;
  onInvite?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
};

export default function Header({
  title,
  actions = [],
  actionTitle="Project",
  onInvite,
  onEdit,
  onShare,
  onArchive,
  onDelete,
}: HeaderProps) {
  const router = useRouter();

  const hasActions = actions.length > 0;
  const handleInvite = () => onInvite?.();
  const handleEdit = () => onEdit?.();
  const handleShare = () => onShare?.();
  const handleArchive = () => onArchive?.();
  const handleDelete = () => onDelete?.();

  return (
    <View className="border-b border-gray-200 bg-white px-5 py-4">
      <View className="flex-row items-center justify-between">
        {/* Back Button */}
        <Pressable onPress={() => router.back()} className="-ml-2 p-2">
          <ChevronLeft size={28} color="#374151" />
        </Pressable>

        {/* Title */}
        <Text className="mr-8 flex-1 text-center text-2xl font-bold text-gray-900">{title}</Text>

        {/* Actions Menu or Empty Space */}
        {hasActions ? (
          <Menu>
            <MenuTrigger>
              <MoreVertical size={24} color="#374151" />
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: {
                  marginTop: 48,
                  marginLeft: -20,
                  borderRadius: 16,
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  elevation: 10,
                  paddingVertical: 8,
                  minWidth: 220,
                },
              }}>
              {actions.includes('invite') && (
                <MenuOption onSelect={handleInvite}>
                  <View className="flex-row items-center px-5 py-1">
                    <UserPlus size={20} color="#9333EA" />
                    <Text className="ml-4 text-base font-medium text-gray-900">
                      Invite {actionTitle}
                    </Text>
                  </View>
                </MenuOption>
              )}
              {actions.includes('edit') && (
                <MenuOption onSelect={handleEdit}>
                  <View className="flex-row items-center px-5 py-1">
                    <Edit2 size={20} color="#9333EA" />
                    <Text className="ml-4 text-base font-medium text-gray-900">
                      Edit {actionTitle}
                    </Text>
                  </View>
                </MenuOption>
              )}

              {actions.includes('share') && (
                <MenuOption onSelect={handleShare}>
                  <View className="flex-row items-center px-5 py-1">
                    <Share2 size={20} color="#6B7280" />
                    <Text className="ml-4 text-base font-medium text-gray-700">Share</Text>
                  </View>
                </MenuOption>
              )}

              {actions.includes('archive') && (
                <MenuOption onSelect={handleArchive}>
                  <View className="flex-row items-center px-5 py-1">
                    <Archive size={20} color="#6B7280" />
                    <Text className="ml-4 text-base font-medium text-gray-700">Archive</Text>
                  </View>
                </MenuOption>
              )}

              {actions.includes('delete') && (
                <>
                  {(actions.includes('edit') ||
                    actions.includes('share') ||
                    actions.includes('archive')) && <View className="mx-5 my-2 h-px bg-gray-200" />}
                  <MenuOption onSelect={handleDelete}>
                    <View className="flex-row items-center px-5 py-1">
                      <Trash2 size={20} color="#EF4444" />
                      <Text className="ml-4 text-base font-medium text-red-600">
                        Delete {actionTitle}
                      </Text>
                    </View>
                  </MenuOption>
                </>
              )}
            </MenuOptions>
          </Menu>
        ) : (
          // Placeholder to balance layout when no actions
          <View className="w-10" />
        )}
      </View>
    </View>
  );
}
