import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GooglePlacesReview {
  author_name: string;
  author_url?: string;
  language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface GooglePlacesResponse {
  result: {
    reviews: GooglePlacesReview[];
    rating?: number;
    user_ratings_total?: number;
  };
  status: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    let triggeredBy = 'manual';

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        triggeredBy = body.triggeredBy || 'manual';
      } catch {
        triggeredBy = 'manual';
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: settings, error: settingsError } = await supabase
      .from("google_settings")
      .select("api_key, place_id, auto_sync_enabled")
      .single();

    if (settingsError || !settings || !settings.api_key || !settings.place_id) {
      throw new Error("Google Places API nicht konfiguriert. Bitte konfiguriere die API-Einstellungen im Admin-Bereich unter 'Google Einstellungen'.");
    }

    if (triggeredBy === 'cron' && !settings.auto_sync_enabled) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Auto-Sync ist deaktiviert',
          skipped: true,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const GOOGLE_API_KEY = settings.api_key;
    const PLACE_ID = settings.place_id;

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${GOOGLE_API_KEY}&language=de`;
    
    const response = await fetch(url);
    const data: GooglePlacesResponse = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Google Places API Error: ${data.status}`);
    }

    const reviews = data.result?.reviews || [];
    let newReviewsCount = 0;
    let updatedReviewsCount = 0;

    for (const review of reviews) {
      const googleReviewId = `${PLACE_ID}_${review.time}`;

      const { data: existingReview } = await supabase
        .from("google_reviews")
        .select("id")
        .eq("google_review_id", googleReviewId)
        .maybeSingle();

      if (existingReview) {
        updatedReviewsCount++;
        continue;
      }

      const insertData = {
        google_review_id: googleReviewId,
        author_name: review.author_name,
        author_photo_url: review.profile_photo_url || null,
        rating: review.rating,
        text: review.text || null,
        time: new Date(review.time * 1000).toISOString(),
        relative_time_description: review.relative_time_description,
        is_visible: true,
        is_featured: review.rating === 5,
      };

      await supabase
        .from("google_reviews")
        .insert(insertData);
      newReviewsCount++;
    }

    await supabase.from("google_reviews_sync_log").insert({
      reviews_count: reviews.length,
      new_reviews_count: newReviewsCount,
      status: "success",
      triggered_by: triggeredBy,
    });

    if (triggeredBy === 'cron') {
      await supabase
        .from('google_settings')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', '00000000-0000-0000-0000-000000000001');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${newReviewsCount} neue und ${updatedReviewsCount} bereits vorhandene Bewertungen gefunden`,
        totalReviews: reviews.length,
        newReviews: newReviewsCount,
        updatedReviews: updatedReviewsCount,
        averageRating: data.result?.rating,
        totalRatings: data.result?.user_ratings_total,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    let triggeredBy = 'manual';

    try {
      const body = await req.json();
      triggeredBy = body.triggeredBy || 'manual';
    } catch {
      triggeredBy = 'manual';
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase.from("google_reviews_sync_log").insert({
        reviews_count: 0,
        new_reviews_count: 0,
        status: "error",
        error_message: error.message,
        triggered_by: triggeredBy,
      });
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});