import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Switch, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import DateTimePicker from '@react-native-community/datetimepicker';

// Define Task type
interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string; // ISO string format
  priority: 'low' | 'medium' | 'high';
}

export default function TodoScreen() {
  const router = useRouter();
  const { fetchWithAuth } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetchWithAuth('/tasks');

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      if (!title.trim()) {
        Alert.alert('Error', 'Please enter a title');
        return;
      }

      const taskData = {
        title,
        description: description.trim() || undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        priority,
      };

      const response = await fetchWithAuth('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const data = await response.json();
      setTasks([...tasks, data.task]);
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  const handleUpdateTask = async () => {
    try {
      if (!editingTask) return;
      if (!title.trim()) {
        Alert.alert('Error', 'Please enter a title');
        return;
      }

      const taskData = {
        title,
        description: description.trim() || undefined,
        completed,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        priority,
      };

      const response = await fetchWithAuth(`/tasks/${editingTask._id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const data = await response.json();
      
      // Update the tasks list
      setTasks(tasks.map(task => 
        task._id === editingTask._id ? data.task : task
      ));
      
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      Alert.alert(
        'Delete Task',
        'Are you sure you want to delete this task?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
              const response = await fetchWithAuth(`/tasks/${taskId}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Failed to delete task');
              }

              // Remove the task from the list
              setTasks(tasks.filter(task => task._id !== taskId));
            },
            style: 'destructive',
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    }
  };

  const handleToggleCompleted = async (taskId: string, completed: boolean) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;

      const response = await fetchWithAuth(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...task, completed: !completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update the task in the list
      setTasks(tasks.map(t => 
        t._id === taskId ? { ...t, completed: !completed } : t
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setCompleted(task.completed);
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setPriority(task.priority);
    setModalVisible(true);
  };

  const openCreateModal = () => {
    resetForm();
    setEditingTask(null);
    setModalVisible(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCompleted(false);
    setDueDate(undefined);
    setPriority('medium');
    setEditingTask(null);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(false);
    setDueDate(currentDate);
  };

  const renderPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Ionicons name="flag" size={16} color="#e63946" />;
      case 'medium':
        return <Ionicons name="flag" size={16} color="#ffb703" />;
      case 'low':
        return <Ionicons name="flag" size={16} color="#2a9d8f" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={[styles.taskItem, item.completed && styles.completedTask]}>
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => handleToggleCompleted(item._id, item.completed)}
      >
        <Ionicons 
          name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
          size={24} 
          color={item.completed ? "#3a86ff" : "#aaa"} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.taskContent}
        onPress={() => openEditModal(item)}
      >
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, item.completed && styles.completedText]}>
            {item.title}
          </Text>
          {renderPriorityIcon(item.priority)}
        </View>
        
        {item.description ? (
          <Text style={[styles.taskDescription, item.completed && styles.completedText]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        
        {item.dueDate ? (
          <Text style={[styles.taskDueDate, item.completed && styles.completedText]}>
            Due: {formatDate(item.dueDate)}
          </Text>
        ) : null}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteTask(item._id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff4757" />
      </TouchableOpacity>
    </View>
  );

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#3a86ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>To-Do List</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3a86ff" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
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
        <Text style={styles.headerTitle}>To-Do List</Text>
        <View style={{ width: 24 }} />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTasks}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={tasks}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.tasksList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="list" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No tasks yet</Text>
                <Text style={styles.emptyStateSubText}>
                  Tap the + button to create a new task
                </Text>
              </View>
            }
          />

          <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
              resetForm();
            }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {editingTask ? 'Edit Task' : 'New Task'}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Ionicons name="close" size={24} color="#3a86ff" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                      style={styles.input}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Enter task title"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Enter task description (optional)"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>

                  {editingTask && (
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Completed</Text>
                      <Switch
                        value={completed}
                        onValueChange={setCompleted}
                        trackColor={{ false: "#ccc", true: "#3a86ff" }}
                        thumbColor={completed ? "#fff" : "#f4f3f4"}
                      />
                    </View>
                  )}

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Due Date</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text>
                        {dueDate ? formatDate(dueDate.toISOString()) : 'Select a date'}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={dueDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                      />
                    )}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.prioritySelector}>
                      <TouchableOpacity
                        style={[styles.priorityButton, priority === 'low' && styles.activePriorityLow]}
                        onPress={() => setPriority('low')}
                      >
                        <Text style={[styles.priorityButtonText, priority === 'low' && styles.activePriorityText]}>Low</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.priorityButton, priority === 'medium' && styles.activePriorityMedium]}
                        onPress={() => setPriority('medium')}
                      >
                        <Text style={[styles.priorityButtonText, priority === 'medium' && styles.activePriorityText]}>Medium</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.priorityButton, priority === 'high' && styles.activePriorityHigh]}
                        onPress={() => setPriority('high')}
                      >
                        <Text style={[styles.priorityButtonText, priority === 'high' && styles.activePriorityText]}>High</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={editingTask ? handleUpdateTask : handleCreateTask}
                  >
                    <Text style={styles.saveButtonText}>
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </Modal>
        </>
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3a86ff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ff4757",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3a86ff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  tasksList: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  taskItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  completedTask: {
    backgroundColor: "#f8f8f8",
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: "center",
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  taskDueDate: {
    fontSize: 12,
    color: "#888",
  },
  deleteButton: {
    justifyContent: "center",
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    fontWeight: "600",
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#3a86ff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f7f9fc",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  datePickerButton: {
    backgroundColor: "#f7f9fc",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
  },
  prioritySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9fc",
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
  },
  priorityButtonText: {
    fontSize: 14,
    color: "#555",
  },
  activePriorityLow: {
    backgroundColor: "#2a9d8f",
    borderColor: "#2a9d8f",
  },
  activePriorityMedium: {
    backgroundColor: "#ffb703",
    borderColor: "#ffb703",
  },
  activePriorityHigh: {
    backgroundColor: "#e63946",
    borderColor: "#e63946",
  },
  activePriorityText: {
    color: "white",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#3a86ff",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});