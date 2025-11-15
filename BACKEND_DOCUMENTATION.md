# Backend Architecture Documentation

## Overview

Your application uses **Lovable Cloud** (powered by Supabase) for a complete, scalable backend infrastructure. This document explains the entire backend architecture, API endpoints, and how everything connects.

---

## 🏗️ Architecture Components

### 1. **Database (PostgreSQL)**

#### Tables

**`help_requests`** - Stores help requests from people needing assistance
- `id` (UUID, PK)
- `user_id` (UUID, FK to profiles)
- `name`, `email`, `phone` (TEXT)
- `location`, `pincode` (TEXT) - Location data
- `category` (TEXT) - Type of help needed
- `details` (TEXT) - Description
- `status` (TEXT) - 'pending', 'in_progress', 'completed'
- `created_at`, `updated_at` (TIMESTAMP)

**`volunteer_applications`** - Stores volunteer signups
- `id` (UUID, PK)
- `user_id` (UUID, FK to profiles)
- `name`, `email`, `phone` (TEXT)
- `location`, `pincode` (TEXT) - Location data
- `categories` (TEXT[]) - Array of help categories
- `availability`, `skills` (TEXT)
- `status` (TEXT) - 'pending', 'approved', 'rejected'
- `created_at`, `updated_at` (TIMESTAMP)

**`profiles`** - User profile information
- `id` (UUID, PK, FK to auth.users)
- `email`, `display_name`, `phone` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

**`user_roles`** - Role-based access control
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `role` (ENUM) - 'admin', 'moderator', 'user', 'volunteer'

#### Security (Row Level Security)

All tables have RLS policies ensuring:
- ✅ Users can only view/edit their own data
- ✅ Admins/moderators have full access
- ✅ Volunteers can view pending help requests
- ✅ Service role bypasses RLS for backend functions

---

### 2. **Authentication System**

#### Technology
- **JWT-based authentication** via Supabase Auth
- Session management with automatic token refresh
- Email/password authentication

#### Frontend Integration
```typescript
import { useAuth } from '@/hooks/useAuth';

// In your component
const { user, session, signUp, signIn, signOut } = useAuth();

// Sign up
await signUp(email, password, displayName);

// Sign in
await signIn(email, password);

// Sign out
await signOut();
```

#### Protected Routes
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

### 3. **Backend Functions (Edge Functions)**

Serverless API endpoints that automatically scale. All functions are deployed at:
`https://urkjqwisfnqytlqojpei.supabase.co/functions/v1/`

---

## 📡 API Endpoints

### 1. Find Matches (`/find-matches`)

**Purpose:** Match volunteers with help requests based on location and categories.

**Method:** `POST`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "helpRequestId": "uuid",      // Optional: Find volunteers for this request
  "volunteerId": "uuid",         // Optional: Find requests for this volunteer
  "radius": 50                   // Optional: Search radius in km (default: 50)
}
```

**Response:**
```json
{
  "matches": [
    {
      "helpRequest": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "category": "Food Assistance",
        "location": "Mumbai",
        "pincode": "400001",
        "details": "Need food for family"
      },
      "volunteers": [
        {
          "id": "uuid",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "phone": "9876543210",
          "location": "Mumbai",
          "pincode": "400001",
          "categories": ["Food Assistance", "Transportation"]
        }
      ],
      "matchScore": 100
    }
  ],
  "total": 1
}
```

**Frontend Usage:**
```typescript
import { supabase } from '@/integrations/supabase/client';

