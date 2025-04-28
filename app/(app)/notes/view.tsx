import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../contexts/AuthContext';

interface Note {
  _id: string;
  title: string;
  content: string;
}

export default function ViewNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [note, setNote] = useState<Note | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth(`/notes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setNote(data);
        } else {
          setNote(null);
        }
      } catch (e) {
        setNote(null);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, fetchWithAuth]);

  const deleteNote = async () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const res = await fetchWithAuth(`/notes/${id}`, { method: 'DELETE' });
            if (res.ok) {
              router.replace('/(app)/notes');
            } else {
              Alert.alert('Failed to delete note.');
            }
          } catch (e) {
            Alert.alert('Network error.');
          }
        }
      }
    ]);
  };

  const toggleQRCode = () => {
    setQrError(false);
    setShowQR(!showQR);

    // Scroll to bottom when QR is shown to make it visible
    if (!showQR) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#3a86ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>View Note</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3a86ff" />
          <Text style={styles.loadingText}>Loading note...</Text>
        </View>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#3a86ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>View Note</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Note not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(app)/notes')}>
            <Text style={styles.backButtonText}>Back to Notes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3a86ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Note</Text>
        <TouchableOpacity onPress={deleteNote}>
          <Ionicons name="trash-outline" size={24} color="#ff3a3a" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.contentContainer}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>{note.title}</Text>
          <Text style={styles.noteContent}>{note.content}</Text>
        </View>
        
        {showQR && (
          <View style={styles.qrContainer}>
            {qrError ? (
              <View style={styles.qrErrorContainer}>
                <Ionicons name="warning-outline" size={48} color="#ff9800" />
                <Text style={styles.qrErrorText}>Could not generate QR code</Text>
              </View>
            ) : (
              <View style={styles.qrWrapper}>
                <QRCode 
                  value={JSON.stringify({ title: note.title, content: note.content })} 
                  size={200}
                  onError={() => setQrError(true)}
                  logoBackgroundColor="white"
                />
              </View>
            )}
            <Text style={styles.qrHint}>Show this QR code to share your note</Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => router.push({ pathname: '/(app)/notes/create', params: { editId: note._id } })}
        >
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={toggleQRCode}
        >
          <Ionicons name={showQR ? "close-outline" : "share-social-outline"} size={24} color="white" />
        </TouchableOpacity>
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
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#3a86ff',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#666',
    fontSize: 18,
    fontWeight: '600', 
    marginTop: 16,
  },
  backButton: {
    backgroundColor: '#3a86ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  noteTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 16 
  },
  noteContent: { 
    fontSize: 16, 
    color: '#444', 
    lineHeight: 24,
  },
  qrContainer: { 
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    }),
  },
  qrErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: 200,
  },
  qrErrorText: {
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  qrHint: { 
    marginTop: 16, 
    color: '#666', 
    fontSize: 14, 
    textAlign: 'center' 
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'column',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3a86ff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#8c52ff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});
