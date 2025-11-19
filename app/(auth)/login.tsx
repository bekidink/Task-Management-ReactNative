// app/(auth)/login.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { Mail, Lock, Loader2 } from 'lucide-react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = useAuthStore((s) => s.signIn);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'እባክዎን ኢሜይል እና የይለፍ ቃል ያስገቡ');
      return;
    }

    setLoading(true);
    try {
    const res=  await signIn(email.trim().toLowerCase(), password);
    console.log('res',res)
      router.replace('/(tabs)/home' as never); // Go to main app
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-b from-indigo-600 to-purple-700">
      <View className="flex-1 justify-center px-8">
        {/* Logo */}
        <View className="mb-12 items-center">
          <View className="mb-4 rounded-full bg-white/20 p-6">
            <Text className="text-6xl font-bold ">Tasker</Text>
          </View>
          <Text className="mt-2 text-2xl font-bold ">Welcome Back!</Text>
          <Text className="mt-2 text-center ">እንደገና መጡ!</Text>
        </View>

        {/* Form */}
        <View className="rounded-3xl bg-white p-8 shadow-2xl">
          <Text className="mb-6 text-center text-2xl font-bold text-gray-800">Login to Tasker</Text>

          {/* Email */}
          <View className="mb-5">
            <View className="flex-row items-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-1">
              <Mail className="mr-3 text-indigo-600" size={24} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
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
            <View className="flex-row items-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-1">
              <Lock className="mr-3 text-indigo-600" size={24} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="flex-1 text-gray-800"
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="flex-row bg-black items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4">
            {loading ? (
              <Loader2 className="animate-spin text-white" size={24} />
            ) : (
              <Text className="text-lg font-bold text-white">Login</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View className="mt-6 items-center">
            <Text className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/(auth)/register" className="font-bold text-indigo-600">
                Register
              </Link>
            </Text>
            
          </View>
        </View>

        {/* Footer */}
        <Text className="mt-10 text-center text-sm text-white/70">
          © 2025 Tasker Ethiopia • Made with love in Addis Ababa
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
