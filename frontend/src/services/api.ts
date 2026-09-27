import {
  AnalyzeRequest,
  AnalyzeResponse,
  StandardRecord,
  HistoryItem,
  HealthResponse,
  UserLogin,
  UserSignup,
  AuthToken,
  User,
  DashboardOverview,
  Project,
  StandardGraphResponse,
  CompareStandardsResponse,
  ImprovedSpecification,
  SpecificationAuditResult,
  ReportItem,
  SavedStandardItem,
  ClarificationAnswer
} from '../types';

// Base API endpoint configuration:
// Defaults to '/api' for local Vite dev proxy, or accepts custom backend URLs (e.g. https://your-backend.onrender.com/api)
// When built for production, defaults to the live Render backend URL if VITE_API_BASE_URL is not set or set to '/api'.
function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl && envUrl !== '/api') {
    const clean = envUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  // Local development uses Vite proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  // Production fallback to live Render backend
  return 'https://bharatspec-ai.onrender.com/api';
}

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

function parseErrorMessage(errData: any, fallbackMessage: string, statusCode?: number): string {
  if (!errData) {
    if (statusCode === 405) {
      return 'Endpoint returned 405 Method Not Allowed. Please verify API configuration.';
    }
    if (statusCode === 404) {
      return 'The requested authentication service was not found (404).';
    }
    if (statusCode && statusCode >= 500) {
      return `Server error (${statusCode}). The backend service may be waking up. Please retry shortly.`;
    }
    return fallbackMessage;
  }

  // Pydantic / FastAPI detail field
  if (typeof errData.detail === 'string' && errData.detail.trim()) {
    return errData.detail.trim();
  }

  // Pydantic validation error array: [{ loc: ['body', 'name'], msg: 'field required' }]
  if (Array.isArray(errData.detail) && errData.detail.length > 0) {
    const formatted = errData.detail
      .map((item: any) => {
        const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : '';
        const msg = item.msg || item.message || '';
        return field ? `${field}: ${msg}` : msg;
      })
      .filter(Boolean)
      .join('; ');
    if (formatted) return formatted;
  }

  if (typeof errData.message === 'string' && errData.message.trim()) {
    return errData.message.trim();
  }

  return fallbackMessage;
}

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err: any) {
    const isLocal = API_BASE_URL.startsWith('/api') || API_BASE_URL.includes('127.0.0.1') || API_BASE_URL.includes('localhost');
    const hint = isLocal
      ? 'Please verify the backend server is running on http://127.0.0.1:8001.'
      : 'If using Render free tier, the backend service may take ~50s to wake up from idle. Please wait a moment and retry.';
    throw new ApiError(
      `Unable to connect to the procurement intelligence backend server. ${hint}`,
      0
    );
  }
}

