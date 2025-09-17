import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { locationService } from '~/services/location';

// Temporary debug component - remove after testing
export default function LocationDebug() {
  const [testing, setTesting] = useState(false);

  const testLocationService = async () => {
    setTesting(true);
    
    try {
      console.log('=== Location Service Test (Edge Functions) ===');
      console.log('Testing Supabase Edge Functions for location services');

      // Test a simple search
      const results = await locationService.searchPlaces('New York');
      console.log('Location service test successful, results:', results.length);
      Alert.alert('Success', `Location service working! Found ${results.length} results for "New York"`);
    } catch (error) {
      console.error('Location service test failed:', error);
      Alert.alert('Location Service Test Failed', error instanceof Error ? error.message : String(error));
    } finally {
      setTesting(false);
    }
  };

  const testGeocoding = async () => {
    setTesting(true);
    
    try {
      console.log('Testing geocoding edge function...');
      
      // Test geocoding
      const result = await locationService.geocodeAddress('Times Square, New York');
      
      if (result) {
        console.log('Geocoding test successful:', result);
        Alert.alert('Geocoding Success', `Address: ${result.formatted_address}\nCoords: ${result.coordinates.latitude}, ${result.coordinates.longitude}`);
      } else {
        Alert.alert('Geocoding Test', 'No results found');
      }
    } catch (error) {
      console.error('Geocoding test failed:', error);
      Alert.alert('Geocoding Test Failed', String(error));
    } finally {
      setTesting(false);
    }
  };

  return (
    <View className="p-4 bg-yellow-100 m-4 rounded-lg">
      <Text className="text-lg font-bold mb-2">🐛 Location Service Debug (Edge Functions)</Text>
      <Text className="text-sm text-gray-600 mb-3">
        Testing Supabase Edge Functions for Google APIs - remove after testing
      </Text>
      
      <TouchableOpacity
        className="bg-blue-500 p-3 rounded mb-2"
        onPress={testLocationService}
        disabled={testing}
      >
        <Text className="text-white text-center">
          {testing ? 'Testing...' : 'Test Places Search (Edge Function)'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className="bg-green-500 p-3 rounded"
        onPress={testGeocoding}
        disabled={testing}
      >
        <Text className="text-white text-center">
          {testing ? 'Testing...' : 'Test Geocoding (Edge Function)'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}