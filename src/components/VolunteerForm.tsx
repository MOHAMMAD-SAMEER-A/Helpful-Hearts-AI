import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Users, MapPin } from "lucide-react";

const helpCategories = [
  { id: "food", label: "Food Assistance" },
  { id: "transportation", label: "Transportation" },
  { id: "housing", label: "Housing Support" },
  { id: "healthcare", label: "Healthcare" },
  { id: "childcare", label: "Childcare" },
  { id: "emotional", label: "Emotional Support" },
  { id: "other", label: "Other" },
] as const;

const volunteerFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().regex(/^\(?[\d]{3}\)?[\s.-]?[\d]{3}[\s.-]?[\d]{4}$/, "Invalid phone number format"),
  location: z.string().trim().min(1, "District is required").max(200, "District must be less than 200 characters"),
  categories: z.array(z.string()).min(1, "Please select at least one category"),
  availability: z.string().trim().max(500, "Availability must be less than 500 characters").optional(),
  skills: z.string().trim().max(1000, "Skills must be less than 1000 characters").optional(),
});

type VolunteerFormValues = z.infer<typeof volunteerFormSchema>;

const VolunteerForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      categories: [],
      availability: "",
      skills: "",
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

  const handleSubmit = async (data: VolunteerFormValues) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to submit a volunteer application.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('volunteer_applications')
        .insert({
          user_id: user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          categories: data.categories,
          availability: data.availability || '',
          skills: data.skills || '',
        });

      if (error) throw error;

      toast({
        title: "Application Submitted! 🎉",
        description: "Thank you for joining our community of helpers!",
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
    <section id="volunteer" className="py-20 bg-gradient-soft">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 shadow-[var(--shadow-card)]">
            <div className="text-center mb-8 space-y-2">
              <Users className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-3xl font-bold">Become a Helper</h2>
              <p className="text-muted-foreground">
                Share your time, skills, and kindness with those who need it most.
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
                        District
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your district" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categories"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Areas You Can Help With</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {helpCategories.map((category) => (
                          <FormField
                            key={category.id}
                            control={form.control}
                            name="categories"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={category.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(category.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, category.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== category.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {category.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Availability</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Let us know when you're available to help (e.g., weekends, evenings)..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Skills or Resources</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about any special skills, resources, or experiences you can share..."
                          className="min-h-[100px]"
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
                  {isSubmitting ? "Submitting..." : "Join as Volunteer"}
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    You'll need to login to submit a volunteer application.
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

export default VolunteerForm;
