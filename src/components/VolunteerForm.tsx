import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Users, MapPin } from "lucide-react";

const helpCategories = [
  { id: "food", label: "Food Assistance" },
  { id: "transportation", label: "Transportation" },
  { id: "housing", label: "Housing Support" },
  { id: "healthcare", label: "Healthcare" },
  { id: "childcare", label: "Childcare" },
  { id: "emotional", label: "Emotional Support" },
  { id: "other", label: "Other" },
];

const VolunteerForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Welcome to Our Community! 🎉",
      description: "Thank you for offering to help. We'll connect you with those who need your support.",
    });
    
    setIsSubmitting(false);
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="volunteer-name">Your Name</Label>
                <Input id="volunteer-name" placeholder="Enter your name" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="volunteer-email">Email</Label>
                <Input id="volunteer-email" type="email" placeholder="your@email.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteer-phone">Phone Number</Label>
                <Input id="volunteer-phone" type="tel" placeholder="(123) 456-7890" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteer-location">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </Label>
                <Input id="volunteer-location" placeholder="City, State" required />
              </div>

              <div className="space-y-3">
                <Label>Areas You Can Help With</Label>
                <div className="grid grid-cols-2 gap-3">
                  {helpCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox id={`cat-${category.id}`} />
                      <label
                        htmlFor={`cat-${category.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Your Availability</Label>
                <Textarea 
                  id="availability" 
                  placeholder="Let us know when you're available to help (e.g., weekends, evenings)..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteer-skills">Special Skills or Resources</Label>
                <Textarea 
                  id="volunteer-skills" 
                  placeholder="Tell us about any special skills, resources, or experiences you can share..."
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Join as Volunteer"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                All volunteers are verified to ensure safe and trusted connections.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default VolunteerForm;
