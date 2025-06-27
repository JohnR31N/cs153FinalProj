// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const HABITS_KEY = 'habits';
const COUNT_KEY = 'habit_counts';
const UNFINISHED_KEY = 'habit_unfinished_counts';

export type Habit = {
  id: string;
  name: string;
  reminder: string; // HH:mm 
  audioUri?: string;
  notificationId?: string; // notification
};

// get
export async function getHabits(): Promise<Habit[]> {
  const json = await AsyncStorage.getItem(HABITS_KEY);
  return json ? JSON.parse(json) : [];
}

// add
export async function addHabit(habit: Habit) {
  const habits = await getHabits();
  habits.push(habit);
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

// del
export async function removeHabit(id: string) {
  const habits = await getHabits();
  const target = habits.find(h => h.id === id);
  if (target?.notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(target.notificationId);
    } catch (err) {
      console.warn('Failed', err);
    }
  }
  const filtered = habits.filter(h => h.id !== id);
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(filtered));
}

// del
export async function clearHabits() {
  await AsyncStorage.removeItem(HABITS_KEY);
}

// Clear
export async function clearAllLogs() {
  const keys = await AsyncStorage.getAllKeys();
  const logKeys = keys.filter((key) => key.startsWith('daily_log_'));
  await AsyncStorage.multiRemove(logKeys);
}

// get comp
export async function getCompletionCounts(): Promise<{ [id: string]: number }> {
  const json = await AsyncStorage.getItem(COUNT_KEY);
  return json ? JSON.parse(json) : {};
}

// save comp
export async function saveCompletionCounts(counts: { [id: string]: number }) {
  await AsyncStorage.setItem(COUNT_KEY, JSON.stringify(counts));
}

// get incomp
export async function getUnfinishedCounts(): Promise<{ [id: string]: number }> {
  const json = await AsyncStorage.getItem(UNFINISHED_KEY);
  return json ? JSON.parse(json) : {};
}

// save incomp
export async function saveUnfinishedCounts(counts: { [id: string]: number }) {
  await AsyncStorage.setItem(UNFINISHED_KEY, JSON.stringify(counts));
}
