import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [loading,setLoading]=useState(false);
  async function signup(){ if(!name.trim()||!email.trim()||password.length<6) return Alert.alert('Check your details','Enter a name, email, and a password of at least 6 characters.'); try{setLoading(true); const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{display_name:name.trim()}}}); if(error) throw error; if(data.session) router.replace('/'); else Alert.alert('Check your email','Confirm your email, then sign in.');}catch(error){Alert.alert('Could not sign up',error instanceof Error?error.message:'Something went wrong.');}finally{setLoading(false);} }
  return <SafeAreaView style={styles.container}><Text style={styles.title}>Create account</Text><TextInput style={styles.input} placeholder="Display name" value={name} onChangeText={setName}/><TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/><TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/><Pressable style={styles.button} onPress={signup} disabled={loading}><Text style={styles.buttonText}>{loading?'Creating…':'Create account'}</Text></Pressable><Link href="/login" style={styles.link}>Already have an account? Sign in</Link></SafeAreaView>;
}
const styles=StyleSheet.create({container:{flex:1,padding:24,justifyContent:'center',gap:14},title:{fontSize:32,fontWeight:'700',marginBottom:12},input:{borderWidth:1,borderColor:'#ddd',borderRadius:12,padding:14,fontSize:16},button:{backgroundColor:'#111',padding:16,borderRadius:12,alignItems:'center'},buttonText:{color:'#fff',fontWeight:'700'},link:{textAlign:'center',marginTop:8}});
