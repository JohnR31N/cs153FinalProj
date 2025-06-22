// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_KEY = 'habits';

export type Habit = {
  id: string;
  name: string;
  reminder: string; // HH:mm 格式
};

// 获取全部习惯
export async function getHabits(): Promise<Habit[]> {
  const json = await AsyncStorage.getItem(HABITS_KEY);
  return json ? JSON.parse(json) : [];
}
export async function removeHabit(id: string) {
  const habits = await getHabits();
  const filtered = habits.filter(h => h.id !== id);
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(filtered));
}
// 添加新习惯
export async function addHabit(habit: Habit) {
  const habits = await getHabits();
  habits.push(habit);
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

// 清空所有习惯（调试用）
export async function clearHabits() {
  await AsyncStorage.removeItem(HABITS_KEY);
}
export async function clearAllLogs() {
  const keys = await AsyncStorage.getAllKeys();
  const logKeys = keys.filter((key) => key.startsWith('daily_log_'));
  await AsyncStorage.multiRemove(logKeys);
}
