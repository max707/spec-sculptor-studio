import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LookupRequest {
  address?: string;
  zip?: string;
}

interface District {
  chamber: string;
  district: string;
  type: 'exact' | 'possible';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, zip }: LookupRequest = await req.json();
    
    console.log('Lookup request:', { address, zip });

    if (!address && !zip) {
      return new Response(
        JSON.stringify({ error: 'Address or ZIP required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For the MVP, we'll implement a simplified version
    // In production, this would call Census Geocoder and ArcGIS APIs
    
    let exact: District[] = [];
    let possible: District[] = [];
    let explain = "";

    if (address) {
      // Address lookup - simulate exact match for now
      // In production: Census Geocoder -> lat/lon -> ArcGIS intersect
      exact = [
        { chamber: 'house', district: '01', type: 'exact' },
        { chamber: 'senate', district: '01', type: 'exact' }
      ];
    } else if (zip) {
      // ZIP lookup - simulate possible matches
      // In production: ZCTA polygon -> ArcGIS intersect
      possible = [
        { chamber: 'house', district: '01', type: 'possible' },
        { chamber: 'house', district: '02', type: 'possible' },
        { chamber: 'senate', district: '01', type: 'possible' }
      ];
      explain = "ZIP codes can cross districts. Enter a full address for an exact match.";
    }

    const response = {
      exact,
      possible,
      explain
    };

    console.log('Lookup response:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in lookup-districts function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});