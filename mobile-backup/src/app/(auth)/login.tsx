import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [loading, setLoading] = useState(false);
  async function login() {
    if (!email.trim() || !password) return Alert.alert('Missing information', 'Enter your email and password.');
    try { setLoading(true); const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); if (error) throw error; router.replace('/(tabs)'); }
    catch (error) { Alert.alert('Could not sign in', error instanceof Error ? error.message : 'Something went wrong.'); }
    finally { setLoading(false); }
  }
  return <SafeAreaView style={styles.container}><Text style={styles.title}>Welcome back</Text><TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/><TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/><Pressable style={styles.button} onPress={login} disabled={loading}><Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign in'}</Text></Pressable><Link href="/(auth)/signup" style={styles.link}>Create an account</Link></SafeAreaView>;
}
const styles=StyleSheet.create({container:{flex:1,padding:24,justifyContent:'center',gap:14},title:{fontSize:32,fontWeight:'700',marginBottom:12},input:{borderWidth:1,borderColor:'#ddd',borderRadius:12,padding:14,fontSize:16},button:{backgroundColor:'#111',padding:16,borderRadius:12,alignItems:'center'},buttonText:{color:'#fff',fontWeight:'700'},link:{textAlign:'center',marginTop:8}});
