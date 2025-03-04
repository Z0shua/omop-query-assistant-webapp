
import { Layout } from "@/components/layout/Layout";
import { ExampleQueries } from "@/components/ExampleQueries";
import { useNavigate } from "react-router-dom";

export default function ExamplesPage() {
  const navigate = useNavigate();
  
  // Handle example query selection
  const handleSelectExample = (query: string) => {
    // Navigate to query page with the selected example
    navigate('/query', { state: { initialQuery: query } });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Example Queries</h1>
          <p className="text-muted-foreground mt-2">
            Browse and try these example queries to see what the OMOP Query Assistant can do.
          </p>
        </div>
        
        <ExampleQueries onSelectExample={handleSelectExample} />
        
        <div className="rounded-lg border p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">How to Use Examples</h2>
          <p className="mb-4">
            Click on any example query to automatically load it in the Query Builder. 
            You can then execute it as-is or modify it to suit your needs.
          </p>
          <p>
            Examples are categorized by complexity and use case to help you find relevant queries 
            quickly. These examples also serve as learning tools to understand the capabilities of 
            the system and how to phrase your own queries effectively.
          </p>
        </div>
      </div>
    </Layout>
  );
}
