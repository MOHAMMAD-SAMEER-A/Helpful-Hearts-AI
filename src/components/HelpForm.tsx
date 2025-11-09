import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Heart, MapPin } from "lucide-react";

const HelpForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Request Received! 💙",
      description: "Our community is reviewing your request. You'll hear from us soon.",
    });
    
    setIsSubmitting(false);
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" placeholder="Enter your name" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="(123) 456-7890" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </Label>
                <Input id="location" placeholder="City, State" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Type of Help Needed</Label>
                <Select required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Tell Us More</Label>
                <Textarea 
                  id="details" 
                  placeholder="Describe your situation and how we can help..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your information is kept private and only shared with verified helpers.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HelpForm;
