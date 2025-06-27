import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import uuid from 'react-native-uuid';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addHabit } from '@/utils/storage';

// Ask dor permission
const useNotificationPermission = () => {
  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Access Denied', 'Cannot notice your habit tracking');
        }
      }
    };
    requestPermission();
  }, []);
};

export default function AddHabitForm() {
  const [habitName, setHabitName] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const router = useRouter();

  useNotificationPermission(); // 

  const isValidHour = (h: string) => /^\d+$/.test(h) && +h >= 0 && +h <= 23;
  const isValidMinute = (m: string) => /^\d+$/.test(m) && +m >= 0 && +m <= 59;
  const formatTime = (h: string, m: string) =>
    `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;

  const handleAdd = async () => {
    if (!habitName.trim()) {
      Alert.alert('Please enter the name of the habit');
      return;
    }
    if (!isValidHour(hour) || !isValidMinute(minute)) {
      Alert.alert('Input a legal time(00~23:00~59)');
      return;
    }
  
    const reminderTime = formatTime(hour, minute);
    const notificationId = await scheduleHabitNotification(habitName.trim(), reminderTime);
  
    const habit = {
      id: uuid.v4() as string,
      name: habitName.trim(),
      reminder: reminderTime,
      audioUri: audioUri || undefined,
      notificationId, 
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
  
  const scheduleHabitNotification = async (
    habitName: string,
    reminder: string
  ): Promise<string> => {
    const [hour, minute] = reminder.split(':').map(Number);
  
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Task Time!',
        body: `Please finish:「${habitName}」`,
      },
      trigger: {
        type: 'calendar',
        hour,
        minute,
        repeats: true,
      } as Notifications.CalendarTriggerInput,
    });
  
    return id;
  };
  

  const handleRecord = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
          const filename = `habit-audio-${Date.now()}.m4a`;
          const newPath = FileSystem.documentDirectory + filename;
          await FileSystem.moveAsync({ from: uri, to: newPath });
          setAudioUri(newPath);
          Alert.alert('Audio Recorded');
        }
        setRecording(null);
      } else {
        const permission = await Audio.requestPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Ask for audio permission');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
      }
    } catch (err) {
      console.error('Error:', err);
      Alert.alert('Failed to record');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Habit Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Name your habit here"
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

      <TouchableOpacity style={styles.recordButton} onPress={handleRecord}>
        <Text style={styles.recordButtonText}>
          {recording ? '🟥 Finish' : 'Voice Memo'}
        </Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="checkmark-circle-outline" size={20} color="white" />
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)')}
        >
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
  colon: { fontSize: 18, marginHorizontal: 10 },
  recordButton: {
    backgroundColor: '#FF7043',
    padding: 12,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  recordButtonText: { color: 'white', fontSize: 16 },
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
  buttonText: { color: 'white', fontSize: 16, marginLeft: 6 },
});
