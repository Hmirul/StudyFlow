import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock data for the subjects
const SUBJECTS = [
  { 
    id: 'bahasa-melayu',
    title: 'Bahasa Melayu',
    description: 'National language of Malaysia',
    icon: 'chatbubbles-outline',
    color: '#3a86ff',
    cardCount: 24
  },
  { 
    id: 'mathematics',
    title: 'Mathematics',
    description: 'Numbers, equations and calculations',
    icon: 'calculator-outline',
    color: '#2ecc71',
    cardCount: 32
  },
  { 
    id: 'english',
    title: 'English',
    description: 'Language and communication skills',
    icon: 'globe-outline',
    color: '#f39c12',
    cardCount: 28
  },
  { 
    id: 'science',
    title: 'Science',
    description: 'Physics, chemistry and biology concepts',
    icon: 'flask-outline',
    color: '#9b59b6',
    cardCount: 45
  },
  { 
    id: 'sejarah',
    title: 'Sejarah',
    description: 'History of Malaysia and the world',
    icon: 'time-outline',
    color: '#e74c3c',
    cardCount: 30
  },
];

export default function FlashcardSubjectsScreen() {
  const router = useRouter();
  const { form } = useLocalSearchParams();
  
  const formNumber = typeof form === 'string' ? form : '1';
  
  const renderSubjectItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.subjectCard}
      onPress={() => router.push({
        pathname: '/flashcards/viewer',
        params: { 
          form: formNumber,
          subject: item.id,
          title: item.title
        }
      })}
    >
      <View style={[styles.subjectIconContainer, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name={item.icon} size={32} color={item.color} />
      </View>
      <View style={styles.subjectTextContainer}>
        <Text style={styles.subjectTitle}>{item.title}</Text>
        <Text style={styles.subjectDescription}>{item.description}</Text>
        <View style={styles.cardCountContainer}>
          <Ionicons name="card-outline" size={14} color="#666" />
          <Text style={styles.cardCountText}>{item.cardCount} cards</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ff7b3a" />
        </TouchableOpacity>
        <Text style={styles.title}>Form {formNumber} Flashcards</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Select Subject</Text>
        
        <FlatList
          data={SUBJECTS}
          renderItem={renderSubjectItem}
          keyExtractor={(item) => item.id}
          style={styles.subjectsList}
          contentContainerStyle={styles.subjectsListContent}
          showsVerticalScrollIndicator={false}
        />
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
    color: '#ff7b3a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  subjectsList: {
    flex: 1,
  },
  subjectsListContent: {
    paddingBottom: 20,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  subjectIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectTextContainer: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subjectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  cardCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCountText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});