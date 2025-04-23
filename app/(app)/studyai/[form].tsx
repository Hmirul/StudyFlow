import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Subject data with icons and colors
const SUBJECTS = [
  { 
    id: 'mathematics', 
    title: 'Mathematics', 
    icon: 'calculator-outline',
    color: '#4361ee' 
  },
  { 
    id: 'science', 
    title: 'Science', 
    icon: 'flask-outline',
    color: '#3a86ff' 
  },
  { 
    id: 'english', 
    title: 'English', 
    icon: 'book-outline',
    color: '#4cc9f0' 
  },
  { 
    id: 'bahasa-melayu', 
    title: 'Bahasa Melayu', 
    icon: 'language-outline',
    color: '#4895ef' 
  },
  { 
    id: 'sejarah', 
    title: 'Sejarah', 
    icon: 'time-outline',
    color: '#560bad' 
  }
];

export default function FormScreen() {
  const router = useRouter();
  const { form } = useLocalSearchParams();
  
  const formNumber = typeof form === 'string' ? form : '1';

  const renderSubject = ({ item }) => (
    <TouchableOpacity
      style={styles.subjectCard}
      onPress={() => router.push({
        pathname: '/(app)/studyai/chat',
        params: { form: formNumber, subject: item.id, title: item.title }
      })}
    >
      <View style={[styles.subjectIconContainer, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon} size={28} color={item.color} />
      </View>
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectTitle}>{item.title}</Text>
        <Text style={styles.subjectDescription}>Get AI help with your {item.title} studies</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#8c52ff" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#8c52ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Form {formNumber}</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>
        Select a subject to get AI assistance
      </Text>

      <FlatList
        data={SUBJECTS}
        renderItem={renderSubject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.subjectsList}
      />

      <View style={styles.tipContainer}>
        <View style={styles.tipIconContainer}>
          <Ionicons name="sparkles-sharp" size={24} color="#f7b801" />
        </View>
        <Text style={styles.tipText}>
          Our AI tutor can help you with homework, explain concepts, and answer questions specific to your Form {formNumber} curriculum.
        </Text>
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
    color: '#8c52ff',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  subjectsList: {
    padding: 16,
  },
  subjectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  subjectIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subjectDescription: {
    fontSize: 14,
    color: '#666',
  },
  tipContainer: {
    backgroundColor: '#fff9e6',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#f7b801',
  },
  tipIconContainer: {
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
});