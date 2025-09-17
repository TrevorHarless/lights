import { MaterialIcons } from "@expo/vector-icons";
import debounce from "lodash/debounce";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { locationService, PlaceResult } from "~/services/location";

interface LocationInputProps {
  value: string;
  onLocationSelect: (
    address: string,
    latitude?: number,
    longitude?: number
  ) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function LocationInput({
  value,
  onLocationSelect,
  placeholder = "Enter address",
  className = "",
  disabled = false,
}: LocationInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Create debounced search function
  const debouncedSearchPlaces = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      try {
        const results = await locationService.searchPlaces(query);
        setSuggestions(results);
      } catch (error) {
        console.error("Location search error:", error);
        setSuggestions([]);

        // Log the error but don't show alerts for common issues like typos
        if (
          error instanceof Error &&
          error.message.includes("API key not configured")
        ) {
          console.warn(
            "Google Places API key not configured. Address autocomplete disabled."
          );
        } else {
          // Silently handle search errors (often just user typos or temporary issues)
          console.warn(
            "Location search failed (likely user typo or temporary issue):",
            error
          );
        }
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setShowSuggestions(true);

    if (text.trim()) {
      setLoading(true);
      debouncedSearchPlaces(text);
    } else {
      setSuggestions([]);
      setLoading(false);
    }

    // If user is typing freely, clear coordinates
    onLocationSelect(text);
  };

  const handleSuggestionSelect = async (suggestion: PlaceResult) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);

    try {
      const details = await locationService.getPlaceDetails(
        suggestion.place_id
      );
      if (details) {
        onLocationSelect(
          details.formatted_address,
          details.coordinates.latitude,
          details.coordinates.longitude
        );
      } else {
        // Fallback to just the address without coordinates
        onLocationSelect(suggestion.description);
      }
    } catch (error) {
      console.error("Error getting place details:", error);
      // Still use the selected address
      onLocationSelect(suggestion.description);
    }
  };

  // const getCurrentLocation = async () => {
  //   try {
  //     setLoading(true);
  //     const coordinates = await locationService.getCurrentLocation();
  //     if (coordinates) {
  //       // Try Google reverse geocoding first, then fallback to Expo
  //       let address = null;

  //       try {
  //         address = await locationService.reverseGeocode(coordinates);
  //       } catch (error) {
  //         console.warn(
  //           "Google reverse geocoding failed, trying fallback:",
  //           error
  //         );
  //         address = await locationService.fallbackReverseGeocode(coordinates);
  //       }

  //       if (address) {
  //         setInputValue(address);
  //         onLocationSelect(
  //           address,
  //           coordinates.latitude,
  //           coordinates.longitude
  //         );
  //       } else {
  //         console.warn("Could not determine address from current location");
  //       }
  //     } else {
  //       console.warn(
  //         "Could not get current location - location services may be disabled"
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Current location error:", error);
  //     // Don't show alert - user can still enter address manually
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const hideSuggestions = () => {
    // Small delay to allow tap on suggestion
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <View className="relative">
      <View className="relative">
        <TextInput
          className={`bg-gray-50/80 border border-gray-300 rounded-2xl px-5 py-4 pr-12 text-gray-800 font-medium ${className}`}
          placeholder={placeholder}
          value={inputValue}
          onChangeText={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={hideSuggestions}
          maxLength={200}
          placeholderTextColor="#9ca3af"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!disabled}
        />
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-48">
          <ScrollView
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            scrollEventThrottle={16}
            bounces={false}
            directionalLockEnabled={true}
          >
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={item.place_id}
                className={`px-4 py-3 border-gray-100 ${
                  index < suggestions.length - 1 ? "border-b" : ""
                }`}
                onPress={() => handleSuggestionSelect(item)}
                activeOpacity={0.7}
                delayPressIn={0}
              >
                <View className="flex-row items-center">
                  <MaterialIcons name="location-on" size={16} color="#6b7280" />
                  <Text
                    className="flex-1 text-gray-800 ml-3 text-sm"
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
