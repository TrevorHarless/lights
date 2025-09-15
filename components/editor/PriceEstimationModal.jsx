import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const PriceEstimationModal = ({ 
  visible, 
  onClose, 
  measurementLines = [],
  isTablet = false 
}) => {
  const [pricePerFoot, setPricePerFoot] = useState('');
  const [totalLength, setTotalLength] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Calculate total length from all measurement lines
  useEffect(() => {
    if (measurementLines.length > 0) {
      const total = measurementLines.reduce((sum, line) => {
        return sum + (line.lengthInFeet || 0);
      }, 0);
      setTotalLength(total);
    } else {
      setTotalLength(0);
    }
  }, [measurementLines]);

  // Calculate total cost when price per foot changes
  useEffect(() => {
    const price = parseFloat(pricePerFoot) || 0;
    setTotalCost(totalLength * price);
  }, [pricePerFoot, totalLength]);

  // Handle price input change
  const handlePriceChange = (text) => {
    // Only allow numbers and decimal point
    const numericText = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setPricePerFoot(numericText);
  };

  // Format currency display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setPricePerFoot('');
      setTotalCost(0);
    }
  }, [visible]);

  // Show alert if no measurements
  const showNoMeasurementsAlert = () => {
    Alert.alert(
      'No Measurements Found',
      'You need to create measurement lines first. Switch to Measure mode and draw some measurement lines to calculate pricing.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  // Handle close - show alert if no measurements
  const handleClose = () => {
    if (totalLength === 0) {
      showNoMeasurementsAlert();
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={{
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: isTablet ? 40 : 20,
        paddingTop: isTablet ? 100 : 80,
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: isTablet ? 24 : 20,
          padding: isTablet ? 40 : 24,
          width: '100%',
          maxWidth: isTablet ? 600 : 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 10,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isTablet ? 32 : 24,
          }}>
            <Text style={{
              fontSize: isTablet ? 32 : 24,
              fontWeight: '700',
              color: '#1f2937',
              flex: 1,
            }}>
              Price Estimate
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                width: isTablet ? 48 : 32,
                height: isTablet ? 48 : 32,
                borderRadius: isTablet ? 24 : 16,
                backgroundColor: '#f3f4f6',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MaterialIcons 
                name="close" 
                size={isTablet ? 28 : 20} 
                color="#6b7280" 
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {totalLength === 0 ? (
            /* No measurements state */
            <View style={{ alignItems: 'center', paddingVertical: isTablet ? 40 : 20 }}>
              <MaterialIcons 
                name="straighten" 
                size={isTablet ? 80 : 60} 
                color="#d1d5db" 
                style={{ marginBottom: isTablet ? 24 : 16 }}
              />
              <Text style={{
                fontSize: isTablet ? 24 : 18,
                fontWeight: '600',
                color: '#374151',
                textAlign: 'center',
                marginBottom: isTablet ? 16 : 12,
              }}>
                No Measurements Found
              </Text>
              <Text style={{
                fontSize: isTablet ? 18 : 14,
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: isTablet ? 26 : 20,
              }}>
                Switch to Measure mode and draw measurement lines to calculate material costs
              </Text>
            </View>
          ) : (
            /* Has measurements state */
            <>
              {/* Total Length Display */}
              <View style={{
                backgroundColor: '#f8fafc',
                borderRadius: isTablet ? 16 : 12,
                padding: isTablet ? 24 : 16,
                marginBottom: isTablet ? 24 : 16,
              }}>
                <Text style={{
                  fontSize: isTablet ? 18 : 14,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: isTablet ? 8 : 4,
                }}>
                  Total Length from {measurementLines.length} measurement{measurementLines.length !== 1 ? 's' : ''}
                </Text>
                <Text style={{
                  fontSize: isTablet ? 32 : 24,
                  fontWeight: '700',
                  color: '#059669',
                }}>
                  {totalLength.toFixed(1)} ft
                </Text>
              </View>

              {/* Price Per Foot Input */}
              <View style={{ marginBottom: isTablet ? 24 : 16 }}>
                <Text style={{
                  fontSize: isTablet ? 18 : 14,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: isTablet ? 12 : 8,
                }}>
                  Price per Foot
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: pricePerFoot ? '#3b82f6' : '#d1d5db',
                  borderRadius: isTablet ? 16 : 12,
                  paddingHorizontal: isTablet ? 20 : 16,
                  backgroundColor: 'white',
                }}>
                  <Text style={{
                    fontSize: isTablet ? 24 : 18,
                    fontWeight: '600',
                    color: '#374151',
                    marginRight: isTablet ? 12 : 8,
                  }}>
                    $
                  </Text>
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: isTablet ? 24 : 18,
                      paddingVertical: isTablet ? 16 : 12,
                      color: '#1f2937',
                    }}
                    value={pricePerFoot}
                    onChangeText={handlePriceChange}
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    autoFocus={true}
                  />
                </View>
              </View>

              {/* Total Cost Display */}
              <View style={{
                backgroundColor: '#eff6ff',
                borderRadius: isTablet ? 16 : 12,
                padding: isTablet ? 24 : 16,
                marginBottom: isTablet ? 32 : 24,
                borderWidth: 2,
                borderColor: '#3b82f6',
              }}>
                <Text style={{
                  fontSize: isTablet ? 18 : 14,
                  fontWeight: '600',
                  color: '#1e40af',
                  marginBottom: isTablet ? 8 : 4,
                }}>
                  Estimated Material Cost
                </Text>
                <Text style={{
                  fontSize: isTablet ? 36 : 28,
                  fontWeight: '700',
                  color: '#1e40af',
                }}>
                  {formatCurrency(totalCost)}
                </Text>
                {pricePerFoot && (
                  <Text style={{
                    fontSize: isTablet ? 16 : 12,
                    color: '#6b7280',
                    marginTop: isTablet ? 8 : 4,
                  }}>
                    {totalLength.toFixed(1)} ft × ${pricePerFoot} = {formatCurrency(totalCost)}
                  </Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={{
                flexDirection: 'row',
                gap: isTablet ? 16 : 12,
              }}>
                <TouchableOpacity
                  onPress={handleClose}
                  style={{
                    flex: 1,
                    backgroundColor: '#f3f4f6',
                    paddingVertical: isTablet ? 16 : 12,
                    borderRadius: isTablet ? 16 : 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    fontSize: isTablet ? 20 : 16,
                    fontWeight: '600',
                    color: '#374151',
                  }}>
                    Close
                  </Text>
                </TouchableOpacity>
                
                {pricePerFoot && totalCost > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      // Copy to clipboard or share functionality could go here
                      Alert.alert(
                        'Price Estimate',
                        `Total Length: ${totalLength.toFixed(1)} ft\nPrice per Foot: $${pricePerFoot}\nTotal Cost: ${formatCurrency(totalCost)}`,
                        [{ text: 'OK' }]
                      );
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#3b82f6',
                      paddingVertical: isTablet ? 16 : 12,
                      borderRadius: isTablet ? 16 : 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      fontSize: isTablet ? 20 : 16,
                      fontWeight: '600',
                      color: 'white',
                    }}>
                      Share Quote
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PriceEstimationModal;