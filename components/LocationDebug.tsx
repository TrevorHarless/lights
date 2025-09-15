import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { locationService } from '~/services/location';

// Temporary debug component - remove after testing
export default function LocationDebug() {
  const [testing, setTesting] = useState(false);

  const testGoogleAPI = async () => {
    setTesting(true);
    
    try {
      console.log('=== API Debug Test ===');
      console.log('Environment variables:');
      console.log('EXPO_PUBLIC_GOOGLE_PLACES_API_KEY exists:', !!process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY);
      
      if (process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY) {
        const key = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
        console.log('API key length:', key.length);
        console.log('API key starts with:', key.substring(0, 10));
        console.log('API key format looks like AIza...:', key.startsWith('AIza'));
      }

      // Test a simple search
      const results = await locationService.searchPlaces('New York');
      console.log('API test successful, results:', results.length);
      Alert.alert('Success', `API working! Found ${results.length} results for "New York"`);
    } catch (error) {
      console.error('API test failed:', error);
      Alert.alert('API Test Failed', error instanceof Error ? error.message : String(error));
    } finally {
      setTesting(false);
    }
  };

  const testSimpleRequest = async () => {
    setTesting(true);
    
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
        Alert.alert('No API Key', 'EXPO_PUBLIC_GOOGLE_PLACES_API_KEY not found in environment');
        return;
      }

      // Make a simple test request
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=test&key=${apiKey}`;
      console.log('Testing direct API call...');
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Direct API response:', data);
      Alert.alert('Direct API Test', `Status: ${data.status}\nError: ${data.error_message || 'None'}`);
    } catch (error) {
      console.error('Direct API test failed:', error);
      Alert.alert('Direct API Test Failed', String(error));
    } finally {
      setTesting(false);
    }
  };

  return (
    <View className="p-4 bg-yellow-100 m-4 rounded-lg">
      <Text className="text-lg font-bold mb-2">🐛 Location API Debug</Text>
      <Text className="text-sm text-gray-600 mb-3">
        Temporary debug panel - remove after testing
      </Text>
      
      <TouchableOpacity
        className="bg-blue-500 p-3 rounded mb-2"
        onPress={testGoogleAPI}
        disabled={testing}
      >
        <Text className="text-white text-center">
          {testing ? 'Testing...' : 'Test Location Service'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className="bg-green-500 p-3 rounded"
        onPress={testSimpleRequest}
        disabled={testing}
      >
        <Text className="text-white text-center">
          {testing ? 'Testing...' : 'Test Direct API Call'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}