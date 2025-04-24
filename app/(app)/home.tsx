import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>StudyFlow</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#3a86ff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Welcome, {user?.name || "Student"}!
          </Text>
          <Text style={styles.subtitleText}>
            Your academic journey starts here
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/studyai")}
          >
            <Ionicons name="sparkles-sharp" size={32} color="#8c52ff" />
            <Text style={styles.cardTitle}>StudyFlow AI</Text>
            <Text style={styles.cardDescription}>
              Get personalized tutoring and homework help with AI
            </Text>
          </TouchableOpacity>

            <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/notes")}
            >
            <Ionicons name="document-text-outline" size={32} color="#8c52ff" />
            <Text style={styles.cardTitle}>Smart Notes</Text>
            <Text style={styles.cardDescription}>
              Create study notes and share them with friends via QR code
            </Text>
            </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/todo")}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={32}
              color="#3a86ff"
            />
            <Text style={styles.cardTitle}>To-Do List</Text>
            <Text style={styles.cardDescription}>
              Manage your tasks and stay on top of your assignments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/pomodoro")}
          >
            <Ionicons name="timer-outline" size={32} color="#3a86ff" />
            <Text style={styles.cardTitle}>Pomodoro Timer</Text>
            <Text style={styles.cardDescription}>
              Boost your productivity with timed study sessions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/textbooks")}
          >
            <Ionicons name="book-outline" size={32} color="#3a86ff" />
            <Text style={styles.cardTitle}>Textbooks</Text>
            <Text style={styles.cardDescription}>
              Access your digital textbooks in one place
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/flashcards")}
          >
            <Ionicons name="card-outline" size={32} color="#ff7b3a" />
            <Text style={styles.cardTitle}>Flashcards</Text>
            <Text style={styles.cardDescription}>
              Study and memorize concepts with interactive flashcards
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3a86ff",
  },
  logoutButton: {
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  welcomeContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitleText: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
