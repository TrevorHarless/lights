import React from 'react';
import { Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native';

export function ClearAllConfirmModal({
  visible,
  onCancel,
  onConfirm,
}) {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: isTablet ? 24 : 16,
            padding: isTablet ? 32 : 24,
            margin: isTablet ? 40 : 20,
            minWidth: isTablet ? 400 : 300,
            maxWidth: isTablet ? 500 : 350,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: isTablet ? 24 : 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: isTablet ? 16 : 12,
              color: '#333',
            }}
          >
            Clear All Assets?
          </Text>

          {/* Description */}
          <Text
            style={{
              fontSize: isTablet ? 18 : 16,
              textAlign: 'center',
              marginBottom: isTablet ? 32 : 24,
              color: '#666',
              lineHeight: isTablet ? 26 : 22,
            }}
          >
            This will permanently remove all light strings, individual lights, and decor from your design.
          </Text>

          {/* Warning note */}
          <View
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: isTablet ? 12 : 8,
              padding: isTablet ? 16 : 12,
              marginBottom: isTablet ? 24 : 20,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <Text
              style={{
                fontSize: isTablet ? 16 : 14,
                fontWeight: '600',
                textAlign: 'center',
                color: '#EF4444',
              }}
            >
              This action cannot be undone!
            </Text>
          </View>

          {/* Buttons */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: isTablet ? 16 : 12,
            }}
          >
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                padding: isTablet ? 16 : 14,
                backgroundColor: '#F5F5F5',
                borderRadius: isTablet ? 12 : 8,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: isTablet ? 18 : 16,
                  fontWeight: '600',
                  color: '#666',
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Clear All Button */}
            <TouchableOpacity
              onPress={onConfirm}
              style={{
                flex: 1,
                padding: isTablet ? 16 : 14,
                backgroundColor: '#EF4444',
                borderRadius: isTablet ? 12 : 8,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: isTablet ? 18 : 16,
                  fontWeight: '600',
                  color: 'white',
                }}
              >
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}