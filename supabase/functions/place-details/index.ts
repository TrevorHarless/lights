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

    const { place_id } = await req.json()

    if (!place_id) {
      throw new Error('place_id is required')
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=formatted_address,geometry&key=${GOOGLE_API_KEY}`
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message)
      throw new Error(`Google Places API error: ${data.status}`)
    }

    const result = data.result
    const locationData = {
      formatted_address: result.formatted_address,
      coordinates: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      },
      place_id: place_id,
    }

    return new Response(
      JSON.stringify(locationData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in place-details function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})