import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  helpRequest: {
    id: string;
    name: string;
    email: string;
    category: string;
    location: string;
    pincode?: string;
    details: string;
  };
  volunteer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    pincode?: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { helpRequest, volunteer } = await req.json() as NotificationRequest;

    console.log("Sending match notifications for:", {
      helpRequestId: helpRequest.id,
      volunteerId: volunteer.id,
    });

    // Email to person requesting help
    const helpSeekerEmailResponse = await resend.emails.send({
      from: "Community Help <onboarding@resend.dev>",
      to: [helpRequest.email],
      subject: `Great News! A Helper is Available Near You 🤝`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Good News, ${helpRequest.name}!</h1>
          
          <p style="font-size: 16px; line-height: 1.6;">
            We found a volunteer who can help you with <strong>${helpRequest.category}</strong> in your area!
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin-top: 0;">Volunteer Information</h2>
            <p><strong>Name:</strong> ${volunteer.name}</p>
            <p><strong>Location:</strong> ${volunteer.location}${volunteer.pincode ? ` (${volunteer.pincode})` : ''}</p>
            <p><strong>Phone:</strong> ${volunteer.phone}</p>
            <p><strong>Email:</strong> ${volunteer.email}</p>
          </div>
          
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Your Request Details</h3>
            <p><strong>Category:</strong> ${helpRequest.category}</p>
            <p><strong>Location:</strong> ${helpRequest.location}${helpRequest.pincode ? ` (${helpRequest.pincode})` : ''}</p>
            <p><strong>Details:</strong> ${helpRequest.details}</p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            Please reach out to the volunteer directly to coordinate help. We're here to connect you, and we hope this helps!
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            With care,<br>
            <strong>Community Help Team</strong>
          </p>
        </div>
      `,
    });

    // Email to volunteer
    const volunteerEmailResponse = await resend.emails.send({
      from: "Community Help <onboarding@resend.dev>",
      to: [volunteer.email],
      subject: `New Help Request in Your Area 🙏`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Thank You for Being a Helper, ${volunteer.name}!</h1>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Someone in your area needs help with <strong>${helpRequest.category}</strong>. Your kindness can make a real difference!
          </p>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #92400e; margin-top: 0;">Help Request Details</h2>
            <p><strong>Name:</strong> ${helpRequest.name}</p>
            <p><strong>Location:</strong> ${helpRequest.location}${helpRequest.pincode ? ` (${helpRequest.pincode})` : ''}</p>
            <p><strong>Category:</strong> ${helpRequest.category}</p>
            <p><strong>Details:</strong> ${helpRequest.details}</p>
            <p><strong>Contact:</strong> ${helpRequest.email}</p>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46; margin-top: 0;">Next Steps</h3>
            <p>Please reach out to ${helpRequest.name} to:</p>
            <ol style="line-height: 1.8;">
              <li>Confirm your availability</li>
              <li>Discuss the specific help needed</li>
              <li>Coordinate a time and place to meet</li>
            </ol>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            Your willingness to help makes our community stronger. Thank you for being there when someone needs you!
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            With gratitude,<br>
            <strong>Community Help Team</strong>
          </p>
        </div>
      `,
    });

    console.log("Email sent to help seeker:", helpSeekerEmailResponse);
    console.log("Email sent to volunteer:", volunteerEmailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        helpSeekerEmailId: helpSeekerEmailResponse.data?.id,
        volunteerEmailId: volunteerEmailResponse.data?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-match-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
