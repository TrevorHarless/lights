import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, InputAccessoryView, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function ReferenceModal({ visible, onClose, onConfirm, onCancel }) {
  const [lengthInput, setLengthInput] = useState('');
  const inputRef = useRef(null);

  // Device detection for responsive design
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const inputAccessoryViewID = 'referenceDone';

  // Clear input when modal becomes visible
  useEffect(() => {
    if (visible) {
      setLengthInput('');
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
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: isTablet ? 48 : 32,
              paddingVertical: isTablet ? 60 : 40,
            }}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="interactive"
          >
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: isTablet ? 32 : 24,
            paddingHorizontal: isTablet ? 40 : 24,
            paddingVertical: isTablet ? 48 : 32,
            maxWidth: isTablet ? 600 : 400,
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
            width: isTablet ? 80 : 64,
            height: isTablet ? 80 : 64,
            borderRadius: isTablet ? 40 : 32,
            backgroundColor: '#e0f2fe',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: isTablet ? 28 : 20,
          }}>
            <MaterialIcons 
              name="straighten" 
              size={isTablet ? 36 : 28} 
              color="#0369a1" 
            />
          </View>

          {/* Title */}
          <Text style={{
            fontSize: isTablet ? 28 : 22,
            fontWeight: '700',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: isTablet ? 12 : 8,
            letterSpacing: -0.3,
          }}>
            Set Reference Length
          </Text>

          {/* Subtitle */}
          <Text style={{
            fontSize: isTablet ? 20 : 16,
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: isTablet ? 28 : 22,
            marginBottom: isTablet ? 36 : 28,
          }}>
            What is the real-world length of the line you just drew?
          </Text>

          {/* Input Section */}
          <View style={{ width: '100%', marginBottom: isTablet ? 40 : 32 }}>
            <Text style={{
              fontSize: isTablet ? 20 : 14,
              fontWeight: '600',
              color: '#374151',
              marginBottom: isTablet ? 12 : 8,
              marginLeft: isTablet ? 6 : 4,
            }}>
              Length (feet)
            </Text>
            <TextInput
              ref={inputRef}
              style={{
                backgroundColor: '#f9fafb',
                borderWidth: 2,
                borderColor: '#e5e7eb',
                borderRadius: isTablet ? 20 : 16,
                paddingHorizontal: isTablet ? 24 : 16,
                paddingVertical: isTablet ? 20 : 14,
                fontSize: isTablet ? 24 : 18,
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
              inputAccessoryViewID={inputAccessoryViewID}
              returnKeyType="done"
              onSubmitEditing={handleConfirm}
            />
            <Text style={{
              fontSize: isTablet ? 18 : 12,
              color: '#9ca3af',
              textAlign: 'center',
              marginTop: isTablet ? 12 : 8,
              lineHeight: isTablet ? 22 : 16,
            }}>
              Example: If your garage door is 10 feet wide, enter &quot;10&quot;
            </Text>
          </View>

          {/* Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: isTablet ? 16 : 12,
            width: '100%',
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#f3f4f6',
                paddingVertical: isTablet ? 20 : 14,
                borderRadius: isTablet ? 20 : 16,
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
                fontSize: isTablet ? 20 : 16,
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
                paddingVertical: isTablet ? 20 : 14,
                borderRadius: isTablet ? 20 : 16,
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
                fontSize: isTablet ? 20 : 16,
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
    <InputAccessoryView nativeID={inputAccessoryViewID}>
      <View style={{
        backgroundColor: '#f3f4f6',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => {
            inputRef.current?.blur();
            Keyboard.dismiss();
            handleCancel();
          }}
          style={{
            backgroundColor: '#9ca3af',
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            inputRef.current?.blur();
            Keyboard.dismiss();
            handleConfirm();
          }}
          style={{
            backgroundColor: '#374151',
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Set Reference</Text>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
    </>
  );
}
