import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import HabitItem from '@/components/HabitItem';
import { Habit, getHabits, removeHabit } from '@/utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const getTodayKey = () => 'daily_log_' + new Date().toISOString().split('T')[0];
const COUNT_KEY = 'habit_counts';
const MISSED_KEY = 'habit_missed';

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [counts, setCounts] = useState<{ [id: string]: number }>({});
  const [missed, setMissed] = useState<{ [id: string]: number }>({});
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const LOG_KEY = getTodayKey();
        const h = await getHabits();

        const filtered = h.filter(
          (habit) =>
            typeof habit.reminder === 'string' && habit.reminder.includes(':')
        );

        const sorted = [...filtered].sort((a, b) => {
          const [ah, am] = a.reminder.split(':').map(Number);
          const [bh, bm] = b.reminder.split(':').map(Number);
          return ah !== bh ? ah - bh : am - bm;
        });

        const log = await AsyncStorage.getItem(LOG_KEY);
        const countJson = await AsyncStorage.getItem(COUNT_KEY);
        const missedJson = await AsyncStorage.getItem(MISSED_KEY);

        setHabits(sorted);
        setCompleted(log ? JSON.parse(log) : []);
        setCounts(countJson ? JSON.parse(countJson) : {});
        setMissed(missedJson ? JSON.parse(missedJson) : {});
      };

      loadData();
    }, [currentDate])
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      const today = new Date().toISOString().split('T')[0];
      if (today !== currentDate) {
        const previousLog = await AsyncStorage.getItem(getTodayKey());
        const previousCompleted: string[] = previousLog
          ? JSON.parse(previousLog)
          : [];

        const allHabits = await getHabits();
        const prevMissed = await AsyncStorage.getItem(MISSED_KEY);
        const missedCounts = prevMissed ? JSON.parse(prevMissed) : {};

        for (const habit of allHabits) {
          if (!previousCompleted.includes(habit.id)) {
            missedCounts[habit.id] = (missedCounts[habit.id] || 0) + 1;
          }
        }

        await AsyncStorage.setItem(MISSED_KEY, JSON.stringify(missedCounts));
        setMissed(missedCounts);
        setCurrentDate(today);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [currentDate]);

  const handleComplete = async (id: string) => {
    if (completed.includes(id)) return;

    const updated = [...completed, id];
    setCompleted(updated);
    await AsyncStorage.setItem(getTodayKey(), JSON.stringify(updated));

    const newCounts = { ...counts, [id]: (counts[id] || 0) + 1 };
    setCounts(newCounts);
    await AsyncStorage.setItem(COUNT_KEY, JSON.stringify(newCounts));
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Confirmation', 'Delete this habit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeHabit(id);
          const h = await getHabits();
          const filtered = h.filter(
            (habit) =>
              typeof habit.reminder === 'string' &&
              habit.reminder.includes(':')
          );
          const sorted = [...filtered].sort((a, b) => {
            const [ah, am] = a.reminder.split(':').map(Number);
            const [bh, bm] = b.reminder.split(':').map(Number);
            return ah !== bh ? ah - bh : am - bm;
          });
          setHabits(sorted);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Habit }) => {
    const isDone = completed.includes(item.id);
    const count = counts[item.id] || 0;
    const missedCount = missed[item.id] || 0;

    return (
      <HabitItem
        name={item.name}
        reminder={item.reminder}
        count={count}
        missedCount={missedCount}
        completed={isDone}
        audioUri={item.audioUri}
        onComplete={() => handleComplete(item.id)}
        onDelete={() => handleDelete(item.id)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.dateHeaderBig}>Tasker</Text>
      <Text style={styles.dateHeader}>{currentDate}</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add')}
      >
        <Ionicons name="add-circle-outline" size={22} color="white" />
        <Text style={styles.buttonText}>Add New Habit</Text>
      </TouchableOpacity>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No habits added yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  dateHeaderBig: {
    fontSize: 25,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    marginLeft: 8,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 40,
  },
});
