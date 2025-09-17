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

    const { query } = await req.json()

    if (!query || query.length < 3) {
      return new Response(
        JSON.stringify({ predictions: [] }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&types=address`
    
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message)
      throw new Error(`Google Places API error: ${data.status}`)
    }

    // Transform the response to match our client interface
    const results = data.predictions.map((prediction: any) => ({
      description: prediction.description,
      place_id: prediction.place_id,
    }))

    return new Response(
      JSON.stringify({ predictions: results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in places-autocomplete function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})