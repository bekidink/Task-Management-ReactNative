import '../global.css';
// app/_layout.tsx
import { Stack } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const { user, loading, init } = useAuthStore();

  useEffect(() => {
    init();
    console.log("lg",loading)
  }, []);
console.log(user)
  // if (loading) {
  //   return (
  //     <View className="flex-1 justify-center items-center bg-indigo-600">
  //       <ActivityIndicator size="large" color="white" />
  //       <Text className="text-white text-2xl font-bold mt-6">Tasker</Text>
  //       <Text className="text-white/80 mt-2">እየተከፈተ ነው...</Text>
  //     </View>
  //   );
  // }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" redirect={!user} />
        <Stack.Screen name="(auth)" redirect={!!user} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GestureHandlerRootView>
  );
}