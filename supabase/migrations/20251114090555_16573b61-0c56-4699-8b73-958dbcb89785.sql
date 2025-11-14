-- Add pincode column to help_requests table
ALTER TABLE public.help_requests 
ADD COLUMN pincode text;

-- Add pincode column to volunteer_applications table
ALTER TABLE public.volunteer_applications 
ADD COLUMN pincode text;

-- Add check constraint for Indian pincode format (6 digits)
ALTER TABLE public.help_requests
ADD CONSTRAINT help_requests_pincode_check 
CHECK (pincode IS NULL OR pincode ~ '^\d{6}$');

ALTER TABLE public.volunteer_applications
ADD CONSTRAINT volunteer_applications_pincode_check 
CHECK (pincode IS NULL OR pincode ~ '^\d{6}$');