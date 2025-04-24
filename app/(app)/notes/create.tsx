import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function CreateNoteScreen() {
  const router = useRouter();
  const { fetchWithAuth } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { editId } = useLocalSearchParams();

  useEffect(() => {
    if (editId) {
      fetchNote();
    }
  }, [editId]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`/notes/${editId}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
        setIsEditing(true);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load note data');
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Title and content are required.');
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing && editId) {
        // Update existing note
        const res = await fetchWithAuth(`/notes/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ title, content })
        });
        
        if (res.ok) {
          router.replace('/(app)/notes');
        } else {
          Alert.alert('Error', 'Failed to update note.');
        }
      } else {
        // Create new note
        const res = await fetchWithAuth('/notes', {
          method: 'POST',
          body: JSON.stringify({ title, content })
        });
        
        if (res.ok) {
          router.replace('/(app)/notes');
        } else {
          Alert.alert('Error', 'Failed to save note.');
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#3a86ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Note</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3a86ff" />
          <Text style={styles.loadingText}>Loading note...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#3a86ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Note' : 'Create Note'}</Text>
          <TouchableOpacity onPress={saveNote} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#3a86ff" />
            ) : (
              <Ionicons name="save-outline" size={24} color="#3a86ff" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter note title"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Write your note here..."
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveNote}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Note</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3a86ff',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contentInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a86ff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});
