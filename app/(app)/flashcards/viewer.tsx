import React, { useState, useRef, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Animated, PanResponder, Dimensions, ScrollView, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Get screen dimensions for card layout
const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 60;
const CARD_HEIGHT = Math.min(500, height * 0.6);
const SWIPE_THRESHOLD = 120;

// Mock flashcard data
const FLASHCARDS = {
  'bahasa-melayu': [
    { id: 1, front: 'Apakah definisi "kata nama"?', back: 'Kata nama ialah perkataan yang merujuk kepada nama orang, tempat, benda, dan sebagainya.' },
    { id: 2, front: 'Berikan contoh peribahasa yang bermaksud "kesusahan yang berbaloi"', back: 'Berakit-rakit ke hulu, berenang-renang ke tepian,\nBersakit-sakit dahulu, bersenang-senang kemudian.' },
    { id: 3, front: 'Nyatakan perbezaan antara "di", "ke", dan "dari"', back: '"di" - menunjukkan tempat\n"ke" - menunjukkan arah pergerakan\n"dari" - menunjukkan tempat asal' },
    { id: 4, front: 'Berikan contoh penggunaan kata sifat', back: 'Baju MERAH\nHari yang PANAS\nKucing yang COMEL\nBudak itu RAJIN' },
  ],
  'mathematics': [
    { id: 1, front: 'What is the Pythagorean theorem?', back: 'a² + b² = c²\n\nIn a right-angled triangle, the square of the hypotenuse (c) is equal to the sum of the squares of the other two sides (a and b).' },
    { id: 2, front: 'Solve: 3x + 5 = 20', back: '3x + 5 = 20\n3x = 15\nx = 5' },
    { id: 3, front: 'What is the formula for the area of a circle?', back: 'A = πr²\n\nWhere A is the area and r is the radius of the circle.' },
    { id: 4, front: 'Define the term "prime number"', back: 'A prime number is a natural number greater than 1 that cannot be formed by multiplying two smaller natural numbers.\n\nExamples: 2, 3, 5, 7, 11, 13, 17, 19, ...' },
  ],
  'english': [
    { id: 1, front: 'What are the 8 parts of speech?', back: '1. Nouns\n2. Pronouns\n3. Verbs\n4. Adjectives\n5. Adverbs\n6. Prepositions\n7. Conjunctions\n8. Interjections' },
    { id: 2, front: 'What is the difference between "their", "there", and "they\'re"?', back: '"Their" - possessive pronoun (Their books are on the table)\n"There" - indicates a place (Put it over there)\n"They\'re" - contraction of "they are" (They\'re coming to the party)' },
    { id: 3, front: 'Define "metaphor" and give an example', back: 'A metaphor is a figure of speech that makes an implicit, implied, or hidden comparison between two things.\n\nExample: "Time is money" or "Her eyes were diamonds"' },
    { id: 4, front: 'What is the past participle of "to write"?', back: 'Written\n\nExample: I have written a letter.' },
  ],
  'science': [
    { id: 1, front: 'What is photosynthesis?', back: 'Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water.\n\n6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂' },
    { id: 2, front: 'State Newton\'s three laws of motion', back: '1. An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.\n\n2. Force equals mass times acceleration (F = ma).\n\n3. For every action, there is an equal and opposite reaction.' },
    { id: 3, front: 'What is the difference between an element and a compound?', back: 'Element: A pure substance made of only one type of atom.\nExamples: Hydrogen (H), Oxygen (O)\n\nCompound: A substance made of two or more different elements chemically combined.\nExamples: Water (H₂O), Carbon dioxide (CO₂)' },
    { id: 4, front: 'What is cellular respiration?', back: 'Cellular respiration is the process by which cells convert glucose into energy in the form of ATP.\n\nC₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy (ATP)' },
  ],
  'sejarah': [
    { id: 1, front: 'Bilakah Malaysia mencapai kemerdekaan?', back: '31 Ogos 1957 (Tanah Melayu)\n16 September 1963 (Pembentukan Malaysia dengan Sabah dan Sarawak)' },
    { id: 2, front: 'Siapakah Perdana Menteri pertama Malaysia?', back: 'Tunku Abdul Rahman Putra Al-Haj' },
    { id: 3, front: 'Apakah Dasar Ekonomi Baru (DEB)?', back: 'Dasar Ekonomi Baru ialah dasar sosio-ekonomi yang diperkenalkan pada tahun 1971 selepas peristiwa 13 Mei 1969.\n\nMatlamatnya:\n1. Membasmi kemiskinan tanpa mengira kaum\n2. Menyusun semula masyarakat untuk menghapuskan pengenalan kaum mengikut fungsi ekonomi' },
    { id: 4, front: 'Nyatakan tiga kerajaan Melayu awal di Tanah Melayu', back: '1. Kerajaan Kedah Tua\n2. Kerajaan Melaka\n3. Kerajaan Johor-Riau' },
  ],
};

export default function FlashcardViewerScreen() {
  const router = useRouter();
  const { form, subject, title } = useLocalSearchParams();
  
  const formNumber = typeof form === 'string' ? form : '1';
  const subjectId = typeof subject === 'string' ? subject : 'bahasa-melayu';
  const subjectTitle = typeof title === 'string' ? title : 'Bahasa Melayu';
  
  // Get cards for the selected subject (or default if not found)
  const cards = FLASHCARDS[subjectId] || FLASHCARDS['bahasa-melayu'];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  
  // Animation values
  const flipAnim = useRef(new Animated.Value(0)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const nextCardOpacityAnim = useRef(new Animated.Value(0)).current;
  const nextCardScaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Create front-to-back flip rotation
  const flipRotation = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  
  // Create back-to-front flip rotation
  const backRotation = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  // Create front card opacity
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 91, 180],
    outputRange: [1, 0, 0, 0],
  });

  // Create back card opacity
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  // Set up pan responder for swiping
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      // Only allow swiping left/right when card is not flipped
      if (!flipped) {
        swipeAnim.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Detect tap (small movement) to flip card
      if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
        flipCard();
        return;
      }
      
      if (gestureState.dx < -SWIPE_THRESHOLD && currentIndex < cards.length - 1) {
        // Swipe left to go to next card
        Animated.timing(swipeAnim, {
          toValue: -CARD_WIDTH * 1.5,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setCurrentIndex(currentIndex + 1);
          setFlipped(false);
          flipAnim.setValue(0); // Reset flip animation
          swipeAnim.setValue(0); // Reset swipe animation
        });
      } else if (gestureState.dx > SWIPE_THRESHOLD && currentIndex > 0) {
        // Swipe right to go to previous card
        Animated.timing(swipeAnim, {
          toValue: CARD_WIDTH * 1.5,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setCurrentIndex(currentIndex - 1);
          setFlipped(false);
          flipAnim.setValue(0); // Reset flip animation
          swipeAnim.setValue(0); // Reset swipe animation
        });
      } else {
        // Return card to center
        Animated.spring(swipeAnim, {
          toValue: 0,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  // Function to manually navigate to next card
  const goToNextCard = () => {
    if (currentIndex < cards.length - 1) {
      Animated.timing(swipeAnim, {
        toValue: -CARD_WIDTH * 1.5,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(currentIndex + 1);
        setFlipped(false);
        flipAnim.setValue(0);
        swipeAnim.setValue(0);
      });
    }
  };

  // Function to manually navigate to previous card
  const goToPrevCard = () => {
    if (currentIndex > 0) {
      Animated.timing(swipeAnim, {
        toValue: CARD_WIDTH * 1.5,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(currentIndex - 1);
        setFlipped(false);
        flipAnim.setValue(0);
        swipeAnim.setValue(0);
      });
    }
  };
  
  // Function to flip the card
  const flipCard = () => {
    setFlipped(!flipped);
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 180,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };
  
  // Function to mark card as completed/uncompleted
  const toggleCompleted = (id: number) => {
    if (completed.includes(id)) {
      setCompleted(completed.filter(cardId => cardId !== id));
    } else {
      setCompleted([...completed, id]);
    }
  };
  
  // Calculate progress
  const progress = Math.round((completed.length / cards.length) * 100);
  
  // Share flashcard
  const shareCard = async () => {
    try {
      const card = cards[currentIndex];
      await Share.share({
        message: `Flashcard: ${card.front}\n\nAnswer: ${card.back}\n\nFrom StudyFlow App - Form ${formNumber} ${subjectTitle}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  // Update scaling of next card when current card moves
  useEffect(() => {
    // When swiping left (next card)
    swipeAnim.addListener(({ value }) => {
      if (value < 0 && currentIndex < cards.length - 1) {
        const nextCardOpacity = Math.min(Math.abs(value) / (CARD_WIDTH / 2), 1);
        const nextCardScale = 0.9 + (Math.abs(value) / CARD_WIDTH) * 0.1;
        nextCardOpacityAnim.setValue(nextCardOpacity);
        nextCardScaleAnim.setValue(nextCardScale);
      } else {
        nextCardOpacityAnim.setValue(0);
        nextCardScaleAnim.setValue(0.9);
      }
    });
    
    return () => {
      swipeAnim.removeAllListeners();
    };
  }, [currentIndex, cards.length, swipeAnim, nextCardOpacityAnim, nextCardScaleAnim]);

  // Reset animation values when current index changes
  useEffect(() => {
    nextCardOpacityAnim.setValue(0);
    nextCardScaleAnim.setValue(0.9);
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ff7b3a" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {subjectTitle} Flashcards
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarOuter}>
            <View style={[styles.progressBarInner, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% Mastered</Text>
        </View>
        
        <View style={styles.cardCountContainer}>
          <Text style={styles.cardCountText}>Card {currentIndex + 1} of {cards.length}</Text>
        </View>
        
        <View style={styles.cardsContainer}>
          {/* Current Card */}
          <Animated.View 
            style={[
              styles.card,
              { 
                transform: [
                  { translateX: swipeAnim },
                ]
              }
            ]}
            {...panResponder.panHandlers}
          >
            {/* Card Front */}
            <Animated.View 
              style={[
                styles.cardFace, 
                styles.cardFront, 
                { 
                  opacity: frontOpacity,
                  zIndex: flipped ? 0 : 1,
                  transform: [{ rotateY: flipRotation }] 
                }
              ]}
            >
              <Text style={styles.cardText}>{cards[currentIndex].front}</Text>
              <View style={styles.tapHintContainer}>
                <Ionicons name="hand-left" size={18} color="#ccc" />
                <Text style={styles.tapHintText}>Tap to flip</Text>
              </View>
            </Animated.View>
            
            {/* Card Back */}
            <Animated.View 
              style={[
                styles.cardFace, 
                styles.cardBack, 
                { 
                  opacity: backOpacity,
                  zIndex: flipped ? 1 : 0,
                  transform: [{ rotateY: backRotation }] 
                }
              ]}
            >
              <ScrollView style={styles.cardBackScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.cardText}>{cards[currentIndex].back}</Text>
              </ScrollView>
            </Animated.View>
          </Animated.View>
          
          {/* Next Card Preview (only visible during swipe) */}
          {currentIndex < cards.length - 1 && (
            <Animated.View 
              style={[
                styles.card, 
                styles.nextCard, 
                { 
                  opacity: nextCardOpacityAnim,
                  transform: [{ scale: nextCardScaleAnim }]
                }
              ]}
            >
              <View style={[styles.cardFace, styles.cardFront]}>
                <Text style={styles.cardText} numberOfLines={3} ellipsizeMode="tail">
                  {cards[currentIndex + 1].front}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
        
        <View style={styles.hintContainer}>
          <View style={styles.hintItem}>
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.hintText}>Swipe right for previous</Text>
          </View>
          
          <View style={styles.hintItem}>
            <Ionicons name="arrow-forward" size={20} color="#666" />
            <Text style={styles.hintText}>Swipe left for next</Text>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={currentIndex > 0 ? goToPrevCard : undefined}
            disabled={currentIndex === 0}
          >
            <Ionicons 
              name="chevron-back-circle" 
              size={24} 
              color={currentIndex > 0 ? "#3a86ff" : "#ccc"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.masterButton]}
            onPress={() => toggleCompleted(cards[currentIndex].id)}
          >
            <Ionicons 
              name={completed.includes(cards[currentIndex].id) ? "star" : "star-outline"} 
              size={28} 
              color={completed.includes(cards[currentIndex].id) ? "#ff7b3a" : "#666"} 
            />
            <Text style={[
              styles.masterButtonText,
              completed.includes(cards[currentIndex].id) && styles.masteredButtonText
            ]}>
              {completed.includes(cards[currentIndex].id) ? "Mastered" : "Mark as Mastered"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={currentIndex < cards.length - 1 ? goToNextCard : undefined}
            disabled={currentIndex === cards.length - 1}
          >
            <Ionicons 
              name="chevron-forward-circle" 
              size={24} 
              color={currentIndex < cards.length - 1 ? "#3a86ff" : "#ccc"} 
            />
          </TouchableOpacity>
        </View>
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
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBarOuter: {
    height: 6,
    backgroundColor: '#EAEAEF',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: '#ff7b3a',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  cardCountContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  cardCountText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  nextCard: {
    position: 'absolute',
    zIndex: -1,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 16,
    padding: 24,
    justifyContent: 'center',
    // Add perspective for better 3D effect
    transform: [{ perspective: 1000 }],
  },
  cardFront: {
    backgroundColor: 'white',
  },
  cardBack: {
    backgroundColor: '#fff8f2',
  },
  cardBackScroll: {
    flex: 1,
  },
  cardText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
  },
  tapHintContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapHintText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 6,
  },
  hintContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
  },
  masterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  masterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  masteredButtonText: {
    color: '#ff7b3a',
  },
});