const findMatches = async (helpRequestId: string) => {
  const { data, error } = await supabase.functions.invoke('find-matches', {
    body: { helpRequestId }
  });
  
  if (error) throw error;
  return data;
};
```

**Matching Logic:**
1. **Category Match:** Volunteer categories include the help request category
2. **Location Match:** 
   - If pincodes available: Exact pincode match
   - Otherwise: District-level match (case-insensitive)
3. **Status Check:** Only matches pending requests with approved volunteers

---

### 2. Send Match Notification (`/send-match-notification`)

**Purpose:** Send email notifications when a volunteer is matched with a help request.

**Method:** `POST`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "helpRequest": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "category": "Food Assistance",
    "location": "Mumbai",
    "pincode": "400001",
    "details": "Need food for family"
  },
  "volunteer": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9876543210",
    "location": "Mumbai",
    "pincode": "400001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "helpSeekerEmailId": "resend-email-id-1",
  "volunteerEmailId": "resend-email-id-2"
}
```

**Frontend Usage:**
```typescript
const sendNotification = async (helpRequest: any, volunteer: any) => {
  const { data, error } = await supabase.functions.invoke('send-match-notification', {
    body: { helpRequest, volunteer }
  });
  
  if (error) throw error;
  return data;
};
```

**Email Templates:**
- **To Help Seeker:** Includes volunteer contact info and next steps
- **To Volunteer:** Includes help request details and how to coordinate

**Email Service:** Uses Resend (configured with `RESEND_API_KEY`)

---

### 3. Admin Analytics (`/admin-analytics`)

**Purpose:** Provide comprehensive analytics for admin dashboard.

**Method:** `GET`

**Authentication:** Required (Admin/Moderator role only)

**Response:**
```json
{
  "overview": {
    "totalHelpRequests": 150,
    "pendingRequests": 45,
    "completedRequests": 105,
    "totalVolunteers": 89,
    "approvedVolunteers": 67,
    "pendingVolunteers": 22
  },
  "requestsByCategory": [
    { "category": "Food Assistance", "count": 45 },
    { "category": "Transportation", "count": 32 },
    { "category": "Housing Support", "count": 28 }
  ],
  "requestsByLocation": [
    { "location": "Mumbai", "count": 38 },
    { "location": "Delhi", "count": 27 },
    { "location": "Bangalore", "count": 21 }
  ],
  "volunteersByLocation": [
    { "location": "Mumbai", "count": 25 },
    { "location": "Delhi", "count": 18 },
    { "location": "Bangalore", "count": 15 }
  ],
  "recentActivity": {
    "recentRequests": [...],  // Last 5 requests
    "recentVolunteers": [...]  // Last 5 volunteers
  },
  "matchingStats": {
    "requestsWithMatches": 38,
    "requestsWithoutMatches": 7,
    "averageVolunteersPerRequest": 2.5
  }
}
```

**Frontend Usage:**
```typescript
const getAnalytics = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const { data, error } = await supabase.functions.invoke('admin-analytics', {
    headers: {
      Authorization: `Bearer ${session?.access_token}`
    }
  });
  
  if (error) throw error;
  return data;
};
```

**Access Control:**
- Validates JWT token
- Checks user has 'admin' or 'moderator' role
- Returns 403 Forbidden if insufficient permissions

---

## 🔐 Security Features

### 1. Row Level Security (RLS)

Every table has RLS policies:
```sql
-- Users can view their own help requests
CREATE POLICY "Users can view their own help requests"
ON help_requests FOR SELECT
USING (auth.uid() = user_id);

-- Volunteers can view pending requests
CREATE POLICY "Volunteers can view help requests"
ON help_requests FOR SELECT
USING (has_role(auth.uid(), 'volunteer'));

-- Admins can view everything
CREATE POLICY "Admins can view all"
ON help_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'));
```

### 2. Input Validation

Frontend validation using Zod schemas:
```typescript
const helpRequestSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  // ... more fields
});
```

### 3. Authentication

All API endpoints (except public ones) require:
- Valid JWT token in `Authorization` header
- Token format: `Bearer <token>`
- Automatic token validation by Supabase

### 4. Environment Variables

Sensitive data stored as secrets:
- `SUPABASE_URL` - Database URL
- `SUPABASE_SERVICE_ROLE_KEY` - Admin access key
- `RESEND_API_KEY` - Email service key

