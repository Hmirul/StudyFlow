import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

// Get screen dimensions for textbook page layout
const { width, height } = Dimensions.get('window');
const pageWidth = width - 40; // Accounting for padding

// Define the subject type for type safety
type SubjectId = 'science' | 'mathematics' | 'english' | 'bahasa-melayu' | 'sejarah';

// Map of PDF URLs for each subject
const PDF_URLS: Record<SubjectId, string | undefined> = {
  'science': 'https://res.cloudinary.com/dftpdqp65/image/upload/v1745810589/PagesfromSnKSSMT5_6267031826657706537_czji3g.pdf',
  'mathematics': undefined,
  'english': undefined,
  'bahasa-melayu': undefined,
  'sejarah': undefined
  // Add more PDFs as you get them
};

// Mock data for textbook pages (fallback)
const MOCK_PAGES = {
    'bahasa-melayu': [
        { content: 'Bab 1: Pengenalan kepada Bahasa Melayu', isTitle: true },
        { content: 'Bahasa Melayu merupakan bahasa kebangsaan Malaysia. Ia merupakan bahasa perhubungan utama dalam kalangan rakyat Malaysia yang berbilang kaum.\n\nDalam bab ini, kita akan mempelajari tentang sejarah ringkas bahasa Melayu dan kepentingannya dalam pembinaan negara bangsa Malaysia.' },
        { content: '1.1 Sejarah Bahasa Melayu', isSubtitle: true },
        { content: 'Bahasa Melayu tergolong dalam rumpun bahasa Austronesia. Bahasa ini telah digunakan sejak abad ke-7 Masihi, sebagaimana yang dibuktikan melalui prasasti-prasasti yang ditemui di Kedah, Terengganu, dan beberapa tempat lain di Nusantara.' },
        { content: '1.2 Kedudukan Bahasa Melayu', isSubtitle: true },
        { content: 'Bahasa Melayu adalah bahasa rasmi negara Malaysia seperti yang termaktub dalam Perlembagaan Persekutuan. Sebagai bahasa kebangsaan, bahasa Melayu berperanan sebagai alat komunikasi antara pelbagai kaum.\n\nFungsi utama bahasa Melayu termasuk:\n• Medium perpaduan nasional\n• Bahasa rasmi pentadbiran\n• Bahasa ilmu dan pendidikan\n• Alat komunikasi utama' },
        { content: '1.3 Perkembangan Bahasa Melayu Moden', isSubtitle: true },
        { content: 'Bahasa Melayu moden telah mengalami beberapa fasa perkembangan penting, terutamanya selepas kemerdekaan. Penubuhan Dewan Bahasa dan Pustaka pada tahun 1956 merupakan langkah penting dalam usaha memartabatkan bahasa Melayu.\n\nAntara usaha-usaha yang dilaksanakan termasuk pembentukan istilah baharu, penerbitan kamus, dan penggubalan sistem ejaan baru pada tahun 1972.' }
    ],
    'mathematics': [
        { content: 'Chapter 1: Numbers and Operations', isTitle: true },
        { content: 'Mathematics is the study of numbers, quantities, and shapes. It is fundamental to our understanding of the world and is used in virtually every field of human endeavor.\n\nIn this chapter, we will explore the basic number system and learn about key mathematical operations.' },
        { content: '1.1 Understanding Numbers', isSubtitle: true },
        { content: 'Numbers are the basic building blocks of mathematics. The number system we commonly use is the decimal system, which is base 10.\n\nExample: Calculate 235 + 764\nSolution: 235 + 764 = 999' },
        { content: '1.2 Integer Operations', isSubtitle: true },
        { content: 'When working with integers, we need to follow specific rules for operations such as addition, subtraction, multiplication, and division.\n\nAddition Rules:\n• Adding two positive integers always gives a positive result\n• Adding two negative integers always gives a negative result\n• When adding a positive and negative integer, subtract the smaller absolute value from the larger and use the sign of the larger value' },
        { content: '1.3 Fractions and Decimals', isSubtitle: true },
        { content: 'A fraction represents a part of a whole. The top number (numerator) tells how many parts we have, while the bottom number (denominator) tells how many equal parts the whole is divided into.\n\nExample: Convert 3/4 to a decimal\nSolution: 3 ÷ 4 = 0.75\n\nTo convert a decimal to a fraction, we place the decimal number over a power of 10 and simplify:\nExample: 0.25 = 25/100 = 1/4' }
    ],
    'english': [
        { content: 'Unit 1: Introduction to English Language', isTitle: true },
        { content: 'English is a West Germanic language that originated from Anglo-Frisian dialects brought to Britain in the mid 5th to 7th centuries AD by Anglo-Saxon migrants.\n\nIn this unit, we will explore the basics of English grammar, vocabulary, and communication skills.' },
        { content: '1.1 Parts of Speech', isSubtitle: true },
        { content: 'The English language has eight main parts of speech:\n• Nouns\n• Pronouns\n• Verbs\n• Adjectives\n• Adverbs\n• Prepositions\n• Conjunctions\n• Interjections\n\nLet\'s explore examples of each in the following sections.' },
        { content: '1.2 Nouns and Pronouns', isSubtitle: true },
        { content: 'Nouns are naming words that refer to people, places, things, or ideas. Examples include: teacher, Malaysia, book, and happiness.\n\nPronouns replace nouns to avoid repetition. Examples include:\n• Personal pronouns: I, you, he, she, it, we, they\n• Possessive pronouns: mine, yours, his, hers, its, ours, theirs\n• Reflexive pronouns: myself, yourself, himself, herself, itself, ourselves, yourselves, themselves' },
        { content: '1.3 Verbs and Tenses', isSubtitle: true },
        { content: 'Verbs are action or state words that tell us what the subject of a sentence does or is. English has several tenses to indicate when an action takes place.\n\nPresent Simple: Used for habits, facts, or regular actions (e.g., I walk to school every day)\n\nPresent Continuous: Used for actions happening now or temporary situations (e.g., I am walking to school now)\n\nPast Simple: Used for completed actions in the past (e.g., I walked to school yesterday)' }
    ],
    'science': [
        { content: 'Chapter 1: Introduction to Scientific Method', isTitle: true },
        { content: 'Science is the systematic study of the structure and behavior of the physical and natural world through observation and experiment.\n\nIn this chapter, we will learn about the scientific method and how scientists use it to make discoveries and solve problems.' },
        { content: '1.1 Steps in the Scientific Method', isSubtitle: true },
        { content: 'The scientific method consists of several key steps:\n\n1. Ask a question\n2. Conduct background research\n3. Form a hypothesis\n4. Test with an experiment\n5. Analyze data and draw conclusion\n6. Communicate results' },
        { content: '1.2 Forming a Hypothesis', isSubtitle: true },
        { content: 'A hypothesis is a testable explanation for an observation. A good scientific hypothesis should be:\n\n• Testable through experimentation\n• Falsifiable (possible to prove wrong)\n• Based on previous observations or research\n• Stated clearly and concisely\n\nExample: "If plants receive more sunlight, then they will grow taller" is a testable hypothesis.' },
        { content: '1.3 Designing Experiments', isSubtitle: true },
        { content: 'A well-designed experiment tests only one variable at a time while keeping all other conditions the same. The key components include:\n\n• Independent variable: The factor you change deliberately\n• Dependent variable: The factor you measure as a result\n• Control group: A standard for comparison that doesn\'t receive the experimental treatment\n• Experimental group: Receives the experimental treatment\n• Constants: Factors kept the same in all groups' },
        { content: '1.4 Drawing Conclusions', isSubtitle: true },
        { content: 'After collecting and analyzing data, scientists draw conclusions about their hypothesis. A conclusion should:\n\n• State whether the results support or reject the hypothesis\n• Be based solely on the data collected\n• Acknowledge limitations of the experiment\n• Suggest improvements or further studies\n\nRemember that in science, rejecting a hypothesis is not a failure but a valuable result that advances knowledge.' }
    ],
    'sejarah': [
        { content: 'Bab 1: Pengenalan kepada Sejarah', isTitle: true },
        { content: 'Sejarah merupakan kajian tentang peristiwa yang telah berlaku pada masa lampau. Ia merangkumi semua aspek kehidupan manusia termasuk politik, ekonomi, sosial, dan kebudayaan.\n\nDalam bab ini, kita akan mempelajari kepentingan mempelajari sejarah dan bagaimana ia membantu membentuk masa depan kita.' },
        { content: '1.1 Kepentingan Mempelajari Sejarah', isSubtitle: true },
        { content: 'Mempelajari sejarah adalah penting kerana:\n\n• Memupuk semangat patriotisme\n• Menghargai perjuangan tokoh-tokoh negara\n• Mempelajari dari kesilapan masa lalu\n• Memahami proses pembentukan negara bangsa\n• Mengekalkan warisan budaya' },
        { content: '1.2 Sumber-sumber Sejarah', isSubtitle: true },
        { content: 'Sumber sejarah dibahagikan kepada dua kategori utama:\n\n1. Sumber Primer: Bahan asli yang dihasilkan pada masa peristiwa berlaku\n   • Dokumen rasmi kerajaan\n   • Surat-surat peribadi\n   • Diari\n   • Artifak\n   • Prasasti\n\n2. Sumber Sekunder: Bahan yang dihasilkan berdasarkan sumber primer\n   • Buku teks sejarah\n   • Artikel jurnal\n   • Dokumentari\n   • Ulasan sejarawan' },
        { content: '1.3 Kaedah Penyelidikan Sejarah', isSubtitle: true },
        { content: 'Sejarawan mengikuti beberapa langkah dalam penyelidikan mereka:\n\n1. Mengenal pasti tajuk kajian\n2. Mengumpul sumber sejarah yang berkaitan\n3. Menilai kesahihan sumber\n4. Mentafsir maklumat dari sumber\n5. Menganalisis maklumat dan membuat kesimpulan\n6. Menyusun dan menulis laporan sejarah\n\nKritikan sumber merupakan aspek penting dalam penyelidikan sejarah untuk memastikan kesahihan fakta.' }
    ],
};

