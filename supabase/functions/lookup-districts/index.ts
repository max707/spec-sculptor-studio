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

// Wyoming ZIP code to district mapping (simplified for MVP)
const zipToDistrictMap: Record<string, { house: string[]; senate: string[] }> = {
  '82001': { house: ['07'], senate: ['04'] }, // Cheyenne
  '82002': { house: ['08'], senate: ['04'] }, // Cheyenne
  '82003': { house: ['09'], senate: ['05'] }, // Cheyenne
  '82004': { house: ['06'], senate: ['03'] }, // Cheyenne
  '82005': { house: ['05'], senate: ['03'] }, // Cheyenne
  '82006': { house: ['04'], senate: ['02'] }, // Cheyenne
  '82007': { house: ['10'], senate: ['05'] }, // Cheyenne
  '82009': { house: ['11'], senate: ['06'] }, // Cheyenne
  '82010': { house: ['12'], senate: ['06'] }, // Cheyenne
  '82070': { house: ['13'], senate: ['07'] }, // Burns
  '82071': { house: ['14'], senate: ['07'] }, // Carpenter
  '82072': { house: ['01'], senate: ['01'] }, // Albin
  '82073': { house: ['02'], senate: ['01'] }, // Granite Canyon
  '82081': { house: ['15'], senate: ['08'] }, // Laramie
  '82082': { house: ['16'], senate: ['09'] }, // Laramie
  '82083': { house: ['17'], senate: ['09'] }, // Laramie
  '82190': { house: ['18'], senate: ['10'] }, // Medicine Bow
  '82414': { house: ['19'], senate: ['11'] }, // Cody
  '82602': { house: ['20'], senate: ['12'] }, // Casper
  '82604': { house: ['21'], senate: ['13'] }, // Casper
  '82605': { house: ['22'], senate: ['13'] }, // Casper
  '82609': { house: ['23'], senate: ['14'] }, // Casper
  '82716': { house: ['24'], senate: ['15'] }, // Gillette
  '82717': { house: ['25'], senate: ['15'] }, // Gillette
  '82718': { house: ['26'], senate: ['16'] }, // Gillette
};

// Basic address parsing for Wyoming cities
function parseAddress(address: string): { city?: string; zip?: string } {
  const normalizedAddress = address.toLowerCase().trim();
  
  // Extract ZIP code if present
  const zipMatch = normalizedAddress.match(/\b(\d{5})\b/);
  const zip = zipMatch ? zipMatch[1] : undefined;
  
  // Simple city detection
  let city: string | undefined;
  if (normalizedAddress.includes('cheyenne')) city = 'cheyenne';
  else if (normalizedAddress.includes('casper')) city = 'casper';
  else if (normalizedAddress.includes('laramie')) city = 'laramie';
  else if (normalizedAddress.includes('gillette')) city = 'gillette';
  else if (normalizedAddress.includes('rock springs')) city = 'rock springs';
  else if (normalizedAddress.includes('sheridan')) city = 'sheridan';
  else if (normalizedAddress.includes('green river')) city = 'green river';
  else if (normalizedAddress.includes('evanston')) city = 'evanston';
  else if (normalizedAddress.includes('riverton')) city = 'riverton';
  else if (normalizedAddress.includes('jackson')) city = 'jackson';
  else if (normalizedAddress.includes('cody')) city = 'cody';
  else if (normalizedAddress.includes('powell')) city = 'powell';
  else if (normalizedAddress.includes('worland')) city = 'worland';
  else if (normalizedAddress.includes('torrington')) city = 'torrington';
  else if (normalizedAddress.includes('douglas')) city = 'douglas';
  else if (normalizedAddress.includes('wheatland')) city = 'wheatland';
  else if (normalizedAddress.includes('newcastle')) city = 'newcastle';
  else if (normalizedAddress.includes('buffalo')) city = 'buffalo';
  else if (normalizedAddress.includes('rawlins')) city = 'rawlins';
  
  return { city, zip };
}

// City to district mapping for basic address lookup
const cityToDistrictMap: Record<string, { house: string[]; senate: string[] }> = {
  'cheyenne': { house: ['04', '05', '06', '07', '08', '09', '10'], senate: ['02', '03', '04', '05'] },
  'casper': { house: ['28', '29', '30', '31'], senate: ['26', '27', '28'] },
  'laramie': { house: ['13', '14'], senate: ['09'] },
  'gillette': { house: ['53', '54', '55'], senate: ['24'] },
  'rock springs': { house: ['18', '19'], senate: ['12'] },
  'sheridan': { house: ['25', '26'], senate: ['20'] },
  'green river': { house: ['20'], senate: ['12'] },
  'evanston': { house: ['16'], senate: ['11'] },
  'riverton': { house: ['33'], senate: ['17'] },
  'jackson': { house: ['15'], senate: ['17'] },
  'cody': { house: ['21'], senate: ['19'] },
  'powell': { house: ['22'], senate: ['19'] },
  'worland': { house: ['23'], senate: ['15'] },
  'torrington': { house: ['01'], senate: ['01'] },
  'douglas': { house: ['35'], senate: ['29'] },
  'wheatland': { house: ['02'], senate: ['01'] },
  'newcastle': { house: ['60'], senate: ['01'] },
  'buffalo': { house: ['56'], senate: ['24'] },
  'rawlins': { house: ['17'], senate: ['11'] }
};

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

    let exact: District[] = [];
    let possible: District[] = [];
    let explain = "";

    if (address) {
      const parsed = parseAddress(address);
      console.log('Parsed address:', parsed);
      
      // If we extracted a ZIP from the address, use it for exact lookup
      if (parsed.zip && zipToDistrictMap[parsed.zip]) {
        const districts = zipToDistrictMap[parsed.zip];
        exact = [
          ...districts.house.map(d => ({ chamber: 'house', district: d, type: 'exact' as const })),
          ...districts.senate.map(d => ({ chamber: 'senate', district: d, type: 'exact' as const }))
        ];
      }
      // Otherwise, use city for possible matches
      else if (parsed.city && cityToDistrictMap[parsed.city]) {
        const districts = cityToDistrictMap[parsed.city];
        possible = [
          ...districts.house.map(d => ({ chamber: 'house', district: d, type: 'possible' as const })),
          ...districts.senate.map(d => ({ chamber: 'senate', district: d, type: 'possible' as const }))
        ];
        explain = `Based on the city "${parsed.city}". Include your full address with ZIP code for an exact match.`;
      }
      // If no city or ZIP found, provide general guidance
      else {
        explain = "Could not determine districts from this address. Please include a Wyoming city name or ZIP code.";
      }
    } else if (zip) {
      // ZIP-only lookup
      if (zipToDistrictMap[zip]) {
        const districts = zipToDistrictMap[zip];
        exact = [
          ...districts.house.map(d => ({ chamber: 'house', district: d, type: 'exact' as const })),
          ...districts.senate.map(d => ({ chamber: 'senate', district: d, type: 'exact' as const }))
        ];
      } else {
        explain = "ZIP code not found in Wyoming legislative districts. Please verify the ZIP code is correct.";
      }
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