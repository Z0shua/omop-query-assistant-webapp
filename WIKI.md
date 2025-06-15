# Future Direction: OMOP Query Assistant

## Vision

The OMOP Query Assistant aims to become a comprehensive tool for translating natural language questions into accurate, efficient OMOP CDM SQL queries, empowering researchers and clinicians to analyze medical data without deep technical expertise.

## Current Architecture

- **All OMOP query execution and mock data fallback is handled through the backend and the `omopApiService.ts` service.** The frontend does not generate mock data directly; all queries (including mock data for development/testing) are routed through the backend or a proxy service.
- **Databricks is currently only supported for connection testing and credential management, not for query execution.** Queries are executed against supported databases (PostgreSQL, SQLite, or mock) via the backend API. Support for Databricks or other backends may be added in the future.

## Potential Features

- **Advanced NLP-to-SQL Translation**
  - Support for more complex, multi-step queries
  - Context-aware query generation (e.g., follow-up questions, query refinement)
  - Handling temporal relationships and cohort definitions

- **OMOP Vocabulary Integration**
  - Direct mapping of clinical terms to OMOP concept IDs
  - Synonym and hierarchy support for medical concepts
  - Integration with external vocabularies (SNOMED, RxNorm, LOINC)

- **Interactive Query Building**
  - Visual query builder for users to refine or adjust generated SQL
  - Step-by-step query explanation and validation

- **Result Exploration and Visualization**
  - More advanced charting and cohort comparison tools
  - Export results to common formats (CSV, Excel, JSON)

- **Collaboration and Sharing**
  - Save, share, and publish queries and results
  - Versioning and audit trails for queries

- **Security and Compliance**
  - Role-based access control
  - Audit logging for sensitive data access

## Research Directions

- **Improved NLP Models**
  - Fine-tuning LLMs on OMOP-specific question/SQL pairs
  - Incorporating user feedback for continuous improvement

- **Explainability**
  - Generating human-readable explanations for each SQL query
  - Highlighting which OMOP tables and fields are used

- **Benchmarking and Validation**
  - Automated testing of generated SQL against known datasets
  - Community-driven evaluation and improvement

## Integration Ideas

- **EHR and Data Warehouse Integration**
  - Direct connection to hospital or research OMOP databases
  - Secure, federated query execution
  - *Potential future support for Databricks and other cloud data warehouses*

- **API and Plugin Ecosystem**
  - REST API for programmatic access to NLP-to-SQL translation
  - Plugins for Jupyter, RStudio, or other analytics platforms

- **Education and Training**
  - Tutorials and guided walkthroughs for OMOP and SQL
  - Example libraries for common research questions

## Roadmap (Example)

1. **Short Term**
   - Improve accuracy of NLP-to-SQL translation
   - Add more example queries and OMOP schema documentation
   - Enhance error handling and user feedback

2. **Medium Term**
   - Integrate OMOP vocabulary and concept mapping
   - Add visual query builder and advanced result visualization
   - Support for more AI providers and database backends (potentially including Databricks)

3. **Long Term**
   - Enable collaborative features and sharing
   - Develop explainability and benchmarking tools
   - Expand to other data models and research domains

---

*This document is a living roadmap. Contributions and suggestions are welcome!* 