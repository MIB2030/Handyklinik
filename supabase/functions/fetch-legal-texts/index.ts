import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

interface LegalTextRequest {
  type: 'impressum' | 'datenschutz' | 'agb';
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing');
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: config, error: configError } = await supabase
      .from('legal_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (configError) {
      console.error('Error fetching config:', configError);
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!config || !config.enabled || !config.api_url || !config.api_token || !config.shop_id) {
      console.log('Legal API not configured - Edge Function returning 404');
      return new Response(
        JSON.stringify({
          error: 'API not configured',
          message: 'Legal API credentials are not set up',
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const apiUrl = config.api_url;
    const apiToken = config.api_token;
    const shopId = config.shop_id;

    const url = new URL(req.url);
    const textType = url.searchParams.get('type') || 'impressum';

    const endpointMap: Record<string, string> = {
      impressum: 'impressum',
      datenschutz: 'datenschutz',
      agb: 'agb',
    };

    const endpoint = endpointMap[textType] || 'impressum';

    const kanzleiUrl = new URL(`${apiUrl}/rechtstexte/${endpoint}`);
    kanzleiUrl.searchParams.append('shop_id', shopId);

    console.log(`Fetching legal text: ${endpoint} for shop ${shopId}`);

    const response = await fetch(kanzleiUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`IT-Recht Kanzlei API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({
          error: `API request failed: ${response.status}`,
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();

    const content = data.content || data.text || data.html || data.rechtstext || '';
    const lastUpdated = data.lastUpdated || data.updated_at || data.datum || new Date().toISOString();

    return new Response(
      JSON.stringify({
        content,
        lastUpdated,
        type: endpoint,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
        },
      }
    );
  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});