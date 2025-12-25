// components/ProjectHeader.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, MoreVertical } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import {
  Edit2,
  Share2,
  Archive,
  Trash2,
  UserPlus,
  Check,
  User,
  Flag,
  CheckCircle,
  Paperclip,
  Clock,
  AlertCircle,
  MessageCircle,
} from 'lucide-react-native';

type ActionType =
  | 'complete'
  | 'assign'
  | 'edit'
  | 'priority'
  | 'status'
  | 'attachments'
  | 'invite'
  | 'share'
  | 'archive'
  | 'delete';

type HeaderProps = {
  title: string;
  actions?: ActionType[];
  actionTitle?: string;
  onComplete?: () => void;
  onAssign?: () => void;
  onEdit?: () => void;
  onPriority?: () => void;
  onStatus?: () => void;
  onAttachments?: () => void;
  onInvite?: () => void;
  onShare?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
};

export default function Header({
  title,
  actions = [],
  actionTitle = 'Project',
  onComplete,
  onAssign,
  onEdit,
  onPriority,
  onStatus,
  onAttachments,
  onInvite,
  onShare,
  onArchive,
  onDelete,
}: HeaderProps) {
  const router = useRouter();

  const hasActions = actions.length > 0;

  // Group actions by category for better organization
  const taskActions = actions.filter((action) =>
    ['complete', 'assign', 'edit', 'priority', 'status', 'attachments'].includes(action)
  );
  const regularActions = actions.filter((action) =>
    ['invite', 'share', 'archive'].includes(action)
  );
  const hasDeleteAction = actions.includes('delete');
  const hasTaskActions = taskActions.length > 0;
  const hasRegularActions = regularActions.length > 0;

  const getActionIcon = (action: ActionType) => {
    switch (action) {
      case 'complete':
        return Check;
      case 'assign':
        return UserPlus;
      case 'edit':
        return Edit2;
      case 'priority':
        return Flag;
      case 'status':
        return CheckCircle;
      case 'attachments':
        return Paperclip;
      case 'invite':
        return UserPlus;
      case 'share':
        return Share2;
      case 'archive':
        return Archive;
      case 'delete':
        return Trash2;
      default:
        return Edit2;
    }
  };

  const getActionLabel = (action: ActionType) => {
    switch (action) {
      case 'complete':
        return 'Mark Complete';
      case 'assign':
        return 'Assign Task';
      case 'edit':
        return `Edit ${actionTitle}`;
      case 'priority':
        return 'Change Priority';
      case 'status':
        return 'Change Status';
      case 'attachments':
        return 'Add Attachments';
      case 'invite':
        return `Invite to ${actionTitle}`;
      case 'share':
        return 'Share';
      case 'archive':
        return 'Archive';
      case 'delete':
        return `Delete ${actionTitle}`;
      default:
        return 'Action';
    }
  };

  const getActionColor = (action: ActionType) => {
    if (action === 'delete') return '#EF4444';
    if (action === 'complete') return '#10B981';
    if (action === 'priority') return '#F59E0B';
    if (action === 'status') return '#3B82F6';
    if (action === 'invite' || action === 'assign') return '#9333EA';
    return '#6B7280';
  };

  const handleActionPress = (action: ActionType) => {
    switch (action) {
      case 'complete':
        return onComplete?.();
      case 'assign':
        return onAssign?.();
      case 'edit':
        return onEdit?.();
      case 'priority':
        return onPriority?.();
      case 'status':
        return onStatus?.();
      case 'attachments':
        return onAttachments?.();
      case 'invite':
        return onInvite?.();
      case 'share':
        return onShare?.();
      case 'archive':
        return onArchive?.();
      case 'delete':
        return onDelete?.();
    }
  };

  return (
    <View className="border-b border-gray-200 bg-white px-5 py-4">
      <View className="flex-row items-center justify-between">
        {/* Back Button */}
        <Pressable onPress={() => router.back()} className="-ml-2 p-2">
          <ChevronLeft size={28} color="#374151" />
        </Pressable>

        {/* Title */}
        <Text className="flex-1 text-center text-xl font-bold text-gray-900" numberOfLines={1}>
          {title}
        </Text>

        {/* Actions Menu */}
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
                  minWidth: 240,
                },
              }}>
              {/* Task Actions Section */}
              {hasTaskActions && (
                <>
                  {taskActions.map((action, index) => {
                    const Icon = getActionIcon(action);
                    return (
                      <MenuOption key={action} onSelect={() => handleActionPress(action)}>
                        <View className="flex-row items-center px-5 py-1">
                          <Icon size={20} color={getActionColor(action)} />
                          <Text
                            className="ml-4 text-base font-medium text-gray-900"
                            style={action === 'delete' ? { color: '#EF4444' } : {}}>
                            {getActionLabel(action)}
                          </Text>
                        </View>
                      </MenuOption>
                    );
                  })}
                  {hasTaskActions && (hasRegularActions || hasDeleteAction) && (
                    <View className="mx-5 my-2 h-px bg-gray-200" />
                  )}
                </>
              )}

              {/* Regular Actions Section */}
              {hasRegularActions && (
                <>
                  {regularActions.map((action) => {
                    const Icon = getActionIcon(action);
                    return (
                      <MenuOption key={action} onSelect={() => handleActionPress(action)}>
                        <View className="flex-row items-center px-5 py-1">
                          <Icon size={20} color={getActionColor(action)} />
                          <Text className="ml-4 text-base font-medium text-gray-900">
                            {getActionLabel(action)}
                          </Text>
                        </View>
                      </MenuOption>
                    );
                  })}
                  {hasRegularActions && hasDeleteAction && (
                    <View className="mx-5 my-2 h-px bg-gray-200" />
                  )}
                </>
              )}

              {/* Delete Action (always at bottom) */}
              {hasDeleteAction && (
                <MenuOption onSelect={onDelete}>
                  <View className="flex-row items-center px-5 py-1">
                    <Trash2 size={20} color="#EF4444" />
                    <Text className="ml-4 text-base font-medium text-red-600">
                      {getActionLabel('delete')}
                    </Text>
                  </View>
                </MenuOption>
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
