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
import { Loader2 } from 'lucide-react-native';
import { Logo } from '@/constants/icons';

export default function Login() {
  const [email, setEmail] = useState('Loisoecket@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const signIn = useAuthStore((s) => s.signIn);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace('/(tabs)/home' as never);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Incorrect email or password');
    } finally {
      router.replace('/(tabs)/home' as never);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      {/* Blue upper half with subtle grid pattern feel */}
      <View className="absolute inset-0">
        <View style={{ backgroundColor: '#0051A8' }} className="h-1/2" />
        <View className="h-1/2 bg-white" />
      </View>

      <View className="flex-1 justify-center px-8">
        {/* Logo & Header – placed in blue area */}
        <View className="mb-12 items-center">
          <View className="mb-6 rounded-full bg-white/30 p-8">
          <Image source={Logo}/>
            {/* <Text className="text-6xl font-extrabold text-white">U</Text> */}
          </View>

          <Text className="text-3xl font-bold text-white">Sign in to your</Text>
          <Text className="mb-2 text-3xl font-bold text-white">Account</Text>

          <Text className="text-lg text-white/80">Enter your email and password to log in</Text>
        </View>

        {/* Form Card – sits on the white lower half */}
        <View className="rounded-3xl bg-white p-8 shadow-2xl">
          {/* Google Button */}
          <TouchableOpacity className="mb-6 flex-row items-center justify-center rounded-xl border border-gray-300 bg-white py-4 shadow">
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
              }}
              className="mr-3 h-6 w-6"
            />
            <Text className="text-lg font-medium text-gray-800">Continue with Google</Text>
          </TouchableOpacity>

          <View className="mb-6 flex-row items-center">
            <View className="h-px flex-1 bg-gray-300" />
            <Text className="mx-4 text-gray-500">Or login with</Text>
            <View className="h-px flex-1 bg-gray-300" />
          </View>

          {/* Email */}
          <View className="mb-4">
            <TextInput
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-xl border border-gray-300 bg-gray-50 px-5 py-4 text-base text-gray-800"
            />
          </View>

          {/* Password */}
          <View className="mb-2">
            <TextInput
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="rounded-xl border border-gray-300 bg-gray-50 px-5 py-4 text-base text-gray-800"
            />
          </View>

          {/* Remember me & Forgot */}
          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              className="flex-row items-center">
              <View
                className={`mr-3 h-5 w-5 rounded border-2 ${rememberMe ? 'border-[#0051A8] bg-[#0051A8]' : 'border-gray-400'}`}>
                {rememberMe && <Text className="text-center text-xs font-bold text-white">✓</Text>}
              </View>
              <Text className="text-gray-700">Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text className="font-medium text-[#0051A8]">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{ backgroundColor: '#0051A8' }}
            className="rounded-xl py-4 shadow-lg">
            {loading ? (
              <Loader2 className="animate-spin self-center text-white" size={28} />
            ) : (
              <Text className="text-center text-lg font-bold text-white">Log In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="mt-6 items-center">
            <Text className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/(auth)/register" className="font-bold text-[#0051A8]">
                Sign Up
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
