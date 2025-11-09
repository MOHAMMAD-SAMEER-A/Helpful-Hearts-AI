import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const stories = [
  {
    name: "Sarah M.",
    story: "After my surgery, I couldn't drive to appointments. The community stepped in immediately—rides, meals, even someone to walk my dog. I felt truly cared for.",
    role: "Help Receiver",
  },
  {
    name: "James K.",
    story: "Volunteering here changed my life. I started by helping with groceries, but I gained a whole new family. The AI matching was spot-on—connected me with people I could really help.",
    role: "Volunteer",
  },
  {
    name: "Maria L.",
    story: "As a single mom, asking for help was hard. But this community made it easy and judgment-free. Now I volunteer whenever I can to pay it forward.",
    role: "Helper & Receiver",
  },
];

const Stories = () => {
  return (
    <section id="stories" className="py-20">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-bold">Stories of Impact</h2>
          <p className="text-lg text-muted-foreground">
            Real stories from real people whose lives were touched by community kindness
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {stories.map((story, index) => (
            <Card 
              key={index}
              className="p-6 space-y-4 hover:shadow-[var(--shadow-soft)] transition-all duration-300 bg-card/80 backdrop-blur-sm"
            >
              <Quote className="h-8 w-8 text-primary/30" />
              <p className="text-muted-foreground italic">{story.story}</p>
              <div className="pt-2">
                <p className="font-semibold">{story.name}</p>
                <p className="text-sm text-primary">{story.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stories;
