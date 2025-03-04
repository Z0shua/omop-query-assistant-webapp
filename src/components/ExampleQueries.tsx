
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Activity, 
  Pill, 
  Clock, 
  LineChart,
  Heart 
} from 'lucide-react';

interface ExampleQueriesProps {
  onSelectExample: (query: string) => void;
}

export function ExampleQueries({ onSelectExample }: ExampleQueriesProps) {
  const examples = [
    {
      category: "Patient Demographics",
      icon: Users,
      queries: [
        "How many patients are in the database by gender?",
        "What is the age distribution of patients?",
        "Show me the racial distribution of patients over 65 years old"
      ]
    },
    {
      category: "Conditions and Diagnoses",
      icon: Activity,
      queries: [
        "What are the top 10 most common diagnoses?",
        "How many patients have type 2 diabetes mellitus?",
        "Show me patients with hypertension grouped by age range"
      ]
    },
    {
      category: "Medications",
      icon: Pill,
      queries: [
        "What antibiotics are most commonly prescribed?",
        "Show patients who received steroids in the last year",
        "List the top 5 medications prescribed to patients with heart failure"
      ]
    },
    {
      category: "Temporal Analysis",
      icon: Clock,
      queries: [
        "What is the average length of hospital stays?",
        "Show monthly trend of flu diagnoses",
        "How many patients were diagnosed with pneumonia in the last 6 months?"
      ]
    },
    {
      category: "Complex Patterns",
      icon: LineChart,
      queries: [
        "Find patients with both diabetes and hypertension",
        "Show medications prescribed after heart surgery",
        "Identify patients who had an adverse reaction after taking amoxicillin"
      ]
    },
    {
      category: "Comorbidities",
      icon: Heart,
      queries: [
        "What conditions commonly co-occur with rheumatoid arthritis?",
        "Show the most common comorbidities in elderly patients",
        "Find patients who have at least 3 chronic conditions"
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {examples.map((category, index) => (
        <Card key={index} className="card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <category.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{category.category}</CardTitle>
            </div>
            <CardDescription>
              Example queries related to {category.category.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {category.queries.map((query, queryIndex) => (
                <li key={queryIndex}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2 text-muted-foreground hover:text-foreground"
                    onClick={() => onSelectExample(query)}
                  >
                    <span className="line-clamp-2">{query}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
