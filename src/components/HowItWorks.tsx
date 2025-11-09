import { MessageSquare, Users, Heart, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: MessageSquare,
    title: "Share Your Need",
    description: "Tell us how we can help or use our AI chatbot for instant guidance and support.",
    color: "text-primary",
  },
  {
    icon: Sparkles,
    title: "Smart Matching",
    description: "Our AI connects you with the right helpers or resources in your community.",
    color: "text-accent",
  },
  {
    icon: Users,
    title: "Community Response",
    description: "Caring neighbors and volunteers reach out to provide the help you need.",
    color: "text-secondary-foreground",
  },
  {
    icon: Heart,
    title: "Give Back",
    description: "When you're ready, become a helper and create a ripple of kindness.",
    color: "text-primary",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-soft">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-bold">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Four simple steps to connect, help, and create lasting positive change in your community
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="p-6 space-y-4 hover:shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className={`h-5 w-5 ${step.color}`} />
                </div>
                <span className="text-2xl font-bold text-muted-foreground/30">0{index + 1}</span>
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
