# Location Feature Setup Guide

This guide explains how to set up and use the location functionality in the lights-app project.

## Overview

The location feature provides:
- **Address autocomplete** using Google Places API
- **Geocoding** to convert addresses to coordinates (latitude/longitude)
- **Current location detection** with reverse geocoding
- **Fallback support** using Expo Location when Google APIs are unavailable

## Setup Instructions

### 1. Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API (New)**
   - **Places API**
   - **Geocoding API**
4. Create credentials (API Key)
5. Restrict the API key to your app's bundle ID for security

### 2. Configure Environment Variables

1. Copy your Google Places API key
2. Add it to your `.env` file:
   ```bash
   EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   ```

### 3. Database Schema Updates

The location feature adds two new optional fields to your project schema:
- `latitude` (number) - Latitude coordinate
- `longitude` (number) - Longitude coordinate

Make sure your backend/database supports these fields.

## Features

### Address Autocomplete
- Type in any address field and get real-time suggestions
- Powered by Google Places API
- Automatically selects coordinates when a suggestion is chosen

### Current Location
- Tap the location icon (📍) to use your current location
- Requires location permissions
- Automatically reverse geocodes coordinates to a readable address

### Fallback Support
- If Google API key is not configured, manual address entry still works
- Uses Expo Location for basic geocoding as fallback
- Graceful degradation - no crashes if APIs are unavailable

## Usage in Components

The `LocationInput` component can be used anywhere you need address input:

```tsx
import LocationInput from '~/components/LocationInput';

function MyForm() {
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();

  const handleLocationSelect = (address: string, lat?: number, lng?: number) => {
    setAddress(address);
    setLatitude(lat);
    setLongitude(lng);
  };

  return (
    <LocationInput
      value={address}
      onLocationSelect={handleLocationSelect}
      placeholder="Enter address"
    />
  );
}
```

## Future Map Integration

The stored latitude/longitude coordinates are designed to prepare for future map features:
- **Project pins on map** - Show all projects as pins on a map view
- **Geographic search** - Filter projects by location/distance
- **Route planning** - Plan routes between multiple project locations

## Troubleshooting

### REQUEST_DENIED Error (Most Common Issue)

This error typically occurs due to API key configuration issues:

#### 1. Check API Key Setup
```bash
# Verify your .env file contains:
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyC-your-actual-key-here
```

#### 2. Restart Development Server
After adding/changing the API key:
```bash
# Kill the current server and restart
npx expo start --clear
```

#### 3. Verify API Key Format
- Must start with `AIza`
- Should be 39 characters long
- No spaces or extra characters

#### 4. Check Google Cloud Console Settings

**Required APIs to Enable:**
- Places API (Legacy)
- Places API (New) 
- Geocoding API

**API Key Restrictions:**
- **Application restrictions**: Set to "None" for testing, then restrict to your bundle ID
- **API restrictions**: Enable only the APIs you need (Places, Geocoding)

#### 5. Billing Account
- Google requires a billing account even for free tier usage
- Enable billing in Google Cloud Console
- You won't be charged unless you exceed free limits

### Debug Steps

#### Temporary Debug Component
Add this to any screen to test your API configuration:

```tsx
import LocationDebug from '~/components/LocationDebug';

// Add to your component JSX:
<LocationDebug />
```

#### Check Console Logs
Look for these messages in your development console:
```
LocationService initialized. API key configured: true
API key starts with: AIzaSyC...
Making Places API request to: https://maps.googleapis.com/...
Places API response status: OK
```

### Other Common Issues

#### Address Autocomplete Not Working
- ✅ API key correctly set in `.env`
- ✅ Development server restarted after adding key
- ✅ Places API enabled in Google Cloud Console
- ✅ Network connectivity working
- ✅ Billing account enabled

#### Location Permission Issues
- The app will request location permissions when needed
- Users can still enter addresses manually if they deny location access
- Check device location services are enabled

#### API Quota Exceeded
- Google Places API has usage limits (free tier: $200/month credit)
- Monitor your usage in Google Cloud Console
- Consider implementing caching for frequently accessed locations

#### Network/CORS Issues
- Places API should work from mobile apps without CORS issues
- If testing on web, you may need to configure API key restrictions
- Check if you're behind a corporate firewall blocking Google APIs

## Cost Considerations

Google Places API charges per request:
- **Autocomplete requests**: ~$2.83 per 1,000 requests
- **Place Details requests**: ~$17 per 1,000 requests
- **Geocoding requests**: ~$5 per 1,000 requests

To minimize costs:
- The autocomplete is debounced (300ms delay)
- Only searches when 3+ characters are entered
- Uses caching where possible

## Privacy

- Location data is only collected when explicitly requested by user
- Coordinates are stored locally and in your backend
- No location data is shared with third parties beyond Google for geocoding