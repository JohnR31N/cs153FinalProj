import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { addHabit } from '@/utils/storage';
import uuid from 'react-native-uuid';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AddHabitForm() {
  const [habitName, setHabitName] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const router = useRouter();

  const isValidHour = (h: string) => /^\d+$/.test(h) && +h >= 0 && +h <= 23;
  const isValidMinute = (m: string) => /^\d+$/.test(m) && +m >= 0 && +m <= 59;

  const formatTime = (h: string, m: string) =>
    `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;

  const handleAdd = async () => {
    if (!habitName.trim()) {
      Alert.alert('Habit name');
      return;
    }

    if (!isValidHour(hour) || !isValidMinute(minute)) {
      Alert.alert('Illegal time(xx:xx)');
      return;
    }

    const reminderTime = formatTime(hour, minute);

    const habit = {
      id: uuid.v4() as string,
      name: habitName.trim(),
      reminder: reminderTime,
    };

    try {
      await addHabit(habit);
      Alert.alert('Added', `Habit: ${habit.name}`);
      router.replace('/(tabs)');
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to save');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Habit Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. read, write, workout"
        value={habitName}
        onChangeText={setHabitName}
      />

      <Text style={styles.label}>Reminder Time</Text>
      <View style={styles.timeRow}>
        <TextInput
          style={styles.timeInput}
          placeholder="00"
          keyboardType="numeric"
          value={hour}
          onChangeText={setHour}
          maxLength={2}
        />
        <Text style={styles.colon}>:</Text>
        <TextInput
          style={styles.timeInput}
          placeholder="00"
          keyboardType="numeric"
          value={minute}
          onChangeText={setMinute}
          maxLength={2}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="checkmark-circle-outline" size={20} color="white" />
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="arrow-back-outline" size={20} color="white" />
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: 'white' },
  label: { fontSize: 18, marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: 60,
    textAlign: 'center',
  },
  colon: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#888',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 6,
  },
});
