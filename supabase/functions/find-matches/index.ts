import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchRequest {
  helpRequestId?: string;
  volunteerId?: string;
  radius?: number; // km radius for nearby pincodes (optional)
}

interface Match {
  helpRequest: any;
  volunteers: any[];
  matchScore: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { helpRequestId, volunteerId, radius = 50 } = await req.json() as MatchRequest;

    console.log("Finding matches with params:", { helpRequestId, volunteerId, radius });

    let matches: Match[] = [];

    if (helpRequestId) {
      // Find volunteers for a specific help request
      const { data: helpRequest, error: requestError } = await supabase
        .from("help_requests")
        .select("*")
        .eq("id", helpRequestId)
        .eq("status", "pending")
        .single();

      if (requestError) throw requestError;
      if (!helpRequest) {
        return new Response(
          JSON.stringify({ error: "Help request not found or not pending" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find matching volunteers
      const { data: volunteers, error: volunteersError } = await supabase
        .from("volunteer_applications")
        .select("*")
        .eq("status", "approved")
        .contains("categories", [helpRequest.category]);

      if (volunteersError) throw volunteersError;

      // Filter by location if pincode is available
      const matchedVolunteers = volunteers?.filter(v => {
        if (helpRequest.pincode && v.pincode) {
          // Exact pincode match
          return v.pincode === helpRequest.pincode;
        }
        // Location match (district level)
        return v.location.toLowerCase().includes(helpRequest.location.toLowerCase()) ||
               helpRequest.location.toLowerCase().includes(v.location.toLowerCase());
      }) || [];

      matches = [{
        helpRequest,
        volunteers: matchedVolunteers,
        matchScore: matchedVolunteers.length > 0 ? 100 : 0
      }];

      console.log(`Found ${matchedVolunteers.length} volunteers for help request ${helpRequestId}`);
    } else if (volunteerId) {
      // Find help requests for a specific volunteer
      const { data: volunteer, error: volunteerError } = await supabase
        .from("volunteer_applications")
        .select("*")
        .eq("id", volunteerId)
        .eq("status", "approved")
        .single();

      if (volunteerError) throw volunteerError;
      if (!volunteer) {
        return new Response(
          JSON.stringify({ error: "Volunteer not found or not approved" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find matching help requests
      const { data: helpRequests, error: requestsError } = await supabase
        .from("help_requests")
        .select("*")
        .eq("status", "pending")
        .in("category", volunteer.categories);

      if (requestsError) throw requestsError;

      // Filter by location
      const matchedRequests = helpRequests?.filter(hr => {
        if (volunteer.pincode && hr.pincode) {
          return hr.pincode === volunteer.pincode;
        }
        return hr.location.toLowerCase().includes(volunteer.location.toLowerCase()) ||
               volunteer.location.toLowerCase().includes(hr.location.toLowerCase());
      }) || [];

      matches = matchedRequests.map(hr => ({
        helpRequest: hr,
        volunteers: [volunteer],
        matchScore: 100
      }));

      console.log(`Found ${matchedRequests.length} help requests for volunteer ${volunteerId}`);
    } else {
      // Find all possible matches
      const { data: pendingRequests, error: requestsError } = await supabase
        .from("help_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      const { data: approvedVolunteers, error: volunteersError } = await supabase
        .from("volunteer_applications")
        .select("*")
        .eq("status", "approved");

      if (volunteersError) throw volunteersError;

      // Match each request with volunteers
      matches = pendingRequests?.map(request => {
        const matchedVolunteers = approvedVolunteers?.filter(v => {
          const categoryMatch = v.categories.includes(request.category);
          const locationMatch = request.pincode && v.pincode
            ? v.pincode === request.pincode
            : v.location.toLowerCase().includes(request.location.toLowerCase()) ||
              request.location.toLowerCase().includes(v.location.toLowerCase());
          
          return categoryMatch && locationMatch;
        }) || [];

        return {
          helpRequest: request,
          volunteers: matchedVolunteers,
          matchScore: matchedVolunteers.length > 0 ? 100 : 0
        };
      }).filter(m => m.volunteers.length > 0) || [];

      console.log(`Found ${matches.length} total matches`);
    }

    return new Response(
      JSON.stringify({ matches, total: matches.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in find-matches function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
