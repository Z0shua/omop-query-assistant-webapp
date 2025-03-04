
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useEffect, useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Match the sidebar's collapsed state
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  
  // Listen for changes to localStorage
  useEffect(() => {
    const checkSidebarState = () => {
      const savedState = localStorage.getItem('sidebarCollapsed');
      setSidebarCollapsed(savedState ? JSON.parse(savedState) : false);
    };
    
    // Check initially
    checkSidebarState();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', checkSidebarState);
    
    // Add class to body for initial page animation
    document.body.classList.add('animate-fade-in');
    
    return () => {
      document.body.classList.remove('animate-fade-in');
      window.removeEventListener('storage', checkSidebarState);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main 
          className={`flex-1 transition-all duration-300 px-4 sm:px-6 lg:px-8 py-8 ${
            sidebarCollapsed 
              ? 'sm:pl-24' // Less padding when sidebar is collapsed
              : 'sm:pl-72'  // More padding when sidebar is expanded
          }`}
        >
          <div className="container animate-slide-in">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
