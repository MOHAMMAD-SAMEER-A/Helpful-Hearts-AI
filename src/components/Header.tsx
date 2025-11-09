import { Heart, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

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
          {user && (
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
          )}
          <Button 
            variant="hero" 
            size="sm" 
            onClick={handleAuthClick}
            className="gap-2"
          >
            {user ? (
              <>
                <LogOut className="h-4 w-4" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Login
              </>
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
