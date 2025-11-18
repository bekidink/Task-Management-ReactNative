// app/(tabs)/tasks/_layout.tsx
import { Stack } from 'expo-router';

export default function GroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* You can now safely add: */}
      <Stack.Screen name="name" />
      <Stack.Screen name="confirm" />
    </Stack>
  );
}
