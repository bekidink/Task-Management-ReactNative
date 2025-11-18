// app/(tabs)/tasks/_layout.tsx
import { Stack } from 'expo-router';

export default function TasksLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* You can now safely add: */}
      {/* <Stack.Screen name="new" options={{ presentation: "modal" }} /> */}
      {/* <Stack.Screen name="[id]" /> */}
    </Stack>
  );
}
