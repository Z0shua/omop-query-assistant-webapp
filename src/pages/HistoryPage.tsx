
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Code, 
  Copy, 
  ExternalLink, 
  Filter, 
  Search, 
  Trash2,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [queryHistory, setQueryHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  
  // Load query history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('queryHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setQueryHistory(parsed);
        setFilteredHistory(parsed);
      } catch (e) {
        console.error('Error parsing saved query history:', e);
        // If there's an error parsing, start with an empty history
      }
    }
  }, []);

  // Filter history based on search text
  useEffect(() => {
    if (!searchText) {
      setFilteredHistory(queryHistory);
      return;
    }
    
    const lowerSearch = searchText.toLowerCase();
    const filtered = queryHistory.filter(item => 
      item.query.toLowerCase().includes(lowerSearch) || 
      item.sql.toLowerCase().includes(lowerSearch)
    );
    
    setFilteredHistory(filtered);
  }, [searchText, queryHistory]);

  const handleDelete = (id: string) => {
    const updatedHistory = queryHistory.filter(item => item.id !== id);
    setQueryHistory(updatedHistory);
    localStorage.setItem('queryHistory', JSON.stringify(updatedHistory));
    toast.success('Query deleted from history');
  };

  const clearAllHistory = () => {
    setQueryHistory([]);
    setFilteredHistory([]);
    localStorage.removeItem('queryHistory');
    toast.success('Query history cleared');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('SQL copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy SQL');
    }
  };

  const rerunQuery = (query: string) => {
    navigate('/query', { state: { initialQuery: query } });
  };

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
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search queries..."
                className="pl-8 h-9"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            
            {queryHistory.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Query History</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your entire query history? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={clearAllHistory}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        
        {filteredHistory.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">No queries found in your history.</p>
            {searchText && queryHistory.length > 0 && (
              <p className="text-muted-foreground mt-2">Try a different search term.</p>
            )}
            {!searchText && (
              <Button 
                className="mt-4"
                onClick={() => navigate('/query')}
              >
                Go to Query Builder
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="rounded-lg border">
              {filteredHistory.map((item) => (
                <div key={item.id} className="p-4 border-b last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(item.sql)}
                        title="Copy SQL"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => rerunQuery(item.query)}
                        title="Run this query again"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            title="Delete query"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Query</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this query? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="mb-2">
                    <h3 className="font-medium">{item.query}</h3>
                  </div>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                    <Code className="h-4 w-4 inline-block mr-2 opacity-70" />
                    {item.sql}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-green-600">
                      {item.metrics.rows} rows returned • {item.metrics.execution_time_ms.toFixed(2)} ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </Layout>
  );
}
