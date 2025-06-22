import React, { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Habit, getHabits, removeHabit } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';

const LOG_KEY = 'daily_log_' + new Date().toISOString().split('T')[0];

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const h = await getHabits();

        // filtered illegal data
        const filtered = h.filter(
          (habit) =>
            typeof habit.reminder === 'string' && habit.reminder.includes(':')
        );

        // sort list by time
        const sorted = [...filtered].sort((a, b) => {
          const [ah, am] = a.reminder.split(':').map(Number);
          const [bh, bm] = b.reminder.split(':').map(Number);
          return ah !== bh ? ah - bh : am - bm;
        });

        const log = await AsyncStorage.getItem(LOG_KEY);
        setHabits(sorted);
        setCompleted(log ? JSON.parse(log) : []);
      };

      loadData();
    }, [])
  );

  const toggleComplete = async (id: string) => {
    if (completed.includes(id)) {
      Alert.alert('Ticked already', 'Habit completed today');
      return;
    }
    const updated = [...completed, id];
    setCompleted(updated);
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(updated));
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Deletion', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeHabit(id);
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
          setHabits(sorted);
        },
      },
    ]);
  };

  const renderHabit = ({ item }: { item: Habit }) => {
    const isDone = completed.includes(item.id);

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.habitName}>{item.name}</Text>
          <Text style={styles.reminder}>Reminder time:{item.reminder}</Text>
          <TouchableOpacity
            style={[styles.completeButton, isDone && styles.completeButtonDisabled]}
            onPress={() => toggleComplete(item.id)}
            disabled={isDone}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="white" />
            <Text style={styles.buttonText}>
              {isDone ? 'Completed' : 'Complete'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add')}>
        <Ionicons name="add-circle-outline" size={20} color="white" />
        <Text style={styles.buttonText}>Add Habit</Text>
      </TouchableOpacity>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabit}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: 'white',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminder: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  completeButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  deleteButton: {
    backgroundColor: '#E53935',
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
