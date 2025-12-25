// app/(auth)/register.tsx
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
import { Loader2, ArrowLeft, Calendar } from 'lucide-react-native';

export default function Register() {
  const [name, setName] = useState('Lois');
  const [email, setEmail] = useState('Loisoecket@gmail.com');
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
      className="flex-1">
      {/* Background: Blue upper half, white lower half - same as login */}
      <View className="absolute inset-0">
        <View style={{ backgroundColor: '#0051A8' }} className="h-1/2" />
        <View className="h-1/2 bg-white" />
      </View>

      <View className="flex-1 px-8">
        {/* Header - Back button + Title (keeping original structure but updated styling) */}
        <TouchableOpacity onPress={() => router.back()} className="mb-8 mt-12">
          <ArrowLeft size={28} color="white" />
        </TouchableOpacity>

        <View className="mb-10 items-center">
          <Text className="text-4xl font-bold text-white">Sign Up</Text>
          <Text className="mt-3 text-lg text-white/90">Create Account</Text>
         
          <Text className="mt-4 text-center text-white/80">
            Already have an account?{' '}
            <Link href="/(auth)/login" className="font-bold text-white underline">
              Log In
            </Link>
          </Text>
        </View>

        {/* Form Card - Updated styling to match screenshot exactly */}
        <View className="rounded-3xl bg-white p-8 shadow-2xl">
          {/* Name field - Single field like original, prefilled to match screenshot */}
          <View className="mb-4">
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
              className="rounded-xl border border-gray-300 bg-gray-50 px-5 py-4 text-base text-gray-800"
            />
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
          <View className="mb-6">
            <TextInput
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="rounded-xl border border-gray-300 bg-gray-50 px-5 py-4 text-base text-gray-800"
            />
          </View>

          {/* Register Button - Updated color to match theme */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={{ backgroundColor: '#0051A8' }}
            className="mb-6 rounded-xl py-4 shadow-lg">
            {loading ? (
              <Loader2 className="animate-spin self-center text-white" size={28} />
            ) : (
              <Text className="text-center text-lg font-bold text-white">Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Divider - Original OR logic preserved */}
          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-gray-300" />
            <Text className="mx-4 font-medium text-gray-500">OR</Text>
            <View className="h-px flex-1 bg-gray-300" />
          </View>

          {/* Google Button - Simplified single Google button like screenshot */}
          <TouchableOpacity className="mb-8 flex-row items-center justify-center rounded-xl border border-gray-300 bg-white py-4 shadow">
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
              }}
              className="mr-3 h-6 w-6"
            />
            <Text className="text-lg font-medium text-gray-800">Sign up with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
