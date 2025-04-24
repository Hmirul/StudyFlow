import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, Image, StatusBar } from "react-native";
import { Link, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

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
        <StatusBar barStyle="dark-content" backgroundColor="#f7f9fc" />
        <Image 
          source={require('../assets/icon.png')} 
          style={styles.loadingIcon} 
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#3a86ff" style={styles.loadingIndicator} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fc" />
      
      <Animated.View entering={FadeIn.duration(800)} style={styles.logoContainer}>
        <Image 
          source={require('../assets/icon.png')} 
          style={styles.icon} 
          resizeMode="contain"
        />
        <Text style={styles.appTitle}>StudyFlow</Text>
        <Text style={styles.tagline}>Your Ultimate Student Companion</Text>
      </Animated.View>
      
      <Animated.View entering={FadeInDown.delay(300).duration(800)} style={styles.infoContainer}>
        <Text style={styles.description}>
          Elevate your academic experience with StudyFlow. An all-in-one toolkit for students 
          featuring AI tutoring, smart notes, task management, and study tools to help you succeed.
        </Text>
        
        <View style={styles.featureContainer}>
          {[
            "StudyFlow AI",
            "Smart Notes",
            "Smart To-Do Lists",
            "Pomodoro Timer",
            "Digital Textbook Reader",
          ].map((feature, index) => (
            <View key={index} style={styles.featureItemContainer}>
              <View style={styles.featureBullet}>
                <Text style={styles.bulletText}>✓</Text>
              </View>
              <Text style={styles.featureItem}>{feature}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
      
      <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.buttonContainer}>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.loginButton} activeOpacity={0.8}>
            <LinearGradient
              colors={['#4a9fff', '#3a86ff', '#2e6fcf']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.gradientButton}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Link>
        
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={styles.signupButton} activeOpacity={0.8}>
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>
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
  loadingIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    opacity: 0.8,
  },
  loadingIndicator: {
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  icon: {
    width: 110,
    height: 110,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#3a86ff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
    fontWeight: '500',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 30,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
    paddingHorizontal: 10,
    fontWeight: '400',
  },
  featureContainer: {
    alignSelf: 'flex-start',
    marginLeft: 30,
    width: '100%',
  },
  featureItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3a86ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bulletText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureItem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 50,
    gap: 16,
  },
  loginButton: {
    borderRadius: 12,
    height: 56,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#3a86ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3a86ff',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#3a86ff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
