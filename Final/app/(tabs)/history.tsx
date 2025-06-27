import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHabits, Habit, clearAllLogs } from '@/utils/storage';
import { format, subDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

type HabitRow = {
  date: string;
  completedHabits: string[];
};

export default function HistoryScreen() {
  const [historyData, setHistoryData] = useState<HabitRow[]>([]);
  const [habitMap, setHabitMap] = useState<Record<string, string>>({}); // id -> name

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const habits: Habit[] = await getHabits();
    const map: Record<string, string> = {};
    habits.forEach((h) => {
      map[h.id] = h.name;
    });
    setHabitMap(map);

    const days = 7;
    const data: HabitRow[] = [];
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const key = `daily_log_${date}`;
      const json = await AsyncStorage.getItem(key);
      const completedIds: string[] = json ? JSON.parse(json) : [];
      const completedNames = completedIds.map((id) => map[id]).filter(Boolean);
      data.push({ date, completedHabits: completedNames });
    }

    setHistoryData(data);
  };

  const handleClear = () => {
    Alert.alert('Clear All', 'Delete all logs?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: async () => {
          await clearAllLogs();
          setHistoryData([]);
          Alert.alert('Cleared');
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: HabitRow }) => (
    <View style={styles.row}>
      <Text style={styles.date}>
        {item.completedHabits.length > 0 ? '✅' : '❌'} {item.date}
      </Text>
      <Text style={styles.habits}>
        {item.completedHabits.length > 0 ? item.completedHabits.join('、') : 'No record'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaView style={styles.clearRow}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Ionicons name="trash-outline" size={18} color="white" />
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <FlatList
        data={historyData}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  row: {
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habits: {
    fontSize: 14,
    color: '#555',
  },
  clearRow: {
    marginBottom: 26,
    alignItems: 'flex-end',
  },
  clearButton: {
    flexDirection: 'row',
    backgroundColor: '#e53935',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },
});
