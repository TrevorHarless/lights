import React from 'react';
import { 
  Text, 
  TouchableOpacity, 
  View, 
  StyleSheet
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TutorialStep } from '~/constants/tutorialSteps';

interface TutorialOverlayProps {
  visible: boolean;
  step: TutorialStep | null;
  onNext: () => void;
  onEnd: () => void;
}

export default function TutorialOverlay({ 
  visible, 
  step, 
  onNext, 
  onEnd
}: TutorialOverlayProps) {
  console.log('🎯 TutorialOverlay render:', { visible, hasStep: !!step, stepTitle: step?.title });
  
  if (!visible || !step) return null;
  
  const buttonText = step.buttonText || 'Next';
  
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
          <View className="p-6">
            <Text className="text-xl font-bold text-gray-800 mb-3 text-center">
              {step.title}
            </Text>
            
            {step.icon && (
              <View className="items-center mb-4">
                <View style={{
                  backgroundColor: ['zoom-out-map', 'nightlight-round', 'file-download'].includes(step.icon) ? 'rgba(255, 255, 255, 0.9)' : '#333',
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: ['zoom-out-map', 'nightlight-round', 'file-download'].includes(step.icon) ? 0.15 : 0,
                  shadowRadius: 4,
                  elevation: ['zoom-out-map', 'nightlight-round', 'file-download'].includes(step.icon) ? 4 : 0,
                }}>
                  <MaterialIcons 
                    name={step.icon as any} 
                    size={40} 
                    color={['zoom-out-map', 'nightlight-round', 'file-download'].includes(step.icon) ? '#333' : 'white'} 
                  />
                </View>
                <Text className="text-sm text-gray-500 text-center">Tap this button</Text>
              </View>
            )}
            
            <Text className="text-base text-gray-700 mb-6 text-center leading-relaxed">
              {step.message}
            </Text>
            
            <View className="flex-row justify-between items-center">
              <TouchableOpacity
                className="py-2 px-4"
                onPress={onEnd}
              >
                <Text className="text-gray-500 font-medium">Skip Tutorial</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-blue-600 py-3 px-6 rounded-xl"
                onPress={onNext}
              >
                <Text className="text-white font-semibold text-base">
                  {buttonText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}