import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native';

export function ModeSelectionPopover({
  visible,
  onClose,
  currentMode,
  onSelectMode,
  tutorialMessage,
  tutorialRestrictToMode, // Which mode to restrict to during tutorial
}) {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const modes = [
    {
      id: 'string',
      name: 'String Mode',
      description: 'Draw light strings by dragging',
      icon: 'timeline',
      color: '#E91E63', // Pink
    },
    {
      id: 'tap',
      name: 'Tap Mode', 
      description: 'Tap to place individual lights',
      icon: 'touch-app',
      color: '#00BCD4', // Cyan
    },
    {
      id: 'decor',
      name: 'Decor Mode',
      description: 'Place and resize decorative elements',
      icon: 'star',
      color: '#FF9800', // Orange (keeping the same)
    },
    {
      id: 'measure',
      name: 'Measure Mode',
      description: 'Draw lines to measure house dimensions',
      icon: 'square-foot',
      color: '#4CAF50', // Green
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onClose}
        activeOpacity={1}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: isTablet ? 24 : 16,
            padding: isTablet ? 32 : 24,
            margin: isTablet ? 40 : 20,
            minWidth: isTablet ? 450 : 350,
            maxWidth: isTablet ? 500 : 380,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text
            style={{
              fontSize: isTablet ? 24 : 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: tutorialMessage ? isTablet ? 16 : 12 : isTablet ? 24 : 16,
              color: '#333',
            }}
          >
            Select Interaction Mode
          </Text>
          
          {tutorialMessage && (
            <View style={{
              backgroundColor: '#E3F2FD',
              borderRadius: isTablet ? 16 : 12,
              padding: isTablet ? 20 : 16,
              marginBottom: isTablet ? 24 : 16,
              borderLeftWidth: 4,
              borderLeftColor: '#2196F3',
            }}>
              <Text style={{
                fontSize: isTablet ? 18 : 16,
                color: '#1976D2',
                textAlign: 'center',
                fontWeight: '500',
                lineHeight: isTablet ? 24 : 20,
              }}>
                💡 {tutorialMessage}
              </Text>
            </View>
          )}

          {modes.map((mode) => {
            const isSelected = currentMode === mode.id;
            const isTutorialRestricted = tutorialRestrictToMode && mode.id !== tutorialRestrictToMode;
            const isDisabled = isTutorialRestricted;
            
            return (
              <TouchableOpacity
                key={mode.id}
                disabled={isDisabled}
                onPress={() => {
                  if (!isDisabled) {
                    onSelectMode(mode.id);
                    onClose();
                  }
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: isTablet ? 24 : 20,
                  marginVertical: isTablet ? 10 : 8,
                  borderRadius: isTablet ? 16 : 12,
                  backgroundColor: isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? mode.color : '#E0E0E0',
                  minHeight: isTablet ? 80 : 70,
                  opacity: isDisabled ? 0.4 : 1.0,
                }}
              >
                <View
                  style={{
                    width: isTablet ? 56 : 44,
                    height: isTablet ? 56 : 44,
                    borderRadius: isTablet ? 28 : 22,
                    backgroundColor: isDisabled ? '#E0E0E0' : (isSelected ? mode.color : '#F5F5F5'),
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: isTablet ? 20 : 16,
                  }}
                >
                  <MaterialIcons
                    name={mode.icon}
                    size={isTablet ? 38 : 24}
                    color={isDisabled ? '#999' : (isSelected ? 'white' : '#666')}
                  />
                </View>

                <View style={{ flex: 1, justifyContent: 'center', paddingRight: isTablet ? 16 : 12 }}>
                  <Text
                    style={{
                      fontSize: isTablet ? 24 : 16,
                      fontWeight: '600',
                      color: isDisabled ? '#999' : (isSelected ? mode.color : '#333'),
                      marginBottom: isTablet ? 8 : 6,
                    }}
                  >
                    {mode.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: isTablet ? 18 : 14,
                      color: isDisabled ? '#BBB' : '#666',
                      lineHeight: isTablet ? 22 : 20,
                      flexWrap: 'wrap',
                    }}
                  >
                    {mode.description}
                  </Text>
                </View>

                {isSelected && (
                  <MaterialIcons
                    name="check-circle"
                    size={isTablet ? 28 : 24}
                    color={mode.color}
                    style={{ 
                      marginLeft: isTablet ? 8 : 4,
                      alignSelf: 'center'
                    }}
                  />
                )}
              </TouchableOpacity>
            );
          })}

          {/* Informational note */}
          <View
            style={{
              marginTop: isTablet ? 20 : 16,
              padding: isTablet ? 16 : 12,
              backgroundColor: 'rgba(33, 150, 243, 0.05)',
              borderRadius: isTablet ? 12 : 8,
              borderWidth: 1,
              borderColor: 'rgba(33, 150, 243, 0.1)',
            }}
          >
            <Text
              style={{
                fontSize: isTablet ? 18 : 14,
                fontStyle: 'italic',
                color: '#666',
                textAlign: 'center',
                lineHeight: isTablet ? 22 : 20,
              }}
            >
              Note: You can only select and interact with assets in the current mode (i.e. you cannot interact with Decor items while being in the String Mode)
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: isTablet ? 16 : 12,
              padding: isTablet ? 16 : 12,
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
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}