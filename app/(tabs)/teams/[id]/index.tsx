// app/(tabs)/projects/[id].tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Users,
  Calendar,
  Flag,
  MoreVertical,
  Edit2,
  Check,
  X,
  Trash2,
  Share2,
  Archive,
  UserPlus,
} from 'lucide-react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteTeam, getTeamById, inviteMemeber, updateTeam } from '@/lib/services/teams';
import { Team } from '@/types/models/TeamModel';



const flagConfig = {
  NORMAL: { color: 'bg-gray-100 text-gray-700', label: 'Normal' },
  URGENT: { color: 'bg-orange-100 text-orange-700', label: 'Urgent' },
  CRITICAL: { color: 'bg-red-100 text-red-700', label: 'Critical' },
};

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // BottomSheet refs
  const inviteBottomSheetRef = useRef<BottomSheet>(null);
  const editBottomSheetRef = useRef<BottomSheet>(null);

  // States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrivacy, setEditPrivacy] = useState<'public' | 'private'>('public');

  // Invite states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'manager' | 'admin'>('member');

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id),
    select: (res) => res.data,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Team>) => updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setIsEditing(false);
      editBottomSheetRef.current?.close();
      Alert.alert('Success', 'Team updated successfully');
    },
    onError: (error: any) => Alert.alert('Error', error.message || 'Failed to update team'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      Alert.alert('Deleted', 'Team has been deleted');
      router.back();
    },
    onError: (error: any) => Alert.alert('Error', error.message || 'Failed to delete team'),
  });

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) =>inviteMemeber(id,data),
    onSuccess: () => {
      inviteBottomSheetRef.current?.close();
      setInviteEmail('');
      Alert.alert('Success', 'Invitation sent successfully');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    },
    onError: (error: any) => {
      console.error('Invite error:', error);
      Alert.alert('Error', error.message || 'Failed to send invitation');
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const openEditSheet = () => {
    if (!team) return;
    setEditName(team.name);
    setEditDescription(team.description || '');
    setEditPrivacy(team.privacy);
    setIsEditing(true);
    editBottomSheetRef.current?.snapToIndex(0);
  };

  const openInviteSheet = () => {
    inviteBottomSheetRef.current?.snapToIndex(0);
  };

  const handleSave = () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Team name is required');
      return;
    }

    updateMutation.mutate({
      name: editName.trim(),
      
      privacy: editPrivacy,
    });
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    if (!inviteEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    inviteMutation.mutate({
      email: inviteEmail.trim(),
      role: inviteRole,
    });
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Team',
      'Are you sure you want to delete this team? All projects and tasks will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share link copied to clipboard');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  if (!team) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-lg text-gray-500">Team not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <Header
          title="Team Detail"
          actions={['invite', 'edit', 'share', 'delete']}
          actionTitle='Team'
          onInvite={openInviteSheet}
          onEdit={openEditSheet}
          onShare={handleShare}
          onDelete={confirmDelete}
        />

        <ScrollView className="flex-1">
          {/* Team Info Card */}
          <View className="mx-4 mt-4 rounded-xl bg-white p-6">
            <View className="mb-4 flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900">{team.name}</Text>
                {team.description && <Text className="mt-2 text-gray-600">{team.description}</Text>}
              </View>
              <View
                className={`rounded-full px-3 py-1 ${team.privacy === 'public' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Text
                  className={`font-medium ${team.privacy === 'public' ? 'text-green-700' : 'text-gray-700'}`}>
                  {team.privacy === 'public' ? 'Public' : 'Private'}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row gap-4">
              <View className="flex-row items-center">
                <Users size={18} color="#6B7280" />
                <Text className="ml-2 text-gray-600">{team.members?.length || 0} members</Text>
              </View>
              <View className="flex-row items-center">
                <Calendar size={18} color="#6B7280" />
                <Text className="ml-2 text-gray-600">Created {formatDate(team.createdAt)}</Text>
              </View>
            </View>
          </View>

          {/* Team Members Section */}
          <View className="mx-4 mt-4 rounded-xl bg-white p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Team Members</Text>
              <Text className="text-gray-500">{team.members?.length || 0} members</Text>
            </View>

            {team.members?.map((member, index) => (
              <View
                key={member.id || index}
                className="flex-row items-center border-b border-gray-100 py-3">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Text className="font-semibold text-purple-600">
                    {member.user?.name?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium">{member.user?.name || 'Unknown User'}</Text>
                  <Text className="text-sm text-gray-500">{member.user?.email}</Text>
                </View>
                <View
                  className={`rounded px-3 py-1 ${
                    member.role === 'admin'
                      ? 'bg-purple-100'
                      : member.role === 'manager'
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                  }`}>
                  <Text
                    className={`text-sm font-medium ${
                      member.role === 'admin'
                        ? 'text-purple-700'
                        : member.role === 'manager'
                          ? 'text-blue-700'
                          : 'text-gray-700'
                    }`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Projects Section */}
          {team.projects && team.projects.length > 0 && (
            <View className="mx-4 mb-6 mt-4 rounded-xl bg-white p-4">
              <Text className="mb-4 text-lg font-semibold">Projects ({team.projects.length})</Text>

              {team.projects.map((project) => (
                <Pressable
                  key={project.id}
                  className="flex-row items-center justify-between border-b border-gray-100 py-3"
                  onPress={() => router.push(`/projects/${project.id}`)}>
                  <View className="flex-1">
                    <Text className="font-medium">{project.name}</Text>
                    {project.description && (
                      <Text className="mt-1 text-sm text-gray-500" numberOfLines={1}>
                        {project.description}
                      </Text>
                    )}
                    <View className="mt-2 flex-row items-center">
                      <View
                        className={`rounded px-2 py-1 ${
                          flagConfig[project.flag].color.split(' ')[0]
                        }`}>
                        <Text
                          className={`text-xs font-medium ${
                            flagConfig[project.flag].color.split(' ')[1]
                          }`}>
                          {flagConfig[project.flag].label}
                        </Text>
                      </View>
                      {project.startDate && project.endDate && (
                        <Text className="ml-2 text-sm text-gray-500">
                          {formatDate(project.startDate)} - {formatDate(project.endDate)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <ChevronLeft size={20} color="#9CA3AF" />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Invite Bottom Sheet */}
      <BottomSheet
        ref={inviteBottomSheetRef}
        index={-1}
        snapPoints={['90%', '60%']}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: 'white' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}>
        <BottomSheetView style={{ flex: 1 }}>
          <View className="flex-1 px-6 pt-4">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold">Invite to Team</Text>
              <Pressable onPress={() => inviteBottomSheetRef.current?.close()}>
                <X size={24} color="#666" />
              </Pressable>
            </View>

            <Text className="mb-6 text-gray-600">Invite someone to join "{team.name}" team</Text>

            <View className="mb-6">
              <Text className="mb-2 font-medium">Email Address</Text>
              <TextInput
                className="rounded-xl border border-gray-300 px-4 py-3 text-base"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <View className="mb-8">
              <Text className="mb-3 font-medium">Role</Text>
              <View className="flex-row gap-3">
                {(['member', 'manager', 'admin'] as const).map((role) => (
                  <Pressable
                    key={role}
                    className={`flex-1 items-center rounded-xl py-3 ${
                      inviteRole === role
                        ? 'border-2 border-purple-500 bg-purple-100'
                        : 'bg-gray-100'
                    }`}
                    onPress={() => setInviteRole(role)}>
                    <Text
                      className={`font-medium ${
                        inviteRole === role ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View className="mt-4 rounded-lg bg-gray-50 p-3">
                <Text className="text-sm text-gray-600">
                  {inviteRole === 'admin' &&
                    'Admins have full control over the team, including deleting the team and managing all members.'}
                  {inviteRole === 'manager' &&
                    'Managers can create projects, invite members, and manage tasks.'}
                  {inviteRole === 'member' &&
                    'Members can view and participate in projects, but cannot manage team settings.'}
                </Text>
              </View>
            </View>

            <View className="mb-6 mt-auto">
              <Pressable
                className={`items-center rounded-xl py-4 ${
                  inviteMutation.isPending ? 'bg-purple-400' : 'bg-purple-600'
                }`}
                onPress={handleSendInvite}
                disabled={inviteMutation.isPending || !inviteEmail.includes('@')}>
                {inviteMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-lg font-semibold text-white">Send Invitation</Text>
                )}
              </Pressable>

              {inviteEmail && !inviteEmail.includes('@') && (
                <Text className="mt-2 text-center text-sm text-red-500">
                  Please enter a valid email address
                </Text>
              )}
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* Edit Team Bottom Sheet */}
      <BottomSheet
        ref={editBottomSheetRef}
        index={-1}
        snapPoints={['90%', '60%']}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: 'white' }}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}>
        <BottomSheetView style={{ flex: 1 }}>
          <View className="flex-1 px-6 pt-4">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold">Edit Team</Text>
              <Pressable onPress={() => editBottomSheetRef.current?.close()}>
                <X size={24} color="#666" />
              </Pressable>
            </View>

            <View className="mb-6">
              <Text className="mb-2 font-medium">Team Name</Text>
              <TextInput
                className="rounded-xl border border-gray-300 px-4 py-3 text-base"
                placeholder="Enter team name"
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <View className="mb-6">
              <Text className="mb-2 font-medium">Description (Optional)</Text>
              <TextInput
                className="h-24 rounded-xl border border-gray-300 px-4 py-3 text-base"
                placeholder="Describe what this team is about"
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View className="mb-8">
              <Text className="mb-3 font-medium">Privacy</Text>
              <View className="flex-row gap-3">
                <Pressable
                  className={`flex-1 items-center rounded-xl py-3 ${
                    editPrivacy === 'public'
                      ? 'border-2 border-green-500 bg-green-100'
                      : 'bg-gray-100'
                  }`}
                  onPress={() => setEditPrivacy('public')}>
                  <Text
                    className={`font-medium ${
                      editPrivacy === 'public' ? 'text-green-700' : 'text-gray-700'
                    }`}>
                    Public
                  </Text>
                </Pressable>
                <Pressable
                  className={`flex-1 items-center rounded-xl py-3 ${
                    editPrivacy === 'private'
                      ? 'border-2 border-gray-500 bg-gray-100'
                      : 'bg-gray-100'
                  }`}
                  onPress={() => setEditPrivacy('private')}>
                  <Text
                    className={`font-medium ${
                      editPrivacy === 'private' ? 'text-gray-700' : 'text-gray-700'
                    }`}>
                    Private
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="mb-6 mt-auto space-y-3">
              <Pressable
                className={`items-center rounded-xl py-4 ${
                  updateMutation.isPending ? 'bg-purple-400' : 'bg-purple-600'
                }`}
                onPress={handleSave}
                disabled={updateMutation.isPending || !editName.trim()}>
                {updateMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-lg font-semibold text-white">Save Changes</Text>
                )}
              </Pressable>

              <Pressable
                className="items-center rounded-xl border border-gray-300 py-4"
                onPress={() => editBottomSheetRef.current?.close()}>
                <Text className="font-semibold text-gray-700">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}