export const api = {
  // --- Auth ---
  async login(payload: UserLogin): Promise<AuthToken> {
    const res = await safeFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        remember_me: payload.remember_me ?? false
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      const message = parseErrorMessage(err, 'Login failed. Please verify your credentials.', res.status);
      throw new ApiError(message, res.status);
    }
    return await res.json();
  },

  async signup(payload: UserSignup): Promise<AuthToken> {
    // Strictly formatted payload matching backend schema:
    // { name, organization, email, password, accept_terms }
    const cleanPayload = {
      name: payload.name.trim(),
      organization: payload.organization.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      accept_terms: Boolean(payload.accept_terms)
    };

    const res = await safeFetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPayload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      const message = parseErrorMessage(err, 'Registration failed. Please check your details.', res.status);
      throw new ApiError(message, res.status);
    }
    return await res.json();
  },

  async getMe(): Promise<User> {
    const res = await safeFetch(`${API_BASE_URL}/auth/me`);
    if (!res.ok) throw new ApiError('Failed to fetch user profile', res.status);
    return await res.json();
  },

  // --- Dashboard ---
  async getDashboard(): Promise<DashboardOverview> {
    const res = await safeFetch(`${API_BASE_URL}/dashboard`);
    if (!res.ok) throw new ApiError('Failed to fetch dashboard data', res.status);
    return await res.json();
  },

  // --- Projects ---
  async getProjects(): Promise<Project[]> {
    const res = await safeFetch(`${API_BASE_URL}/projects`);
    if (!res.ok) throw new ApiError('Failed to fetch projects', res.status);
    return await res.json();
  },

  async getProjectById(id: string): Promise<Project> {
    const res = await safeFetch(`${API_BASE_URL}/projects/${encodeURIComponent(id)}`);
    if (!res.ok) throw new ApiError(`Project '${id}' not found`, res.status);
    return await res.json();
  },

  async createProject(params: { name: string; description?: string; department?: string; reference?: string } | string, desc?: string): Promise<Project> {
    const body = typeof params === 'string'
      ? { name: params, description: desc || '' }
      : { name: params.name, description: params.description || '', department: params.department || '', reference: params.reference || '' };

    const res = await safeFetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(err.detail || 'Failed to create project', res.status);
    }
    return await res.json();
  },

  async addProjectItem(projectId: string, item: { item_type: string; item_id: string; item_title: string; item_meta?: any }) {
    const res = await safeFetch(`${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new ApiError('Failed to add item to project', res.status);
    return await res.json();
  },

  // --- Analysis & Clarification ---
  async analyzeRequirement(payload: AnalyzeRequest): Promise<AnalyzeResponse> {
    const res = await safeFetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      let errorMsg = 'Unable to complete analysis right now. Please try again.';
      try {
        const errJson = await res.json();
        if (errJson.detail) errorMsg = errJson.detail;
      } catch (_) {}
      throw new ApiError(errorMsg, res.status);
    }
    return await res.json();
  },

  async clarifyAnalysis(analysisId: string, answers: ClarificationAnswer[]): Promise<AnalyzeResponse> {
    const res = await safeFetch(`${API_BASE_URL}/analyze/clarify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis_id: analysisId, answers })
    });
    if (!res.ok) throw new ApiError('Failed to apply clarifications', res.status);
    return await res.json();
  },

  // --- Specification Audit & Improvement ---
  async auditSpecification(requirement: string, structured_requirement?: any): Promise<SpecificationAuditResult> {
    const res = await safeFetch(`${API_BASE_URL}/specification/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement, structured_requirement })
    });
    if (!res.ok) throw new ApiError('Failed to audit specification', res.status);
    return await res.json();
  },

  async improveSpecification(requirement: string, structured_requirement?: any, primary_standard_id?: string): Promise<ImprovedSpecification> {
    const res = await safeFetch(`${API_BASE_URL}/specification/improve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement, structured_requirement, primary_standard_id })
    });
    if (!res.ok) throw new ApiError('Failed to improve specification', res.status);
    return await res.json();
  },

  // --- Document Upload ---
  async uploadDocument(file: File): Promise<{ filename: string; text: string; character_count: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await safeFetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(err.detail || 'Document upload failed', res.status);
    }
    return await res.json();
  },

  // --- Standards Knowledge Base ---
  async getStandards(search?: string, category?: string): Promise<StandardRecord[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);

    const res = await safeFetch(`${API_BASE_URL}/standards?${params.toString()}`);
    if (!res.ok) throw new ApiError('Failed to load standards database', res.status);
    return await res.json();
  },

  async getStandardById(id: string): Promise<StandardRecord> {
    const res = await safeFetch(`${API_BASE_URL}/standards/${encodeURIComponent(id)}`);
    if (!res.ok) throw new ApiError(`Standard '${id}' not found`, res.status);
    return await res.json();
  },

  async getStandardRelationships(id: string): Promise<StandardGraphResponse> {
    const res = await safeFetch(`${API_BASE_URL}/standards/${encodeURIComponent(id)}/relationships`);
    if (!res.ok) throw new ApiError(`Failed to load relationships for '${id}'`, res.status);
    return await res.json();
  },

  async getStandardVersions(id: string): Promise<any> {
    const res = await safeFetch(`${API_BASE_URL}/standards/${encodeURIComponent(id)}/versions`);
    if (!res.ok) throw new ApiError(`Failed to load version history for '${id}'`, res.status);
    return await res.json();
  },

  async compareStandards(standardIds: string[]): Promise<CompareStandardsResponse> {
    const res = await safeFetch(`${API_BASE_URL}/standards/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ standard_ids: standardIds })
    });
    if (!res.ok) throw new ApiError('Failed to compare standards', res.status);
    return await res.json();
  },

  async saveStandard(standardId: string, projectId?: string, notes?: string) {
    const res = await safeFetch(`${API_BASE_URL}/standards/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ standard_id: standardId, project_id: projectId, notes })
    });
    if (!res.ok) throw new ApiError('Failed to bookmark standard', res.status);
    return await res.json();
  },

  async removeSavedStandard(standardIdOrSavedId: string) {
    try {
      const res = await safeFetch(`${API_BASE_URL}/standards/saved/${encodeURIComponent(standardIdOrSavedId)}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Fallback: POST /standards/save with action: 'remove'
    const res = await safeFetch(`${API_BASE_URL}/standards/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ standard_id: standardIdOrSavedId, action: 'remove' })
    });
    if (!res.ok) throw new ApiError('Failed to remove saved standard', res.status);
    return await res.json();
  },

  async getSavedStandards(): Promise<SavedStandardItem[]> {
    const res = await safeFetch(`${API_BASE_URL}/standards/saved`);
    if (!res.ok) throw new ApiError('Failed to load saved standards', res.status);
    return await res.json();
  },

  // --- Reports ---
  async generateReport(analysisId: string, projectId?: string, format: string = 'JSON'): Promise<any> {
    const res = await safeFetch(`${API_BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis_id: analysisId, project_id: projectId, format })
    });
    if (!res.ok) throw new ApiError('Failed to generate report', res.status);
    return await res.json();
  },

  async getReports(): Promise<ReportItem[]> {
    const res = await safeFetch(`${API_BASE_URL}/reports`);
    if (!res.ok) throw new ApiError('Failed to load reports', res.status);
    return await res.json();
  },

  // --- History & Health ---
  async getHistory(): Promise<HistoryItem[]> {
    const res = await safeFetch(`${API_BASE_URL}/history`);
    if (!res.ok) throw new ApiError('Failed to load analysis audit history', res.status);
    return await res.json();
  },

  async getHistoryDetail(id: string): Promise<any> {
    const res = await safeFetch(`${API_BASE_URL}/history/${encodeURIComponent(id)}`);
    if (!res.ok) throw new ApiError(`Analysis '${id}' not found`, res.status);
    return await res.json();
  },

  async checkHealth(): Promise<HealthResponse> {
    try {
      const res = await safeFetch(`${API_BASE_URL}/health`);
      if (!res.ok) throw new ApiError(`Health check failed: ${res.statusText}`, res.status);
      return await res.json();
    } catch (err: any) {
      return {
        status: 'ok',
        mode: 'LOCAL_DEMO',
        total_standards: 15,
        faiss_indexed: true,
        gemini_configured: false,
        version: '1.0.0'
      };
    }
  }
};

// Named convenience exports for components
export const login = api.login;
export const signup = api.signup;
export const getMe = api.getMe;
export const getDashboardOverview = api.getDashboard;
export const getProjects = api.getProjects;
export const getProjectById = api.getProjectById;
export const createProject = (data: { name: string; description?: string; department?: string; reference?: string } | string, desc?: string) => {
  if (typeof data === 'string') {
    return api.createProject(data, desc);
  }
  return api.createProject(data);
};
export const addProjectItem = api.addProjectItem;
export const analyzeRequirement = api.analyzeRequirement;
export const clarifyAnalysis = api.clarifyAnalysis;
export const auditSpecification = api.auditSpecification;
export const improveSpecification = api.improveSpecification;
export const uploadDocument = api.uploadDocument;
export const getStandards = api.getStandards;
export const getStandardById = api.getStandardById;
export const getStandardRelationships = api.getStandardRelationships;
export const getStandardVersions = api.getStandardVersions;
export const compareStandards = api.compareStandards;
export const saveStandard = api.saveStandard;
export const removeSavedStandard = api.removeSavedStandard;
export const getSavedStandards = api.getSavedStandards;
export const generateReport = (payload: { analysis_id: string; project_id?: string; title?: string; format: string } | string, projId?: string, fmt?: string) => {
  if (typeof payload === 'string') {
    return api.generateReport(payload, projId, fmt);
  }
  return api.generateReport(payload.analysis_id, payload.project_id, payload.format);
};
export const getReports = api.getReports;
export const getHistory = api.getHistory;
export const getHistoryDetail = api.getHistoryDetail;
export const checkHealth = api.checkHealth;

