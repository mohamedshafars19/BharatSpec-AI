// User & Auth
export interface User {
  id: string;
  name: string;
  organization: string;
  email: string;
  created_at?: string;
}

export interface UserLogin {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface UserSignup {
  name: string;
  organization: string;
  email: string;
  password: string;
  accept_terms: boolean;
}

export interface AuthToken {
  token: string;
  user: User;
}

// Clarifications
export interface ClarificationOption {
  id: string;
  label: string;
  value: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  context_field: string;
  options: ClarificationOption[];
  help_text?: string;
}

export interface ClarificationAnswer {
  question_id: string;
  selected_option: string;
  custom_value?: string;
}

// Structured Requirement
export interface StructuredRequirement {
  product: string;
  category: string;
  application: string;
  environment: string;
  quantity?: number | null;
  requirements: string[];
  keywords: string[];
  performance_specs?: string[];
  safety_specs?: string[];
  testing_specs?: string[];
  installation_specs?: string[];
  certification_specs?: string[];
  warranty?: string | null;
}

// Gap Audit & Readiness
export interface AuditGapItem {
  category: string;
  status: 'Complete' | 'Needs Review' | 'Missing';
  score: number;
  max_score: number;
  findings: string;
  recommendation: string;
  suggested_clauses: string[];
}

export interface ReadinessBreakdown {
  category: string;
  percentage: number;
  weight: number;
  earned: number;
  status: string;
}

export interface SpecificationAuditResult {
  readiness_score: number;
  overall_status: string;
  checklist: AuditGapItem[];
  breakdown: ReadinessBreakdown[];
  critical_missing: string[];
  summary_message: string;
}

// Standard Record
export interface StandardRecord {
  id: string;
  title: string;
  category: string;
  scope: string;
  description: string;
  keywords: string[];
  technical_requirements: string[];
  related_standards: string[];
  normative_references: string[];
  test_methods: string[];
  safety_requirements: string[];
  installation_requirements: string[];
  certification: string[];
  version: string;
  amendments: string[];
  source: string;
  verified_at?: string | null;
  data_status: string;
}

export interface RecommendationItem {
  standard_id: string;
  title: string;
  category: string;
  role_category?: 'PRIMARY' | 'SUBSYSTEM' | 'TEST_METHOD' | 'SAFETY' | 'INSTALLATION' | 'CERTIFICATION';
  match_score: number;
  applicability: string;
  why_recommended: string;
  match_criteria: string[];
  standard_details: StandardRecord;
}

export interface VersionStatusItem {
  standard_id: string;
  standard_title: string;
  referenced_version: string;
  available_version: string;
  amendments: string[];
  status: string;
  notes: string;
}

export interface RelatedStandardItem {
  standard_id: string;
  title: string;
  relation_type: string;
  description: string;
}

// Relationship Graph
export interface GraphNode {
  id: string;
  label: string;
  title: string;
  type: 'PRIMARY' | 'TEST_METHOD' | 'SAFETY' | 'INSTALLATION' | 'CERTIFICATION' | 'SUBSYSTEM' | 'NORMATIVE';
  category?: string;
  version?: string;
  data_status: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  reason: string;
}

export interface StandardGraphResponse {
  primary_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Improved Specification
export interface SpecSection {
  title: string;
  content: string;
  is_added: boolean;
  is_modified: boolean;
}

export interface ImprovedSpecification {
  title: string;
  original_text: string;
  sections: SpecSection[];
  full_markdown: string;
  applicable_standards: string[];
  improvements_made: string[];
}

// Projects
export interface ProjectItem {
  id: string;
  project_id: string;
  item_type: 'analysis' | 'standard' | 'report' | 'note';
  item_id: string;
  item_title: string;
  item_meta?: any;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  department?: string;
  reference?: string;
  status: string;
  readiness_score: number;
  requirements_count: number;
  standards_count: number;
  reports_count: number;
  open_issues: number;
  created_at: string;
  updated_at: string;
  items?: ProjectItem[];
}

// Compare
export interface StandardComparisonItem {
  field_name: string;
  values: Record<string, any>;
}

export interface CompareStandardsResponse {
  standards: StandardRecord[];
  comparison_table: StandardComparisonItem[];
  recommendations_summary: string;
}

// Analysis Request / Response
export interface AnalyzeRequest {
  requirement: string;
  project_id?: string;
  category?: string;
  application?: string;
  technical_specs?: string;
  quantity?: number;
  clarifications?: ClarificationAnswer[];
}

export interface AnalyzeResponse {
  analysis_id: string;
  project_id?: string;
  user_requirement: string;
  structured_requirement: StructuredRequirement;
  clarifying_questions: ClarificationQuestion[];
  audit: SpecificationAuditResult;
  recommendations: RecommendationItem[];
  grouped_recommendations?: Record<string, RecommendationItem[]>;
  related_standards: RelatedStandardItem[];
  version_status: VersionStatusItem[];
  graph?: StandardGraphResponse;
  improved_specification?: ImprovedSpecification;
  disclaimer: string;
  mode: string;
  created_at: string;
}

// Dashboard & Attention
export interface AttentionItem {
  id: string;
  type: string;
  title: string;
  description: string;
  analysis_id?: string;
  action_label: string;
}

export interface DashboardOverview {
  user_name: string;
  organization: string;
  recent_analyses: HistoryItem[];
  projects: Project[];
  attention_required: AttentionItem[];
  stats: {
    active_projects: number;
    total_analyses: number;
    standards_catalogued: number;
    avg_readiness: number;
  };
}

export interface HistoryItem {
  id: string;
  user_requirement: string;
  category: string;
  recommendations_count: number;
  readiness_score?: number;
  status?: string;
  top_standard?: string | null;
  created_at: string;
}

export interface ReportItem {
  id: string;
  user_id: string;
  project_id?: string;
  analysis_id?: string;
  title: string;
  format: string;
  created_at: string;
  content_json?: any;
}

export interface SavedStandardItem {
  id: string;
  standard_id: string;
  notes?: string;
  created_at: string;
  standard: StandardRecord;
}

export interface HealthResponse {
  status: string;
  mode: string;
  total_standards: number;
  faiss_indexed: boolean;
  gemini_configured: boolean;
  version: string;
}
