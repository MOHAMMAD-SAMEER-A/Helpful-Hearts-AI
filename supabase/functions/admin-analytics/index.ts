import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsResponse {
  overview: {
    totalHelpRequests: number;
    pendingRequests: number;
    completedRequests: number;
    totalVolunteers: number;
    approvedVolunteers: number;
    pendingVolunteers: number;
  };
  requestsByCategory: { category: string; count: number }[];
  requestsByLocation: { location: string; count: number }[];
  volunteersByLocation: { location: string; count: number }[];
  recentActivity: {
    recentRequests: any[];
    recentVolunteers: any[];
  };
  matchingStats: {
    requestsWithMatches: number;
    requestsWithoutMatches: number;
    averageVolunteersPerRequest: number;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user is admin or moderator
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdmin = roles?.some(r => r.role === "admin" || r.role === "moderator");
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching analytics for admin user:", user.id);

    // Fetch all data in parallel
    const [
      { data: helpRequests },
      { data: volunteers },
      { data: approvedVolunteers },
    ] = await Promise.all([
      supabase.from("help_requests").select("*"),
      supabase.from("volunteer_applications").select("*"),
      supabase.from("volunteer_applications").select("*").eq("status", "approved"),
    ]);

    // Calculate overview statistics
    const pendingRequests = helpRequests?.filter(r => r.status === "pending") || [];
    const completedRequests = helpRequests?.filter(r => r.status === "completed") || [];
    const pendingVolunteers = volunteers?.filter(v => v.status === "pending") || [];

    // Calculate requests by category
    const categoryMap = new Map<string, number>();
    helpRequests?.forEach(r => {
      categoryMap.set(r.category, (categoryMap.get(r.category) || 0) + 1);
    });
    const requestsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));

    // Calculate requests by location
    const requestLocationMap = new Map<string, number>();
    helpRequests?.forEach(r => {
      requestLocationMap.set(r.location, (requestLocationMap.get(r.location) || 0) + 1);
    });
    const requestsByLocation = Array.from(requestLocationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate volunteers by location
    const volunteerLocationMap = new Map<string, number>();
    approvedVolunteers?.forEach(v => {
      volunteerLocationMap.set(v.location, (volunteerLocationMap.get(v.location) || 0) + 1);
    });
    const volunteersByLocation = Array.from(volunteerLocationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate matching statistics
    let requestsWithMatches = 0;
    let totalMatches = 0;

    pendingRequests.forEach(request => {
      const matches = approvedVolunteers?.filter(v => {
        const categoryMatch = v.categories.includes(request.category);
        const locationMatch = request.pincode && v.pincode
          ? v.pincode === request.pincode
          : v.location.toLowerCase().includes(request.location.toLowerCase()) ||
            request.location.toLowerCase().includes(v.location.toLowerCase());
        return categoryMatch && locationMatch;
      }) || [];
      
      if (matches.length > 0) {
        requestsWithMatches++;
        totalMatches += matches.length;
      }
    });

    const analytics: AnalyticsResponse = {
      overview: {
        totalHelpRequests: helpRequests?.length || 0,
        pendingRequests: pendingRequests.length,
        completedRequests: completedRequests.length,
        totalVolunteers: volunteers?.length || 0,
        approvedVolunteers: approvedVolunteers?.length || 0,
        pendingVolunteers: pendingVolunteers.length,
      },
      requestsByCategory,
      requestsByLocation,
      volunteersByLocation,
      recentActivity: {
        recentRequests: helpRequests?.slice(0, 5) || [],
        recentVolunteers: volunteers?.slice(0, 5) || [],
      },
      matchingStats: {
        requestsWithMatches,
        requestsWithoutMatches: pendingRequests.length - requestsWithMatches,
        averageVolunteersPerRequest: pendingRequests.length > 0
          ? Math.round(totalMatches / pendingRequests.length * 10) / 10
          : 0,
      },
    };

    console.log("Analytics calculated successfully:", {
      totalRequests: analytics.overview.totalHelpRequests,
      totalVolunteers: analytics.overview.totalVolunteers,
    });

    return new Response(
      JSON.stringify(analytics),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in admin-analytics function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