---

## 🚀 Deployment

### Automatic Deployment

**Backend functions** deploy automatically when you:
1. Push code changes
2. No manual deployment needed
3. Changes are live immediately

**Frontend** requires:
1. Click "Update" in publish dialog
2. Custom domain configuration (optional)

### Environment Management

All secrets are managed through Lovable Cloud:
```typescript
// Access in edge functions
const apiKey = Deno.env.get('RESEND_API_KEY');

// Access in frontend (.env file, auto-generated)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

---

## 📊 Database Queries

### Frontend Direct Queries

```typescript
import { supabase } from '@/integrations/supabase/client';

// Fetch help requests
const { data, error } = await supabase
  .from('help_requests')
  .select('*')
  .eq('status', 'pending')
  .order('created_at', { ascending: false });

// Insert volunteer application
const { error } = await supabase
  .from('volunteer_applications')
  .insert({
    user_id: user.id,
    name,
    email,
    // ... other fields
  });

// Update status
const { error } = await supabase
  .from('help_requests')
  .update({ status: 'completed' })
  .eq('id', requestId);
```

### Backend Queries (Service Role)

```typescript
// In edge functions, use service role for admin access
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

// Bypass RLS
const { data } = await supabase
  .from('help_requests')
  .select('*');  // Can access all rows
```

---

## 🔧 Technology Stack

### Backend
- **Runtime:** Deno (TypeScript)
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth (JWT)
- **Email:** Resend
- **Hosting:** Lovable Cloud (auto-scaling)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Form Handling:** React Hook Form + Zod
- **State Management:** TanStack Query
- **Routing:** React Router v6

---

## 📝 Sample Integration

### Complete Workflow Example

```typescript
// 1. User submits help request (HelpForm.tsx)
const handleSubmit = async (data: HelpFormValues) => {
  const { error } = await supabase
    .from('help_requests')
    .insert({
      user_id: user.id,
      ...data
    });
  
  if (!error) {
    // 2. Find matching volunteers
    const matches = await supabase.functions.invoke('find-matches', {
      body: { helpRequestId: insertedId }
    });
    
    // 3. Send notifications to matches
    for (const match of matches.data.matches) {
      for (const volunteer of match.volunteers) {
        await supabase.functions.invoke('send-match-notification', {
          body: {
            helpRequest: match.helpRequest,
            volunteer
          }
        });
      }
    }
  }
};
```

---

## 🐛 Error Handling

### Frontend
```typescript
try {
  const { data, error } = await supabase
    .from('help_requests')
    .select('*');
  
  if (error) throw error;
  
} catch (error: any) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  });
}
```

### Backend
```typescript
try {
  // Function logic
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: corsHeaders
  });
} catch (error: any) {
  console.error("Function error:", error);
  return new Response(
    JSON.stringify({ error: error.message }),
    { status: 500, headers: corsHeaders }
  );
}
```

---

## 📈 Performance & Scaling

- ✅ **Auto-scaling:** Functions scale automatically with traffic
- ✅ **Connection pooling:** Database connections managed efficiently
- ✅ **CDN delivery:** Frontend served via global CDN
- ✅ **Optimistic updates:** UI updates before server confirmation
- ✅ **Caching:** Browser caching for static assets

---

## 🎯 Next Steps

**Recommended Enhancements:**
1. **Real-time matching** - WebSocket connections for live updates
2. **SMS notifications** - Add Twilio for SMS alerts
3. **Geolocation** - Use Maps API for precise location
4. **Rating system** - Let users rate volunteers
5. **Chat feature** - In-app messaging between users

---

## 📞 Support

For backend infrastructure questions:
- Lovable Cloud: [docs.lovable.dev/features/cloud](https://docs.lovable.dev/features/cloud)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)

---

**Last Updated:** 2025-11-14
**Backend Version:** 1.0.0
