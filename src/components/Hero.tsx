import { Button } from "@/components/ui/button";
import { Heart, Users, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-community.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Community helping each other" 
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      <div className="container relative z-10 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Community Care</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Help When You Need It,{" "}
            <span className="bg-gradient-warm bg-clip-text text-transparent">
              Kindness When You Give It
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with caring neighbors and smart AI assistance. Whether you need support or want to help others, 
            our community is here to make a difference together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="gap-2">
              <Heart className="h-5 w-5" />
              Request Help
            </Button>
            <Button variant="secondary" size="lg" className="gap-2">
              <Users className="h-5 w-5" />
              Volunteer Today
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>1,247 Active Helpers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>AI Support 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
