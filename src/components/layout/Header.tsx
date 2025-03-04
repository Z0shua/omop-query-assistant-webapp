
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, MenuIcon, X } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

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

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Query Builder', path: '/query' },
    { name: 'Query History', path: '/history' },
    { name: 'Database Info', path: '/database' },
    { name: 'Settings', path: '/settings' },
    { name: 'Help & Documentation', path: '/help' },
    { name: 'Example Queries', path: '/examples' }
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'glass shadow-sm py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-foreground"
          >
            <span className="text-primary text-2xl font-bold">OMOP</span>
            <span className="font-semibold text-lg">Query Assistant</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
            >
              {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={18} /> : <MenuIcon size={18} />}
            </Button>
          </div>
        </div>
        
        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex justify-center w-full">
          <Tabs value={location.pathname} className="w-full">
            <TabsList className="w-full justify-center">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <TabsTrigger
                    value={item.path}
                    className={location.pathname === item.path ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                  >
                    {item.name}
                  </TabsTrigger>
                </Link>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full glass shadow-elevation animate-fade-in md:hidden">
            <nav className="flex flex-col p-4 space-y-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`text-foreground hover:text-primary px-4 py-2 rounded-md hover:bg-secondary transition-colors ${
                    location.pathname === item.path ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
