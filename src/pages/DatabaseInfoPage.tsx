
import { Layout } from "@/components/layout/Layout";

export default function DatabaseInfoPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Database Information</h1>
          <p className="text-muted-foreground mt-2">
            View and explore the OMOP CDM database structure and tables.
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">OMOP Common Data Model</h2>
            <p className="mb-4">
              The OMOP Common Data Model (CDM) is designed to standardize the format and content 
              of observational data, to enable efficient analyses across disparate data sources.
            </p>
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Core Tables</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>PERSON - demographic information</li>
                <li>OBSERVATION_PERIOD - time periods of observation</li>
                <li>VISIT_OCCURRENCE - patient encounters</li>
                <li>CONDITION_OCCURRENCE - diagnoses</li>
                <li>DRUG_EXPOSURE - medication usage</li>
                <li>PROCEDURE_OCCURRENCE - procedures</li>
                <li>MEASUREMENT - lab tests and clinical measurements</li>
                <li>OBSERVATION - observations that don't fit other domains</li>
              </ul>
            </div>
          </div>
          
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Database Connection Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Connection</p>
                <p className="text-green-600 font-medium">Connected</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Update</p>
                <p>2025-03-04 14:40:00</p>
              </div>
              <div>
                <p className="text-sm font-medium">Database Type</p>
                <p>PostgreSQL</p>
              </div>
              <div>
                <p className="text-sm font-medium">OMOP CDM Version</p>
                <p>v5.4</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
