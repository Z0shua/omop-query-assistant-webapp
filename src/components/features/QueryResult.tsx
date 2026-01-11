
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Code,
  Copy,
  Check,
  BarChart as BarChartIcon,
  TableIcon,
  Maximize2,
  Minimize2,
  Brain,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { AIResponse } from './AIResponse';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface QueryResultProps {
  id: string;
  sql: string;
  data: any[];
  metrics: {
    rows: number;
    columns: string[];
    execution_time_ms: number;
    cached?: boolean;
    ai_provider?: string;
  };
  timestamp: string;
  aiResponse?: string;
  onDelete?: (id: string) => void;
}

export function QueryResult({ id, sql, data, metrics, timestamp, aiResponse, onDelete }: QueryResultProps) {
  const [isSqlVisible, setIsSqlVisible] = useState(false);
  const [isAIResponseVisible, setIsAIResponseVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [copiedSQL, setCopiedSQL] = useState(false);

  const toggleSqlVisibility = () => {
    setIsSqlVisible(!isSqlVisible);
  };

  const toggleAIResponseVisibility = () => {
    setIsAIResponseVisible(!isAIResponseVisible);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedSQL(true);
      toast.success('SQL copied to clipboard');
      setTimeout(() => setCopiedSQL(false), 2000);
    } catch (err) {
      toast.error('Failed to copy SQL');
    }
  };

  const downloadCSV = () => {
    if (!data || data.length === 0) {
      toast.error('No data to download');
      return;
    }

    try {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row =>
        Object.values(row)
          .map(val => typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val)
          .join(',')
      ).join('\n');
      const csv = `${headers}\n${rows}`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query-result-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('CSV downloaded successfully');
    } catch (err) {
      toast.error('Failed to download CSV');
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  const formattedTime = new Date(timestamp).toLocaleString();

  return (
    <Card
      className={`mt-4 overflow-hidden transition-all ${isFullscreen
        ? 'fixed top-0 left-0 w-screen h-screen z-50 rounded-none'
        : 'w-full animate-slide-in'
        }`}
    >
      <CardHeader className="bg-card border-b border-border">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            Query Result
            {metrics.cached && (
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Cached
              </span>
            )}
          </CardTitle>

          <div className="flex items-center space-x-2">
            {aiResponse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAIResponseVisibility}
                className="text-muted-foreground hover:text-foreground"
              >
                <Brain className="h-4 w-4 mr-1" />
                AI Explanation
                {isAIResponseVisible ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSqlVisibility}
              className="text-muted-foreground hover:text-foreground"
            >
              <Code className="h-4 w-4 mr-1" />
              SQL
              {isSqlVisible ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </Button>

            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
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
                    <AlertDialogAction onClick={handleDeleteClick} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-muted-foreground hover:text-foreground"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-muted-foreground pt-1">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formattedTime}</span>
          </div>

          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span>{metrics.rows} rows</span>
            <span>{metrics.columns.length} columns</span>
            <span>{metrics.execution_time_ms.toFixed(2)} ms</span>
          </div>
        </div>
      </CardHeader>

      {isAIResponseVisible && aiResponse && (
        <div className="border-b border-border">
          <AIResponse
            response={aiResponse}
            provider={metrics.ai_provider || 'AI'}
          />
        </div>
      )}

      {isSqlVisible && (
        <div className="bg-muted/50 p-4 border-b border-border">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Generated SQL Query</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="text-muted-foreground hover:text-foreground h-8"
            >
              {copiedSQL ? (
                <Check className="h-4 w-4 mr-1" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              {copiedSQL ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <pre className="text-xs sm:text-sm bg-card p-3 rounded-md overflow-x-auto">
            <code>{sql}</code>
          </pre>
        </div>
      )}

      <CardContent className="p-0">
        {data && data.length > 0 ? (
          <div>
            <div className="border-b border-border p-4 flex justify-between items-center bg-muted/30">
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <TableIcon className="h-4 w-4 mr-1" />
                  Table
                </Button>
                <Button
                  variant={viewMode === 'chart' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('chart')}
                  disabled={!data || data.length === 0}
                >
                  <BarChartIcon className="h-4 w-4 mr-1" />
                  Chart
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={downloadCSV}
                disabled={!data || data.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>

            <div className="overflow-auto max-h-[500px]">
              {viewMode === 'table' ? (
                <table className="w-full table-base">
                  <thead className="bg-muted/50">
                    <tr>
                      {Object.keys(data[0]).map((column, index) => (
                        <th
                          key={index}
                          className="table-header px-4 py-3 text-left"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="table-row">
                        {Object.values(row).map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-2 text-sm whitespace-nowrap"
                          >
                            {typeof cell === 'object' ? JSON.stringify(cell) : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-[400px] w-full p-4">
                  {(() => {
                    // Simple heuristic to find suitable X and Y axes
                    const keys = Object.keys(data[0]);
                    const stringKeys = keys.filter(k => typeof data[0][k] === 'string');
                    const numberKeys = keys.filter(k => typeof data[0][k] === 'number');

                    const xAxisKey = stringKeys.length > 0 ? stringKeys[0] : keys[0];
                    const yAxisKeys = numberKeys.length > 0 ? numberKeys : [];

                    if (yAxisKeys.length === 0) {
                      return (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          <p>No numeric data found to visualize.</p>
                        </div>
                      );
                    }

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis
                            dataKey={xAxisKey}
                            tick={{ fontSize: 12 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              color: 'hsl(var(--foreground))'
                            }}
                          />
                          <Legend />
                          {yAxisKeys.map((key, index) => (
                            <Bar
                              key={key}
                              dataKey={key}
                              fill={`hsl(var(--primary) / ${1 - index * 0.2})`}
                              radius={[4, 4, 0, 0]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>The query returned no results.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
