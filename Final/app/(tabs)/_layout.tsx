// app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Layout() {
  return (
    <View style={styles.container}>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="(tabs)/Habits"
          options={{
            title: 'Habits',
            tabBarIcon: ({ color, size }) => <Ionicons name="menu" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="(tabs)/History"
          options={{
            title: 'Log History',
            tabBarIcon: ({ color, size }) => <Ionicons name="time" color={color} size={size} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
