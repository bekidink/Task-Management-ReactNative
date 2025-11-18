// components/auth/SocialLoginButtons.tsx
import { TouchableOpacity, View, Text, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Facebook, Chrome } from 'lucide-react-native';

export default function SocialLoginButtons() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'tasker://auth-callback', // Deep link
      },
    });
    if (error) Alert.alert('Google Login Failed', error.message);
  };

  const handleFacebookLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: 'tasker://auth-callback',
      },
    });
    if (error) Alert.alert('Facebook Login Failed', error.message);
  };

  return (
    <View className="space-y-3">
      <TouchableOpacity
        onPress={handleGoogleLogin}
        className="flex-row items-center justify-center rounded-xl border-2 border-gray-300 bg-white py-4">
        <Chrome size={24} color="#4285F4" className="mr-3" />
        <Text className="font-semibold text-gray-800">Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleFacebookLogin}
        className="flex-row items-center justify-center rounded-xl border-2 border-gray-300 bg-white py-4">
        <Facebook size={24} color="#1877F2" className="mr-3" />
        <Text className="font-semibold text-gray-800">Continue with Facebook</Text>
      </TouchableOpacity>
    </View>
  );
}
