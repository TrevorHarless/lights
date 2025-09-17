# Supabase Edge Functions Setup Guide

This guide explains how to deploy and configure the Google API Edge Functions for secure API key handling.

## Overview

The Google Places/Maps API calls have been moved to secure Supabase Edge Functions to prevent API key exposure in the client bundle. This provides better security and API key protection.

## Edge Functions Created

1. **places-autocomplete** - Handles Google Places Autocomplete API
2. **place-details** - Handles Google Places Details API  
3. **geocode** - Handles Google Geocoding API
4. **reverse-geocode** - Handles Google Reverse Geocoding API

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. Supabase project set up
3. Google Cloud Console project with Maps/Places APIs enabled
4. Google Places API key

## Deployment Steps

### 1. Initialize Supabase (if not already done)

```bash
supabase login
supabase init
supabase link --project-ref YOUR_PROJECT_REF
```

### 2. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy places-autocomplete
supabase functions deploy place-details  
supabase functions deploy geocode
supabase functions deploy reverse-geocode

# Or deploy all at once
supabase functions deploy
```

### 3. Set Google API Key as Secret

In your Supabase Dashboard:
1. Go to **Settings** → **Edge Functions** → **Secrets**
2. Add a new secret:
   - **Name**: `GOOGLE_PLACES_API_KEY`
   - **Value**: Your actual Google Places API key (starts with `AIza...`)

Or via CLI:
```bash
supabase secrets set GOOGLE_PLACES_API_KEY=your_actual_google_api_key_here
```

### 4. Configure Google Cloud Console

Ensure your Google API key has the following APIs enabled:
- Places API (New)
- Places API
- Geocoding API

Set appropriate restrictions on your API key:
- **Application restrictions**: None (for server-to-server calls)
- **API restrictions**: Limit to the specific APIs listed above

## Testing

1. Use the LocationDebug component in your app to test the functions
2. Check Supabase Edge Functions logs for any errors:
   ```bash
   supabase functions logs places-autocomplete
   ```

## Local Development

To test functions locally:

```bash
# Start local Supabase
supabase start

# Set local secret
supabase secrets set --local GOOGLE_PLACES_API_KEY=your_api_key

# Deploy functions locally  
supabase functions deploy --local places-autocomplete
```

## Security Benefits

✅ **Before**: API key exposed in client bundle (EXPO_PUBLIC_GOOGLE_PLACES_API_KEY)
✅ **After**: API key secured on server-side in Supabase Edge Functions

- API key never exposed to client
- Server-to-server API calls only
- Centralized API usage monitoring
- Better rate limiting control
- Enhanced security posture

## Troubleshooting

### Function Not Found
- Ensure functions are deployed: `supabase functions list`
- Check project linking: `supabase projects list`

### API Key Issues  
- Verify secret is set: Check Supabase Dashboard → Settings → Edge Functions → Secrets
- Ensure Google APIs are enabled in Google Cloud Console
- Check API key restrictions

### CORS Errors
- Functions include proper CORS headers
- Ensure Supabase URL is correct in client

## Migration Notes

The client-side LocationService has been updated to use Edge Functions instead of direct Google API calls. The public interface remains the same, so existing code should continue to work without changes.

Remove any `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` from your environment variables as it's no longer needed.