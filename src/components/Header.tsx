import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <span className="text-xl font-bold bg-gradient-warm bg-clip-text text-transparent">
            Smart Community Help Hub
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            How It Works
          </a>
          <a href="#get-help" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Get Help
          </a>
          <a href="#volunteer" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Volunteer
          </a>
          <a href="#stories" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Stories
          </a>
          <Button variant="hero" size="sm">
            Connect Now
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
