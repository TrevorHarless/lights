import React, { useState } from 'react';
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function ReferenceModal({ visible, onClose, onConfirm, onCancel }) {
  const [lengthInput, setLengthInput] = useState('');

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="w-80 max-w-[90%] rounded-lg bg-white p-6">
          <Text className="mb-4 text-center text-xl font-bold">Set Reference Length</Text>

          <Text className="mb-4 text-center text-gray-600">
            What is the real-world length of the line you just drew?
          </Text>

          <View className="mb-6">
            <Text className="mb-2 text-sm text-gray-500">Length (feet)</Text>
            <TextInput
              className="rounded-lg border border-gray-300 px-4 py-3 text-lg"
              value={lengthInput}
              onChangeText={setLengthInput}
              placeholder="Enter length (e.g., 10.5)"
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
            />
            <Text className="mt-1 text-xs text-gray-400">
              Example: If your garage door is 10 feet wide, enter "10"
            </Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 rounded-lg bg-gray-200 py-3" onPress={handleCancel}>
              <Text className="text-center font-medium text-gray-700">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-lg bg-blue-500 py-3"
              onPress={handleConfirm}>
              <Text className="text-center font-medium text-white">Set Reference</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
