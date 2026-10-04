import { SafeAreaView, StyleSheet, Text } from 'react-native';
export default function PlansScreen(){return <SafeAreaView style={styles.container}><Text style={styles.title}>Plans</Text><Text style={styles.text}>Confirmed group plans will appear here after voting is implemented.</Text></SafeAreaView>}
const styles=StyleSheet.create({container:{flex:1,padding:24},title:{fontSize:30,fontWeight:'700'},text:{marginTop:12,opacity:.65,fontSize:16}});
