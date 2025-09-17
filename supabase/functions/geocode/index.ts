import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!GOOGLE_API_KEY) {
      throw new Error('Google Places API key not configured')
    }

    const { address } = await req.json()

    if (!address) {
      throw new Error('address is required')
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' || data.results.length === 0) {
      console.error('Google Geocoding API error:', data.status, data.error_message)
      throw new Error(`Geocoding failed: ${data.status}`)
    }

    const result = data.results[0]
    const locationData = {
      formatted_address: result.formatted_address,
      coordinates: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      },
      place_id: result.place_id,
    }

    return new Response(
      JSON.stringify(locationData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in geocode function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})