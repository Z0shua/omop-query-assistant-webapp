
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Clock, Code, Copy, ExternalLink, Filter, Search, Trash2 } from "lucide-react";

export default function HistoryPage() {
  // Mock data for query history
  const queryHistory = [
    {
      id: 1,
      query: "SELECT person_id, birth_datetime FROM person WHERE year_of_birth > 1980 LIMIT 100",
      timestamp: "2025-03-04 14:30:00",
      status: "completed",
      rowsReturned: 100
    },
    {
      id: 2,
      query: "SELECT drug_concept_id, drug_exposure_start_date FROM drug_exposure LIMIT 50",
      timestamp: "2025-03-04 13:15:00",
      status: "completed",
      rowsReturned: 50
    },
    {
      id: 3,
      query: "SELECT * FROM condition_occurrence WHERE condition_concept_id = 1234",
      timestamp: "2025-03-03 11:45:00",
      status: "failed",
      error: "Query timeout after 30 seconds"
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Query History</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your previously executed queries.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
        
        <div className="rounded-lg border">
          {queryHistory.map((item) => (
            <div key={item.id} className="p-4 border-b last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>{item.timestamp}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                <Code className="h-4 w-4 inline-block mr-2 opacity-70" />
                {item.query}
              </div>
              <div className="mt-2 text-sm">
                {item.status === "completed" ? (
                  <span className="text-green-600">Completed • {item.rowsReturned} rows returned</span>
                ) : (
                  <span className="text-red-600">Failed • {item.error}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
