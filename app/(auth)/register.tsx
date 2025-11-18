// app/(auth)/register.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react-native';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = useAuthStore((s) => s.signUp);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'እባክዎን ሁሉንም መረጃዎች ይሙሉ');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password);
      Alert.alert('Success', 'መለያዎ ተፈጥሯል! እባክዎን ኢሜይልዎን ያረጋግጡ', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'የተሳሳተ መረጃ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-b from-indigo-600 to-purple-700">
      <View className="flex-1 justify-center px-8">
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} className="mb-8">
          <ArrowLeft size={28} color="white" />
        </TouchableOpacity>

        <View className="mb-10 items-center">
          <Text className="text-5xl font-bold text-white">Tasker</Text>
          <Text className="mt-3 text-xl text-white/90">Create Account</Text>
          <Text className="text-white/80">መለያ ይፍጠሩ</Text>
        </View>

        {/* Form Card */}
        <View className="rounded-3xl bg-white p-8 shadow-2xl">
          {/* Name */}
          <View className="mb-5">
            <View className="flex-row items-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-4">
              <User className="mr-3 text-indigo-600" size={24} />
              <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                className="flex-1 text-gray-800"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-5">
            <View className="flex-row items-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-4">
              <Mail className="mr-3 text-indigo-600" size={24} />
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-gray-800"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-6">
            <View className="flex-row items-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-4">
              <Lock className="mr-3 text-indigo-600" size={24} />
              <TextInput
                placeholder="Password (6+ characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="flex-1 text-gray-800"
              />
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="flex-row items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4">
            {loading ? (
              <Loader2 className="animate-spin text-white" size={24} />
            ) : (
              <Text className="text-lg font-bold text-white">Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-gray-300" />
            <Text className="mx-4 text-gray-500">OR</Text>
            <View className="h-px flex-1 bg-gray-300" />
          </View>

          {/* Social Login */}
          <SocialLoginButtons />

          {/* Login Link */}
          <View className="mt-6 items-center">
            <Text className="text-gray-600">
              Already have an account?{' '}
              <Link href="/(auth)/login" className="font-bold text-indigo-600">
                Login
              </Link>
            </Text>
            <Text className="mt-2 text-gray-600">
              መለያ አለዎት?{' '}
              <Link href="/(auth)/login" className="font-bold text-indigo-600">
                ይግቡ
              </Link>
            </Text>
          </View>
        </View>

        <Text className="mt-10 text-center text-sm text-white/70">
          © 2025 Tasker Ethiopia • Made in Addis Ababa
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
