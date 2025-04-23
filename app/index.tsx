import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to home screen
    if (!isLoading && user) {
      router.replace("/(app)/home");
    }
  }, [isLoading, user, router]);

  // Show loading indicator while checking authentication status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3a86ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.appTitle}>StudyFlow</Text>
        <Text style={styles.tagline}>Your Ultimate Student Companion</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.description}>
          Organize your academic life with ease. Manage tasks, track study sessions,
          access textbooks, and keep your notes organized - all in one place.
        </Text>
        
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Smart To-Do Lists</Text>
          <Text style={styles.featureItem}>• Pomodoro Timer</Text>
          <Text style={styles.featureItem}>• Digital Textbook Reader</Text>
          <Text style={styles.featureItem}>• Subject-based Note Organization</Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={styles.signupButton}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9fc",
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#3a86ff',
  },
  tagline: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 40,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#333',
    marginBottom: 24,
  },
  featureList: {
    alignSelf: 'center',
  },
  featureItem: {
    fontSize: 15,
    lineHeight: 28,
    color: '#444',
  },
  buttonContainer: {
    marginBottom: 60,
    gap: 16,
  },
  loginButton: {
    backgroundColor: '#3a86ff',
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3a86ff',
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#3a86ff',
    fontSize: 16,
    fontWeight: '600',
  },
});
