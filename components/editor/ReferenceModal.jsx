import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function ReferenceModal({ visible, onClose, onConfirm, onCancel }) {
  const [lengthInput, setLengthInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [, setShouldFocusInput] = useState(false);
  const inputRef = useRef(null);

  // Handle modal showing with smooth timing
  useEffect(() => {
    if (visible) {
      // Focus input first to show keyboard
      setShouldFocusInput(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
      // Show modal after keyboard starts animating in
      const modalTimer = setTimeout(() => {
        setModalVisible(true);
      }, 100);

      return () => clearTimeout(modalTimer);
    } else {
      // Hide modal first
      setModalVisible(false);
      
      // Dismiss keyboard after modal starts fading out
      const keyboardTimer = setTimeout(() => {
        setShouldFocusInput(false);
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }, 100);

      return () => clearTimeout(keyboardTimer);
    }
  }, [visible]);

  const handleConfirm = () => {
    const length = parseFloat(lengthInput);

    if (isNaN(length) || length <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid length in feet (e.g., 10.5)');
      return;
    }

    onConfirm(length);
    setLengthInput('');
  };

  const handleCancel = () => {
    setLengthInput('');
    onCancel();
  };

  return (
    <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleCancel}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: 24,
            paddingHorizontal: 24,
            paddingVertical: 32,
            maxWidth: 400,
            width: '100%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 12,
            alignItems: 'center',
          }}>
          {/* Icon */}
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#e0f2fe',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <MaterialIcons 
              name="straighten" 
              size={28} 
              color="#0369a1" 
            />
          </View>

          {/* Title */}
          <Text style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: 8,
            letterSpacing: -0.3,
          }}>
            Set Reference Length
          </Text>

          {/* Subtitle */}
          <Text style={{
            fontSize: 16,
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 28,
          }}>
            What is the real-world length of the line you just drew?
          </Text>

          {/* Input Section */}
          <View style={{ width: '100%', marginBottom: 32 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#374151',
              marginBottom: 8,
              marginLeft: 4,
            }}>
              Length (feet)
            </Text>
            <TextInput
              ref={inputRef}
              style={{
                backgroundColor: '#f9fafb',
                borderWidth: 2,
                borderColor: '#e5e7eb',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                textAlign: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
              value={lengthInput}
              onChangeText={setLengthInput}
              placeholder="e.g., 10.5"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
            <Text style={{
              fontSize: 12,
              color: '#9ca3af',
              textAlign: 'center',
              marginTop: 8,
              lineHeight: 16,
            }}>
              Example: If your garage door is 10 feet wide, enter &quot;10&quot;
            </Text>
          </View>

          {/* Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
            width: '100%',
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#f3f4f6',
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={handleCancel}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#374151',
              }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#374151',
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#374151',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={handleConfirm}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: 'white',
              }}>
                Set Reference
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
