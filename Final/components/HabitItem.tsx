// components/HabitItem.tsx
import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  name: string;
  reminder: string;
  count: number;
  missedCount?: number; 
  completed: boolean;
  audioUri?: string;
  onComplete: () => void;
  onDelete: () => void;
}

export default function HabitItem({
  name,
  reminder,
  count,
  missedCount = 0,
  completed,
  audioUri,
  onComplete,
  onDelete,
}: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);

  const handlePlay = async () => {
    try {
      if (!audioUri) return;
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      soundRef.current = sound;
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (err) {
      console.error('Failed to play:', err);
      Alert.alert('Failed to play');
    }
  };

  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteAction} onPress={onDelete}>
      <Ionicons name="trash-outline" size={24} color="white" />
      <Text style={styles.actionText}>Remove</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={[styles.card, completed && styles.cardDone]}
        onPress={onComplete}
        disabled={completed}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.reminder}> Scheduled Time: {reminder}</Text>
          <Text style={styles.count}> Completion: {count}</Text>
          
          <Text style={styles.missed}> Forgot: {missedCount}</Text>
          
        </View>

        {audioUri && (
          <TouchableOpacity style={styles.iconButton} onPress={handlePlay}>
            <Ionicons name="volume-high-outline" size={24} color="#444" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDone: {
    backgroundColor: '#d3d3d3',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reminder: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  count: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  missed: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  iconButton: {
    marginLeft: 10,
  },
  deleteAction: {
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 10,
    marginTop: 16,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
});
