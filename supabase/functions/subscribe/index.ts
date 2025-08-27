import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscribeRequest {
  email?: string;
  phone?: string;
  selectedDistricts: string[];
  mode: 'realtime' | 'daily';
  consentCheckbox: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phone, selectedDistricts, mode, consentCheckbox }: SubscribeRequest = await req.json();
    
    console.log('Subscribe request:', { email, phone: phone ? '[REDACTED]' : undefined, selectedDistricts, mode });

    // Validation
    if (!email && !phone) {
      return new Response(
        JSON.stringify({ error: 'Email or phone required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!consentCheckbox) {
      return new Response(
        JSON.stringify({ error: 'Consent required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!selectedDistricts || selectedDistricts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one district required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create subscriber record
    const { data: subscriber, error: subscriberError } = await supabase
      .from('subscribers')
      .insert({
        email: email || null,
        phone_e164: phone || null,
        consent_checkbox_at: new Date().toISOString(),
        email_confirmed_at: email ? new Date().toISOString() : null, // Auto-confirm email for MVP
        sms_confirmed_at: null // SMS requires confirmation
      })
      .select()
      .single();

    if (subscriberError) {
      console.error('Error creating subscriber:', subscriberError);
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create district subscriptions
    const districtInserts = selectedDistricts.map(districtCode => {
      const chamber = districtCode.startsWith('H') ? 'house' : 'senate';
      return {
        subscriber_id: subscriber.id,
        chamber,
        district_code: districtCode,
        added_via: 'exact'
      };
    });

    const { error: districtsError } = await supabase
      .from('subscriber_districts')
      .insert(districtInserts);

    if (districtsError) {
      console.error('Error creating district subscriptions:', districtsError);
      // Clean up subscriber if districts failed
      await supabase.from('subscribers').delete().eq('id', subscriber.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create district subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification preferences
    const { error: prefsError } = await supabase
      .from('notification_preferences')
      .insert({
        subscriber_id: subscriber.id,
        mode,
        quiet_hours: JSON.stringify({
          start: "22:00",
          end: "07:00", 
          tz: "America/Denver"
        })
      });

    if (prefsError) {
      console.error('Error creating preferences:', prefsError);
    }

    // TODO: Send SMS confirmation if phone provided
    // For MVP, we'll simulate this
    if (phone) {
      console.log(`Would send SMS confirmation to ${phone}`);
      // In production: Call SMS service with confirmation link
    }

    const response = {
      success: true,
      subscriber_id: subscriber.id,
      confirmation_needed: !!phone
    };

    console.log('Subscribe success:', response);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in subscribe function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});