export default function TextbookViewerScreen() {
  const router = useRouter();
  const { form, subject, title } = useLocalSearchParams();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  
  const formNumber = typeof form === 'string' ? form : '1';
  const subjectId = typeof subject === 'string' ? subject as SubjectId : 'bahasa-melayu';
  const subjectTitle = typeof title === 'string' ? title : 'Bahasa Melayu';
  
  const pdfUrl = PDF_URLS[subjectId];
  const pages = MOCK_PAGES[subjectId] || MOCK_PAGES['bahasa-melayu'];
  const totalPages = pages.length;
  
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle WebView errors
  const handleWebViewError = () => {
    setPdfError(true);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3a86ff" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          Form {formNumber}: {subjectTitle}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {pdfUrl && !pdfError ? (
          <View style={styles.pdfContainer}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3a86ff" />
                <Text style={styles.loadingText}>Loading PDF...</Text>
              </View>
            )}
            <WebView 
              source={{ uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}` }} 
              style={[styles.pdfWebView, loading ? { height: 0 } : null]}
              onLoadEnd={() => setLoading(false)}
              onError={handleWebViewError}
              startInLoadingState={true}
              renderLoading={() => <ActivityIndicator size="large" color="#3a86ff" />}
            />
          </View>
        ) : (
          <View style={styles.pageContainer}>
            <View style={styles.bookmarkContainer}>
              <TouchableOpacity style={styles.bookmarkButton}>
                <Ionicons name="bookmark-outline" size={24} color="#3a86ff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-outline" size={24} color="#3a86ff" />
              </TouchableOpacity>
            </View>
            
            {pdfError && pdfUrl && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={32} color="#ff3a5e" />
                <Text style={styles.errorText}>
                  There was an error loading the PDF. Using simplified text view instead.
                </Text>
              </View>
            )}
            
            <ScrollView style={styles.pageContent} showsVerticalScrollIndicator={false}>
              {pages[currentPage].isTitle ? (
                <Text style={styles.pageTitle}>{pages[currentPage].content}</Text>
              ) : pages[currentPage].isSubtitle ? (
                <Text style={styles.pageSubtitle}>{pages[currentPage].content}</Text>
              ) : (
                <Text style={styles.pageText}>{pages[currentPage].content}</Text>
              )}
              
              {subjectId === 'science' && currentPage === 3 && (
                <View style={styles.diagramContainer}>
                  <Image 
                    source={require('../../../assets/images/splash-icon.png')} 
                    style={styles.diagramImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.diagramCaption}>Fig 1.1: The Scientific Method Process</Text>
                </View>
              )}
              
              {subjectId === 'mathematics' && currentPage === 3 && (
                <View style={styles.formulaContainer}>
                  <Text style={styles.formulaText}>E = mc²</Text>
                  <Text style={styles.formulaCaption}>Einstein's famous equation relating energy and mass</Text>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.navigationContainer}>
              <TouchableOpacity 
                style={[styles.navButton, currentPage === 0 && styles.disabledButton]} 
                onPress={goToPrevPage}
                disabled={currentPage === 0}
              >
                <Ionicons name="arrow-back-circle" size={28} color={currentPage === 0 ? "#ccc" : "#3a86ff"} />
                <Text style={[styles.navButtonText, currentPage === 0 && styles.disabledButtonText]}>Previous</Text>
              </TouchableOpacity>
              
              <Text style={styles.pageNumber}>
                Page {currentPage + 1} of {totalPages}
              </Text>
              
              <TouchableOpacity 
                style={[styles.navButton, currentPage === totalPages - 1 && styles.disabledButton]} 
                onPress={goToNextPage}
                disabled={currentPage === totalPages - 1}
              >
                <Text style={[styles.navButtonText, currentPage === totalPages - 1 && styles.disabledButtonText]}>Next</Text>
                <Ionicons name="arrow-forward-circle" size={28} color={currentPage === totalPages - 1 ? "#ccc" : "#3a86ff"} />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3a86ff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pdfWebView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3a86ff',
  },
  errorContainer: {
    padding: 15,
    backgroundColor: '#fff5f7',
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3a5e',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  bookmarkContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  bookmarkButton: {
    padding: 5,
    marginRight: 10,
  },
  shareButton: {
    padding: 5,
  },
  pageContent: {
    flex: 1,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 15,
  },
  pageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  diagramContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  diagramImage: {
    width: pageWidth - 40,
    height: 150,
  },
  diagramCaption: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  formulaContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  formulaText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  formulaCaption: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#3a86ff',
    fontWeight: '500',
    marginHorizontal: 5,
  },
  disabledButtonText: {
    color: '#ccc',
  },
  pageNumber: {
    fontSize: 14,
    color: '#666',
  },
});