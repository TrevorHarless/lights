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

    const { latitude, longitude } = await req.json()

    if (!latitude || !longitude) {
      throw new Error('latitude and longitude are required')
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' || data.results.length === 0) {
      console.error('Google Reverse Geocoding API error:', data.status, data.error_message)
      throw new Error(`Reverse geocoding failed: ${data.status}`)
    }

    const formatted_address = data.results[0].formatted_address

    return new Response(
      JSON.stringify({ formatted_address }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in reverse-geocode function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})