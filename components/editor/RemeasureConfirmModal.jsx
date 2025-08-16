import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

export function RemeasureConfirmModal({ 
  visible, 
  onCancel, 
  onConfirm 
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
      }}>
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: 24,
          paddingHorizontal: 24,
          paddingVertical: 32,
          maxWidth: 360,
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
            backgroundColor: '#fef3cd',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <MaterialIcons 
              name="straighten" 
              size={28} 
              color="#f59e0b" 
            />
          </View>

          {/* Title */}
          <Text style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: 12,
            letterSpacing: -0.3,
          }}>
            Remeasure Reference
          </Text>

          {/* Message */}
          <Text style={{
            fontSize: 16,
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 32,
          }}>
            Are you sure you want to remeasure? This will remove your current measurement.
          </Text>

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
              onPress={onCancel}
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
                backgroundColor: '#2563eb',
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
              onPress={onConfirm}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: 'white',
              }}>
                Yes, Remeasure
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}