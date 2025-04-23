import React, { useState, useEffect, useRef } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Keyboard,
  Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GeminiAPI from '../../utils/geminiApi';
import Constants from 'expo-constants';
import Markdown from 'react-native-markdown-display';

// Mock subject-specific context data
const SUBJECT_CONTEXT = {
  'bahasa-melayu': 'Ini adalah bantuan untuk subjek Bahasa Melayu. Bahasa Melayu adalah bahasa kebangsaan Malaysia dan merupakan bahasa rasmi negara. Ia juga dikenali sebagai Bahasa Malaysia.',
  'mathematics': 'This is a helper for Mathematics subject. Mathematics is the study of numbers, quantities, and shapes. Key topics include algebra, geometry, calculus, and statistics.',
  'english': 'This is a helper for English subject. English is a West Germanic language that originated from Anglo-Frisian languages brought to Britain in the mid 5th to 7th centuries AD.',
  'science': 'This is a helper for Science subject. Science covers physics, chemistry, and biology. Key concepts include forces, matter, energy, cells, and ecosystems.',
  'sejarah': 'Ini adalah bantuan untuk subjek Sejarah. Sejarah adalah kajian tentang peristiwa masa lalu, terutamanya berkenaan dengan manusia, negara, dan masyarakat.'
};

// Mock conversation starters based on form level and subject
const getConversationStarters = (form, subject) => {
  const commonStarters = [
    "How can I help with your studies today?",
    "What topic are you working on right now?",
    "Do you have any homework questions I can help with?"
  ];

  const subjectSpecificStarters = {
    'mathematics': [
      form === '1' || form === '2' ? "Would you like to practice basic algebra?" : "Would you like to work on some calculus problems?",
      "Having trouble with a math problem?"
    ],
    'science': [
      form === '1' || form === '2' ? "Let's learn about basic science concepts!" : "Do you want to dive into advanced scientific theories?",
      "Need help with a science experiment or concept?"
    ],
    'english': [
      "Need help with grammar or writing?",
      "Would you like to improve your vocabulary?"
    ],
    'bahasa-melayu': [
      "Perlukan bantuan dengan tatabahasa atau penulisan?",
      "Adakah anda ingin mempelajari peribahasa?"
    ],
    'sejarah': [
      "Perlukan bantuan dengan fakta sejarah?",
      "Mari pelajari tentang tokoh-tokoh penting dalam sejarah!"
    ]
  };

  return [
    ...(subjectSpecificStarters[subject] || []),
    ...commonStarters
  ];
};

// For demo purposes - You would store this in a secure environment variable in production
const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey;

export default function AIChatScreen() {
  const router = useRouter();
  const { form, subject, title } = useLocalSearchParams();
  
  const formNumber = typeof form === 'string' ? form : '1';
  const subjectId = typeof subject === 'string' ? subject : 'mathematics';
  const subjectTitle = typeof title === 'string' ? title : 'Mathematics';
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [starters, setStarters] = useState([]);
  const [chatHistory, setChatHistory] = useState([]); // Store chat history for context
  
  const flatListRef = useRef(null);

  // Initialize chat with a welcome message
  useEffect(() => {
    const initialStarters = getConversationStarters(formNumber, subjectId);
    setStarters(initialStarters);
    
    // Add an AI welcome message
    const welcomeMessage = {
      id: Date.now().toString(),
      text: `Hi there! I'm your Form ${formNumber} ${subjectTitle} AI tutor. ${initialStarters[0]}`,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    setChatHistory([welcomeMessage]); // Initialize chat history
    
    // Send initial context to prime the AI
    sendInitialContextToAI();
  }, [formNumber, subjectId, subjectTitle]);

  // Clear chat history when leaving the chat screen
  useEffect(() => {
    return () => {
      setMessages([]);
      setChatHistory([]);
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Function to send initial context to AI
  const sendInitialContextToAI = () => {
    // Format educational context based on form and subject
    const contextInfo = {
      form: formNumber,
      subject: subjectId,
      subjectTitle: subjectTitle
    };
    
    const educationalContext = GeminiAPI.formatEducationalContext(contextInfo);
    console.log('Educational context prepared:', educationalContext);
    
    // In a real implementation, this would be used to prime the Gemini model
    // We don't need to make an API call here, just prepare the context for later
  };

  // Send a message to the AI
  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    Keyboard.dismiss();
    
    // Add user message to the chat
    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setChatHistory(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    try {
      // Get a response from Gemini API
      const aiResponse = await GeminiAPI.generateGeminiResponse(
        inputText.trim(),
        GEMINI_API_KEY,
        chatHistory // send the full session history for context
      );
      
      // Add AI response to the chat
      const aiMessageObj = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessageObj]);
      setChatHistory(prev => [...prev, aiMessageObj]);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Show error to user
      Alert.alert(
        'Error',
        'Could not get a response from the AI. Please try again.',
        [{ text: 'OK' }]
      );
      
      // Add a failure message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I had trouble processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Use a starter question
  const useStarter = (starter) => {
    setInputText(starter);
  };

  // Render a chat message
  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      {item.sender === 'ai' ? (
        <Markdown style={{ body: [styles.messageText, styles.aiMessageText] }}>
          {item.text}
        </Markdown>
      ) : (
        <Text style={[styles.messageText, styles.userMessageText]}>
          {item.text}
        </Text>
      )}
      <Text style={[
        styles.timestamp,
        item.sender === 'user' ? styles.userTimestamp : styles.aiTimestamp
      ]}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  // Render a conversation starter button
  const renderStarter = ({ item }) => (
    <TouchableOpacity
      style={styles.starterButton}
      onPress={() => useStarter(item)}
    >
      <Text style={styles.starterText} numberOfLines={2}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8c52ff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>{subjectTitle} AI Tutor</Text>
          <Text style={styles.subtitle}>Form {formNumber}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isTyping ? (
            <View style={[styles.messageBubble, styles.aiMessage]}>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#8c52ff" />
                <Text style={styles.typingText}>AI is typing...</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>Start a conversation with your AI tutor</Text>
          </View>
        }
      />

      {starters.length > 0 && messages.length < 2 && (
        <View style={styles.startersContainer}>
          <Text style={styles.startersTitle}>Suggested questions:</Text>
          <FlatList
            data={starters}
            renderItem={renderStarter}
            keyExtractor={(item, index) => `starter-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.startersList}
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your question..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          numberOfLines={1}
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons 
            name="paper-plane" 
            size={20} 
            color={inputText.trim() ? "white" : "#ccc"}
          />
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
  backButton: {
    padding: 8,
  },
  moreButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8c52ff',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userMessage: {
    backgroundColor: '#8c52ff',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiTimestamp: {
    color: '#888',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#8c52ff',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  emptyStateContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  startersContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  startersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  startersList: {
    paddingVertical: 4,
  },
  starterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    maxWidth: 200,
  },
  starterText: {
    fontSize: 14,
    color: '#666',
  },
});