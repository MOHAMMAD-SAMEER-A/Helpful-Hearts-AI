import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";

const helpFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().regex(/^\(?[\d]{3}\)?[\s.-]?[\d]{3}[\s.-]?[\d]{4}$/, "Invalid phone number format").optional().or(z.literal("")),
  location: z.string().trim().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  category: z.enum(["food", "transportation", "housing", "healthcare", "childcare", "emotional", "other"], {
    required_error: "Please select a category",
  }),
  details: z.string().trim().min(10, "Please provide at least 10 characters").max(2000, "Details must be less than 2000 characters"),
});

type HelpFormValues = z.infer<typeof helpFormSchema>;

const HelpForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HelpFormValues>({
    resolver: zodResolver(helpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      category: undefined,
      details: "",
    },
  });

  useEffect(() => {
    if (user) {
      // Pre-fill form with user data if available
      const fetchProfile = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, email, phone')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          form.setValue('name', profile.display_name || '');
          form.setValue('email', profile.email || '');
          form.setValue('phone', profile.phone || '');
        }
      };
      fetchProfile();
    }
  }, [user, form]);

  const handleSubmit = async (data: HelpFormValues) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to submit a help request.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('help_requests')
        .insert({
          user_id: user.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          location: data.location,
          category: data.category,
          details: data.details,
        });

      if (error) throw error;

      toast({
        title: "Request Submitted! 🤝",
        description: "Our community will review your request and reach out soon.",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="get-help" className="py-20">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 shadow-[var(--shadow-card)]">
            <div className="text-center mb-8 space-y-2">
              <Heart className="h-12 w-12 mx-auto text-primary fill-primary" />
              <h2 className="text-3xl font-bold">Request Help</h2>
              <p className="text-muted-foreground">
                Let us know what you need. Our community is here to support you.
              </p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Help Needed</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="food">Food Assistance</SelectItem>
                          <SelectItem value="transportation">Transportation</SelectItem>
                          <SelectItem value="housing">Housing Support</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="childcare">Childcare</SelectItem>
                          <SelectItem value="emotional">Emotional Support</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tell Us More</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your situation and how we can help..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    You'll need to login to submit a help request.
                  </p>
                )}
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HelpForm;
