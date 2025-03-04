
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full border-t border-border mt-16 py-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">OMOP Query Assistant</h3>
            <p className="text-muted-foreground">
              An AI-powered assistant to help you query OMOP data using natural language.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/query" className="text-muted-foreground hover:text-primary transition-colors">
                  Query Builder
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-muted-foreground hover:text-primary transition-colors">
                  Query History
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-muted-foreground hover:text-primary transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.ohdsi.org/data-standardization/the-common-data-model/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  OMOP CDM Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/OHDSI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  OHDSI GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} OMOP Query Assistant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
