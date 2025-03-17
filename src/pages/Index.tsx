
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { ExampleQueries } from '@/components/ExampleQueries';
import { QueryInput } from '@/components/QueryInput';
import { ChatMessage } from '@/components/ChatMessage';
import { Brain, Search, Database, Settings, History, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCredentials } from '@/hooks/use-credentials';

interface ChatMessageType {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credentials } = useCredentials();
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Handle example query selection
  const handleSelectExample = (query: string) => {
    // Navigate to query page with the selected example
    navigate('/query', { state: { initialQuery: query } });
  };

  // Handle query submission for the chat
  const handleQuerySubmit = async (query: string) => {
    if (!query.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: query,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Check if query is OMOP-related by looking for medical/OMOP keywords
      const isOmopRelated = isOmopQuery(query);
      
      // Simulate AI response with a small delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      let aiResponse: string;
      
      if (isOmopRelated) {
        // Generate an OMOP-related response
        aiResponse = generateOmopResponse(query);
      } else {
        // Politely redirect non-OMOP queries
        aiResponse = "Sorry, I can only assist with OMOP medical domain queries. Please try rephrasing your request to align with this focus.";
      }
      
      // Add AI response to chat
      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing query:', error);
      toast({
        title: "Error processing query",
        description: "There was an error processing your query. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if query is related to OMOP/medical domain
  const isOmopQuery = (query: string): boolean => {
    const omopKeywords = [
      'omop', 'cdm', 'patient', 'condition', 'drug', 'measurement', 'observation', 
      'procedure', 'visit', 'provider', 'care site', 'location', 'device', 'specimen', 
      'concept', 'vocabulary', 'domain', 'medication', 'diagnosis', 'treatment',
      'condition', 'disease', 'symptom', 'therapy', 'clinical', 'medical', 'health',
      'healthcare', 'hospital', 'doctor', 'physician', 'nurse', 'patient', 'outcome'
    ];
    
    const lowerQuery = query.toLowerCase();
    return omopKeywords.some(keyword => lowerQuery.includes(keyword));
  };

  // Generate a response for OMOP-related queries
  const generateOmopResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Simple pattern matching for common OMOP queries
    if (lowerQuery.includes('what is omop')) {
      return "OMOP (Observational Medical Outcomes Partnership) Common Data Model (CDM) is a standardized format for observational healthcare data. It organizes patient data from various sources into a consistent structure to facilitate research and analysis. The model includes tables for patient demographics, conditions, medications, procedures, measurements, and more.";
    } 
    else if (lowerQuery.includes('tables') || lowerQuery.includes('schema')) {
      return "The OMOP CDM consists of several key tables, including:\n\n1. PERSON - Demographics of patients\n2. CONDITION_OCCURRENCE - Records of diagnoses\n3. DRUG_EXPOSURE - Medication records\n4. PROCEDURE_OCCURRENCE - Medical procedures\n5. MEASUREMENT - Lab tests and other measurements\n6. VISIT_OCCURRENCE - Patient encounters\n7. PROVIDER - Healthcare providers\n8. LOCATION - Geographic locations\n9. CARE_SITE - Facilities where care was provided\n\nThese tables are linked by standard identifiers and follow a structured vocabulary system.";
    }
    else if (lowerQuery.includes('concept') || lowerQuery.includes('vocabulary')) {
      return "In OMOP CDM, concepts are standardized medical terms stored in the CONCEPT table. They represent diagnoses, drugs, procedures, measurements, etc. The OMOP vocabulary system maps source codes (like ICD-10, SNOMED CT, RxNorm) to standard concepts, enabling consistent analysis across different data sources. The vocabulary tables include CONCEPT, CONCEPT_RELATIONSHIP, CONCEPT_ANCESTOR, and CONCEPT_SYNONYM.";
    }
    else if (lowerQuery.includes('patient') || lowerQuery.includes('person')) {
      return "The PERSON table in OMOP CDM contains demographic information about patients, including:\n\n- person_id (unique identifier)\n- gender_concept_id\n- birth_datetime\n- race_concept_id\n- ethnicity_concept_id\n- location_id\n- provider_id\n- care_site_id\n\nThis table serves as the central anchor for all patient-related data across the OMOP model.";
    }
    else if (lowerQuery.includes('condition') || lowerQuery.includes('diagnosis') || lowerQuery.includes('disease')) {
      return "In OMOP CDM, diagnoses and conditions are stored in the CONDITION_OCCURRENCE table. This table captures all recorded conditions for a patient, including:\n\n- condition_occurrence_id\n- person_id (linking to PERSON table)\n- condition_concept_id (standardized diagnosis code)\n- condition_start_date/datetime\n- condition_end_date/datetime (if applicable)\n- condition_type_concept_id (the source of the diagnosis)\n- visit_occurrence_id (if associated with a visit)\n\nConditions are standardized using the SNOMED CT vocabulary.";
    }
    else if (lowerQuery.includes('medication') || lowerQuery.includes('drug')) {
      return "Medications in OMOP CDM are stored in the DRUG_EXPOSURE table, which includes:\n\n- drug_exposure_id\n- person_id (linking to PERSON table)\n- drug_concept_id (standardized medication code)\n- drug_exposure_start_date/datetime\n- drug_exposure_end_date/datetime\n- quantity\n- days_supply\n- sig (instructions for use)\n- route_concept_id (how the drug was administered)\n- visit_occurrence_id (if associated with a visit)\n\nMedications are typically standardized using RxNorm vocabulary.";
    }
    else if (lowerQuery.includes('procedure')) {
      return "Procedures in OMOP CDM are recorded in the PROCEDURE_OCCURRENCE table, which includes:\n\n- procedure_occurrence_id\n- person_id (linking to PERSON table)\n- procedure_concept_id (standardized procedure code)\n- procedure_date/datetime\n- procedure_type_concept_id (source of the procedure record)\n- modifier_concept_id (additional procedure information)\n- quantity (if applicable)\n- visit_occurrence_id (if associated with a visit)\n\nProcedures are typically standardized using CPT, ICD-10-PCS, or SNOMED CT vocabularies.";
    }
    else if (lowerQuery.includes('measurement') || lowerQuery.includes('lab')) {
      return "Laboratory and other clinical measurements in OMOP CDM are stored in the MEASUREMENT table, which includes:\n\n- measurement_id\n- person_id (linking to PERSON table)\n- measurement_concept_id (standardized measurement code)\n- measurement_date/datetime\n- measurement_type_concept_id (source of measurement)\n- operator_concept_id (e.g., >, <, =)\n- value_as_number (numeric result)\n- value_as_concept_id (categorical result)\n- unit_concept_id (units of measure)\n- range_low/high (reference range)\n- visit_occurrence_id (if associated with a visit)\n\nLab tests are typically standardized using LOINC vocabulary.";
    }
    else if (lowerQuery.includes('visit') || lowerQuery.includes('encounter')) {
      return "Patient encounters in OMOP CDM are recorded in the VISIT_OCCURRENCE table, which includes:\n\n- visit_occurrence_id\n- person_id (linking to PERSON table)\n- visit_concept_id (type of visit: inpatient, outpatient, emergency, etc.)\n- visit_start_date/datetime\n- visit_end_date/datetime\n- provider_id\n- care_site_id\n- visit_source_value (original visit type from source data)\n\nThis table serves as a framework for other clinical events that happen during a visit.";
    }
    else {
      return "The OMOP Common Data Model (CDM) standardizes healthcare data for research. Your question appears to be about the OMOP medical domain, but I don't have specific information on that exact query. You can explore related topics like patient demographics (PERSON table), diagnoses (CONDITION_OCCURRENCE), medications (DRUG_EXPOSURE), procedures (PROCEDURE_OCCURRENCE), lab results (MEASUREMENT), or healthcare visits (VISIT_OCCURRENCE). For more specific information, try querying about one of these areas or ask about the overall OMOP schema structure.";
    }
  };

  return (
    <Layout>
      <section className="py-10 text-center">
        <div className="mb-6 inline-block p-2 bg-primary/10 rounded-full text-primary animate-float">
          <Brain size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
          OMOP Query Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Ask questions about your OMOP data in plain English and get instant results
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate('/query')}
          className="animate-glow shadow-lg"
        >
          <Search className="mr-2 h-5 w-5" />
          Start SQL Querying
        </Button>
      </section>

      {/* Chat Interface */}
      <section className="py-6 mb-12">
        <Card className="w-full max-w-4xl mx-auto animate-slide-in">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Brain className="mr-2 h-5 w-5 text-primary" />
              OMOP Assistant Chat
            </CardTitle>
            <CardDescription>
              Ask questions about OMOP CDM structure, medical concepts, and healthcare data modeling
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="mb-1">No messages yet</p>
                  <p className="text-sm">Ask a question about OMOP or medical data modeling</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  {chatMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      content={message.content}
                      isUser={message.isUser}
                      timestamp={message.timestamp}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </ScrollArea>
              )}
            </div>
            
            <QueryInput
              onSubmit={handleQuerySubmit}
              isProcessing={isProcessing}
              placeholder="Ask about OMOP CDM structure, medical concepts, or data modeling..."
            />
            
            <div className="mt-3 text-xs text-muted-foreground">
              <p>Example questions: "What is OMOP?", "Explain the PERSON table", "How are medications stored in OMOP?"</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-bold mb-8 text-center">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover">
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-md w-fit text-primary">
                <Brain className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">Natural Language Queries</CardTitle>
              <CardDescription>
                Ask questions in plain English without writing SQL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Translate complex medical data questions into accurate SQL queries automatically
              </p>
              <Button 
                variant="ghost" 
                className="group"
                onClick={() => navigate('/query')}
              >
                Try it out
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-md w-fit text-primary">
                <Database className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">OMOP CDM Compatible</CardTitle>
              <CardDescription>
                Designed specifically for OMOP Common Data Model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Understands OMOP tables, relationships, and vocabulary concepts
              </p>
              <Button 
                variant="ghost" 
                className="group"
                onClick={() => navigate('/database')}
              >
                View database schema
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-md w-fit text-primary">
                <History className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">Query History</CardTitle>
              <CardDescription>
                Save and revisit your previous queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                All your queries are saved locally for easy reference and reuse
              </p>
              <Button 
                variant="ghost" 
                className="group"
                onClick={() => navigate('/history')}
              >
                View history
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <div className="p-2 bg-primary/10 rounded-md w-fit text-primary">
                <Settings className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">Secure Configuration</CardTitle>
              <CardDescription>
                Safely manage your API keys and database settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your credentials are stored securely in your browser's local storage
              </p>
              <Button 
                variant="ghost" 
                className="group"
                onClick={() => navigate('/settings')}
              >
                Configure settings
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-bold mb-2 text-center">Example Queries</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get started with these example queries or create your own
        </p>
        
        <ExampleQueries onSelectExample={handleSelectExample} />
      </section>
    </Layout>
  );
}
