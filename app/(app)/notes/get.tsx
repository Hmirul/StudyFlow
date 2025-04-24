import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { CameraView, Camera } from 'expo-camera';

export default function GetNoteScreen() {
  const router = useRouter();
  const { fetchWithAuth } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarcodeScanned = async ({ type, data }) => {
    if (scanned || loading || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setScanned(true);
    setLoading(true);
    
    try {
      let noteData;
      try {
        noteData = JSON.parse(data);
        if (!noteData.title || !noteData.content) {
          throw new Error('Invalid note format');
        }
      } catch (e) {
        Alert.alert('Error', 'Invalid QR code format. This doesn\'t contain valid note data.');
        setScanned(false);
        setLoading(false);
        isProcessingRef.current = false;
        return;
      }

      const res = await fetchWithAuth('/notes/import', {
        method: 'POST',
        body: JSON.stringify({ 
          title: noteData.title, 
          content: noteData.content 
        })
      });

      if (res.ok) {
        Alert.alert(
          'Success', 
          'Note imported successfully!', 
          [{ text: 'OK', onPress: () => router.replace('/(app)/notes') }]
        );
      } else {
        Alert.alert('Error', 'Failed to import note. Please try again.');
        setScanned(false);
      }
    } catch (e) {
      Alert.alert('Error', 'An error occurred. Please try again.');
      setScanned(false);
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  };

  const toggleScanner = () => {
    setScanning(!scanning);
    setScanned(false);
    isProcessingRef.current = false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3a86ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import Note</Text>
        <View style={{ width: 24 }} />
      </View>

      {scanning ? (
        <View style={styles.scannerContainer}>
          {hasPermission === null ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#3a86ff" />
              <Text style={styles.permissionText}>Requesting camera permission...</Text>
            </View>
          ) : hasPermission === false ? (
            <View style={styles.centerContent}>
              <Ionicons name="camera-off-outline" size={64} color="#ccc" />
              <Text style={styles.permissionText}>No access to camera.</Text>
              <Text style={styles.permissionSubText}>
                Please enable camera permissions in your device settings.
              </Text>
            </View>
          ) : (
            <>
              <CameraView
                style={styles.scanner}
                onBarcodeScanned={scanned || loading || isProcessingRef.current ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
              />
              
              <View style={styles.scanOverlay}>
                <View style={styles.scannerHeader}>
                  <Text style={styles.scannerTitle}>Scan QR Code</Text>
                  <Text style={styles.scannerSubtitle}>Position the QR code within the frame</Text>
                </View>
                
                <View style={styles.scanFrame}>
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />
                </View>

                {loading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.loadingText}>Importing note...</Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={toggleScanner}
                  disabled={loading || isProcessingRef.current}
                >
                  <Ionicons name="close-circle" size={24} color="white" />
                  <Text style={styles.cancelButtonText}>Cancel Scan</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ) : (
        <ScrollView style={styles.contentContainer}>
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={24} color="#3a86ff" />
            <Text style={styles.infoText}>
              Scan a QR code to import a note shared by your friend. The QR code should contain note data in the correct format.
            </Text>
          </View>

          <View style={styles.illustrationContainer}>
            <Ionicons name="qr-code" size={100} color="#ddd" />
            <Text style={styles.illustrationText}>
              Tap the button below to open the camera and scan a note QR code
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.scanButton}
            onPress={toggleScanner}
          >
            <Ionicons name="scan" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.scanButtonText}>Scan QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.textModeButton}
            onPress={() => router.replace('/(app)/notes')}
          >
            <Text style={styles.textModeButtonText}>Go Back to Notes</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
    color: '#3a86ff',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#e0eaff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: '#3a4a6a',
    fontSize: 14,
    lineHeight: 20,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginVertical: 30,
  },
  illustrationText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
  scanButton: {
    backgroundColor: '#3a86ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  textModeButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  textModeButtonText: {
    color: '#3a86ff',
    fontWeight: '600',
    fontSize: 16,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  scannerHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  scannerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  scannerSubtitle: {
    color: 'white',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'white',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: 'white',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: 'white',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: 'white',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 40,
  },
  cancelButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  permissionSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: 'white',
    fontSize: 16,
  },
});
