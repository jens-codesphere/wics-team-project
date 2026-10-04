import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/providers/AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerBackTitle: 'Back' }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="group/create" options={{ title: 'Create group' }} />
        <Stack.Screen name="group/[id]" options={{ title: 'Group' }} />
        <Stack.Screen name="recommendations/[groupId]" options={{ title: 'Recommendations' }} />
      </Stack>
    </AuthProvider>
  );
}
