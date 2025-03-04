
import { Layout } from "@/components/layout/Layout";

export default function HelpPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Help & Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Resources and guides to help you get the most out of the OMOP Query Assistant.
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <p className="mb-4">
              The OMOP Query Assistant allows you to query OMOP CDM databases using natural language.
              Simply type your query in English, and the system will convert it to SQL and fetch the results.
            </p>
            <h3 className="text-lg font-medium mt-6 mb-2">Basic Usage</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Navigate to the <strong>Query Builder</strong> page</li>
              <li>Type your question in natural language (e.g., "Show me patients diagnosed with hypertension")</li>
              <li>Review the generated SQL query and modify if needed</li>
              <li>Execute the query and view the results</li>
            </ol>
          </div>
          
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">How do I format complex queries?</h3>
                <p className="text-muted-foreground">Be as specific as possible in your natural language query. Include criteria like time periods, demographics, and specific medical concepts.</p>
              </div>
              <div>
                <h3 className="font-medium">Can I save my queries?</h3>
                <p className="text-muted-foreground">Yes, all queries are automatically saved to your query history. You can access them anytime in the Query History section.</p>
              </div>
              <div>
                <h3 className="font-medium">How do I export my results?</h3>
                <p className="text-muted-foreground">After running a query, use the export button above the results table to download the data in CSV format.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
