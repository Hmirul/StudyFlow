import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock data for the forms
const FORMS = [
  { id: '1', title: 'Form 1', description: 'Secondary school first year' },
  { id: '2', title: 'Form 2', description: 'Secondary school second year' },
  { id: '3', title: 'Form 3', description: 'Secondary school third year' },
  { id: '4', title: 'Form 4', description: 'Secondary school fourth year' },
  { id: '5', title: 'Form 5', description: 'Secondary school fifth year' },
];

export default function TextbooksScreen() {
  const router = useRouter();

  const renderFormItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.formCard}
      onPress={() => router.push(`/textbooks/${item.id}`)}
    >
      <View style={styles.formCardContent}>
        <View style={styles.formIconContainer}>
          <Ionicons name="book" size={32} color="#3a86ff" />
        </View>
        <View style={styles.formTextContainer}>
          <Text style={styles.formTitle}>{item.title}</Text>
          <Text style={styles.formDescription}>{item.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3a86ff" />
        </TouchableOpacity>
        <Text style={styles.title}>Textbooks</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.bannerContainer}>
          <Image 
            source={require('../../assets/images/splash-icon.png')} 
            style={styles.bannerImage}
            resizeMode="contain"
          />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Digital Textbooks</Text>
            <Text style={styles.bannerSubtitle}>Select your form to access textbooks</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Form</Text>
        
        <FlatList
          data={FORMS}
          renderItem={renderFormItem}
          keyExtractor={(item) => item.id}
          style={styles.formsList}
          contentContainerStyle={styles.formsListContent}
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
    color: '#3a86ff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  bannerContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bannerImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  formsList: {
    flex: 1,
  },
  formsListContent: {
    paddingBottom: 20,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  formCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  formIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ebf3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  formTextContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
  },
});