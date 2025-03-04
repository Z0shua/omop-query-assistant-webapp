
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, MenuIcon, X } from "lucide-react";
import { Link } from 'react-router-dom';

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'glass shadow-sm py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-foreground"
        >
          <span className="text-primary text-2xl font-bold">OMOP</span>
          <span className="font-semibold text-lg">Query Assistant</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/query" className="text-foreground hover:text-primary transition-colors">
            Query Builder
          </Link>
          <Link to="/history" className="text-foreground hover:text-primary transition-colors">
            History
          </Link>
          <Link to="/settings" className="text-foreground hover:text-primary transition-colors">
            Settings
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="ml-2"
          >
            {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </Button>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            className="mr-2"
          >
            {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={18} /> : <MenuIcon size={18} />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full glass shadow-elevation animate-fade-in md:hidden">
            <nav className="flex flex-col p-4 space-y-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/query" 
                className="text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Query Builder
              </Link>
              <Link 
                to="/history" 
                className="text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                History
              </Link>
              <Link 
                to="/settings" 
                className="text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Settings
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
