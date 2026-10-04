import { ActivityIndicator, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

export default function TabsLayout(){
  const { session, loading } = useAuth();
  if (loading) return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large"/></View>;
  if (!session) return <Redirect href="/(auth)/login"/>;
  return <Tabs screenOptions={{headerTitleAlign:'center'}}><Tabs.Screen name="index" options={{title:'Home'}}/><Tabs.Screen name="groups" options={{title:'Groups'}}/><Tabs.Screen name="plans" options={{title:'Plans'}}/><Tabs.Screen name="profile" options={{title:'Profile'}}/></Tabs>;
}
