// components/HabitItem.tsx
import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Habit } from '@/utils/storage';

type Props = {
  habit: Habit;
  completed: boolean;
  onComplete: () => void;
  onDelete: () => void;
};

export default function HabitItem({ habit, completed, onComplete, onDelete }: Props) {
  return (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.text}>
          {habit.name}（Time reminder{habit.reminder}）
        </Text>
        <Button
          title={completed ? '✅ Completed' : 'Complete'}
          onPress={onComplete}
          disabled={completed}
        />
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Text style={styles.deleteText}>❌</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  deleteText: {
    fontSize: 20,
    color: 'red',
  },
});
