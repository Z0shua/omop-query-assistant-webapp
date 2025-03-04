
import { Header } from './Header';
import { Footer } from './Footer';
import { useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Add class to body for initial page animation
  useEffect(() => {
    document.body.classList.add('animate-fade-in');
    return () => {
      document.body.classList.remove('animate-fade-in');
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="flex flex-1 pt-16">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
          <div className="container animate-slide-in">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
