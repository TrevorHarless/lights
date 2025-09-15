import * as Location from 'expo-location';

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
  private googleApiKey: string | null = null;

  constructor() {
    // In a real app, you'd store this in env variables
    // For now, we'll use a placeholder - you'll need to add your Google API key
    this.googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || null;
    console.log('LocationService initialized. API key configured:', !!this.googleApiKey);
    if (this.googleApiKey) {
      console.log('API key starts with:', this.googleApiKey.substring(0, 10) + '...');
    }
  }

  /**
   * Set Google Places API key
   */
  setApiKey(apiKey: string) {
    this.googleApiKey = apiKey;
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
   * Search for places using Google Places Autocomplete API
   */
  async searchPlaces(query: string): Promise<PlaceResult[]> {
    if (!this.googleApiKey) {
      throw new Error('Google Places API key not configured');
    }

    if (query.length < 3) {
      return [];
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${this.googleApiKey}&types=address`;
      console.log('Making Places API request to:', url.replace(this.googleApiKey, 'API_KEY_HIDDEN'));
      
      const response = await fetch(url);
      const data = await response.json();

      console.log('Places API response status:', data.status);
      if (data.error_message) {
        console.log('Places API error message:', data.error_message);
      }

      if (data.status !== 'OK') {
        let errorMessage = `Google Places API error: ${data.status}`;
        if (data.error_message) {
          errorMessage += ` - ${data.error_message}`;
        }
        throw new Error(errorMessage);
      }

      return data.predictions.map((prediction: any) => ({
        description: prediction.description,
        place_id: prediction.place_id,
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  /**
   * Get detailed place information including coordinates using Place Details API
   */
  async getPlaceDetails(placeId: string): Promise<GeocodeResult | null> {
    if (!this.googleApiKey) {
      throw new Error('Google Places API key not configured');
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry&key=${this.googleApiKey}`
      );

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const result = data.result;
      return {
        formatted_address: result.formatted_address,
        coordinates: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        place_id: placeId,
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Geocode an address string to coordinates using Google Geocoding API
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!this.googleApiKey) {
      throw new Error('Google Places API key not configured');
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.googleApiKey}`
      );

      const data = await response.json();

      if (data.status !== 'OK' || data.results.length === 0) {
        throw new Error(`Geocoding failed: ${data.status}`);
      }

      const result = data.results[0];
      return {
        formatted_address: result.formatted_address,
        coordinates: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        place_id: result.place_id,
      };
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address using Google Geocoding API
   */
  async reverseGeocode(coordinates: LocationCoordinates): Promise<string | null> {
    if (!this.googleApiKey) {
      throw new Error('Google Places API key not configured');
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${this.googleApiKey}`
      );

      const data = await response.json();

      if (data.status !== 'OK' || data.results.length === 0) {
        throw new Error(`Reverse geocoding failed: ${data.status}`);
      }

      return data.results[0].formatted_address;
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