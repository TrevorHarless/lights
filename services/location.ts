import * as Location from 'expo-location';
import { supabase } from '~/lib/supabase';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface PlaceResult {
  description: string;
  place_id: string;
  coordinates?: LocationCoordinates;
}

export interface GeocodeResult {
  formatted_address: string;
  coordinates: LocationCoordinates;
  place_id: string;
}

class LocationService {
  private supabaseUrl: string;

  constructor() {
    this.supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
    console.log('LocationService initialized. Using Supabase Edge Functions for Google APIs.');
  }

  /**
   * Get user's current location coordinates
   */
  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Search for places using Supabase Edge Function
   */
  async searchPlaces(query: string): Promise<PlaceResult[]> {
    if (query.length < 3) {
      return [];
    }

    try {
      const { data, error } = await supabase.functions.invoke('places-autocomplete', {
        body: { query }
      });

      if (error) {
        console.error('Places autocomplete error:', error);
        throw new Error(`Places search failed: ${error.message}`);
      }

      return data.predictions || [];
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  /**
   * Get detailed place information including coordinates using Supabase Edge Function
   */
  async getPlaceDetails(placeId: string): Promise<GeocodeResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke('place-details', {
        body: { place_id: placeId }
      });

      if (error) {
        console.error('Place details error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Geocode an address string to coordinates using Supabase Edge Function
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke('geocode', {
        body: { address }
      });

      if (error) {
        console.error('Geocoding error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address using Supabase Edge Function
   */
  async reverseGeocode(coordinates: LocationCoordinates): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('reverse-geocode', {
        body: { 
          latitude: coordinates.latitude, 
          longitude: coordinates.longitude 
        }
      });

      if (error) {
        console.error('Reverse geocoding error:', error);
        return null;
      }

      return data.formatted_address;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Fallback geocoding using Expo Location (less accurate, no autocomplete)
   */
  async fallbackGeocode(address: string): Promise<LocationCoordinates | null> {
    try {
      const geocoded = await Location.geocodeAsync(address);
      if (geocoded.length > 0) {
        return {
          latitude: geocoded[0].latitude,
          longitude: geocoded[0].longitude,
        };
      }
      return null;
    } catch (error) {
      console.error('Error with fallback geocoding:', error);
      return null;
    }
  }

  /**
   * Fallback reverse geocoding using Expo Location
   */
  async fallbackReverseGeocode(coordinates: LocationCoordinates): Promise<string | null> {
    try {
      const result = await Location.reverseGeocodeAsync(coordinates);
      if (result.length > 0) {
        const address = result[0];
        return [
          address.streetNumber,
          address.street,
          address.city,
          address.region,
          address.postalCode,
        ]
          .filter(Boolean)
          .join(', ');
      }
      return null;
    } catch (error) {
      console.error('Error with fallback reverse geocoding:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();