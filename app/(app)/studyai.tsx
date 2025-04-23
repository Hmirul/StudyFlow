import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Form/Grade data with colors
const FORMS = [
  { id: '1', title: 'Form 1', color: '#8c52ff' },
  { id: '2', title: 'Form 2', color: '#7b5dfe' },
  { id: '3', title: 'Form 3', color: '#6d68fe' },
  { id: '4', title: 'Form 4', color: '#5e73fd' },
  { id: '5', title: 'Form 5', color: '#4c7fff' },
];

export default function StudyAIScreen() {
  const router = useRouter();

  const renderForm = ({ item }) => (
    <TouchableOpacity
      style={styles.formCard}
      onPress={() => router.push({
        pathname: `/(app)/studyai/${item.id}`,
      })}
    >
      <View style={[styles.formIconContainer, { backgroundColor: `${item.color}20` }]}>
        <Ionicons name="school-outline" size={28} color={item.color} />
      </View>
      <View style={styles.formInfo}>
        <Text style={styles.formTitle}>{item.title}</Text>
        <Text style={styles.formDescription}>AI tutor tailored for {item.title} curriculum</Text>
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
        <Text style={styles.headerTitle}>StudyFlow AI</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoIconContainer}>
          <Ionicons name="sparkles-sharp" size={32} color="#8c52ff" />
        </View>
        <Text style={styles.infoTitle}>Your Personal AI Tutor</Text>
        <Text style={styles.infoDescription}>
          Get homework help, explanations, and answers to your academic questions instantly with our AI tutor.
        </Text>
      </View>

      <Text style={styles.subtitle}>
        Select your form to get started
      </Text>

      <FlatList
        data={FORMS}
        renderItem={renderForm}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.formsList}
      />
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
  infoContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0eaff',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  formsList: {
    padding: 16,
  },
  formCard: {
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
  formIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  formInfo: {
    flex: 1,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
  },
});