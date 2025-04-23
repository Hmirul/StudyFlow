import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

// Timer states
enum TimerState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  BREAK = 'break',
}

// Timer modes with their respective durations in minutes
const TIMER_MODES = {
  POMODORO: 25,
  SHORT_BREAK: 5,
  LONG_BREAK: 15,
};

export default function PomodoroScreen() {
  const router = useRouter();
  const [timerState, setTimerState] = useState<TimerState>(TimerState.IDLE);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_MODES.POMODORO * 60);
  const [activeMode, setActiveMode] = useState<'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK'>('POMODORO');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Load and play sound effect
  const playSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/timer-end.mp3'),
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      await sound.setVolumeAsync(1.0);
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start the timer
  const startTimer = () => {
    setTimerState(
      activeMode === 'POMODORO' ? TimerState.RUNNING : TimerState.BREAK
    );
    
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          
          // Play sound when timer ends
          playSound();
          
          // If pomodoro completed, move to break or vice versa
          if (activeMode === 'POMODORO') {
            const newCompleted = completedPomodoros + 1;
            setCompletedPomodoros(newCompleted);
            
            // After every 4 pomodoros, take a long break
            if (newCompleted % 4 === 0) {
              setActiveMode('LONG_BREAK');
              setSecondsLeft(TIMER_MODES.LONG_BREAK * 60);
              Alert.alert('Great job!', 'Time for a longer break.');
            } else {
              setActiveMode('SHORT_BREAK');
              setSecondsLeft(TIMER_MODES.SHORT_BREAK * 60);
              Alert.alert('Pomodoro completed!', 'Time for a short break.');
            }
          } else {
            // Break completed, go back to pomodoro
            setActiveMode('POMODORO');
            setSecondsLeft(TIMER_MODES.POMODORO * 60);
            Alert.alert('Break finished', 'Time to focus again!');
          }
          
          setTimerState(TimerState.IDLE);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Pause the timer
  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerState(TimerState.PAUSED);
  };

  // Reset the timer
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSecondsLeft(TIMER_MODES[activeMode] * 60);
    setTimerState(TimerState.IDLE);
  };

  // Handle timer mode switching
  const switchMode = (mode: 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK') => {
    if (timerState === TimerState.RUNNING || timerState === TimerState.BREAK) {
      Alert.alert(
        'Timer Running',
        'Are you sure you want to switch modes? This will reset your current timer.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Switch',
            style: 'destructive',
            onPress: () => {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              setActiveMode(mode);
              setSecondsLeft(TIMER_MODES[mode] * 60);
              setTimerState(TimerState.IDLE);
            },
          },
        ]
      );
    } else {
      setActiveMode(mode);
      setSecondsLeft(TIMER_MODES[mode] * 60);
      setTimerState(TimerState.IDLE);
    }
  };

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Calculate progress percentage for the progress circle
  const progressPercentage = (1 - secondsLeft / (TIMER_MODES[activeMode] * 60)) * 100;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3a86ff" />
        </TouchableOpacity>
        <Text style={styles.title}>Pomodoro Timer</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              activeMode === 'POMODORO' && styles.activeModeButton,
            ]}
            onPress={() => switchMode('POMODORO')}
          >
            <Text style={[
              styles.modeButtonText,
              activeMode === 'POMODORO' && styles.activeModeButtonText,
            ]}>
              Pomodoro
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              activeMode === 'SHORT_BREAK' && styles.activeModeButton,
            ]}
            onPress={() => switchMode('SHORT_BREAK')}
          >
            <Text style={[
              styles.modeButtonText,
              activeMode === 'SHORT_BREAK' && styles.activeModeButtonText,
            ]}>
              Short Break
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              activeMode === 'LONG_BREAK' && styles.activeModeButton,
            ]}
            onPress={() => switchMode('LONG_BREAK')}
          >
            <Text style={[
              styles.modeButtonText,
              activeMode === 'LONG_BREAK' && styles.activeModeButtonText,
            ]}>
              Long Break
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timerContainer}>
          <View style={styles.timerProgressOuter}>
            <View 
              style={[
                styles.timerProgressInner, 
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: activeMode === 'POMODORO' 
                    ? '#3a86ff' 
                    : activeMode === 'SHORT_BREAK' 
                      ? '#2ecc71' 
                      : '#f39c12'
                }
              ]}
            />
          </View>
          
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          
          <Text style={styles.stateText}>
            {timerState === TimerState.RUNNING && 'Focus Time'}
            {timerState === TimerState.BREAK && 'Break Time'}
            {timerState === TimerState.PAUSED && 'Paused'}
            {timerState === TimerState.IDLE && 'Ready'}
          </Text>
        </View>

        <View style={styles.controls}>
          {/* Start/Resume Button */}
          {(timerState === TimerState.IDLE || timerState === TimerState.PAUSED) && (
            <TouchableOpacity 
              style={[styles.controlButton, styles.startButton]} 
              onPress={startTimer}
            >
              <Ionicons name="play" size={28} color="#fff" />
            </TouchableOpacity>
          )}
          
          {/* Pause Button */}
          {(timerState === TimerState.RUNNING || timerState === TimerState.BREAK) && (
            <TouchableOpacity 
              style={[styles.controlButton, styles.pauseButton]} 
              onPress={pauseTimer}
            >
              <Ionicons name="pause" size={28} color="#fff" />
            </TouchableOpacity>
          )}
          
          {/* Reset Button */}
          <TouchableOpacity 
            style={[styles.controlButton, styles.resetButton]}
            onPress={resetTimer}
          >
            <Ionicons name="refresh" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsLabel}>Completed Pomodoros</Text>
          <View style={styles.pomodoroCounter}>
            {[...Array(Math.min(completedPomodoros, 8))].map((_, index) => (
              <Ionicons
                key={index}
                name="checkmark-circle"
                size={24}
                color="#3a86ff"
                style={styles.pomodoroIcon}
              />
            ))}
            {completedPomodoros > 8 && (
              <Text style={styles.pomodoroExtraCount}>+{completedPomodoros - 8}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>The Pomodoro Technique</Text>
          <Text style={styles.infoText}>
            1. Work for 25 minutes (one "Pomodoro") {"\n"}
            2. Take a short 5-minute break {"\n"}
            3. After 4 Pomodoros, take a longer 15-minute break {"\n"}
            4. Repeat to maximize productivity
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3a86ff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#EAEAEF',
    borderRadius: 8,
    marginBottom: 30,
    padding: 4,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeModeButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeModeButtonText: {
    color: '#333',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  timerProgressOuter: {
    width: '100%',
    height: 8,
    backgroundColor: '#EAEAEF',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  timerProgressInner: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#333',
    fontVariant: ['tabular-nums'],
  },
  stateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  startButton: {
    backgroundColor: '#3a86ff',
  },
  pauseButton: {
    backgroundColor: '#f39c12',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
  },
  statsContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  pomodoroCounter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pomodoroIcon: {
    marginHorizontal: 3,
  },
  pomodoroExtraCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3a86ff',
    marginLeft: 5,
  },
  infoBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});