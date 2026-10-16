import {
  ProductInput,
  GeneratedListing,
  ListingDocument,
  ListingListResponse,
  GenerateResponse,
  BrandProfile,
  SearchResponse,
  ReadinessResponse,
  SamplePreset,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errorBody: any = null;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = { message: res.statusText };
      }
      const message = errorBody?.detail?.message || errorBody?.detail || errorBody?.message || `HTTP ${res.status}`;
      const resolution = errorBody?.detail?.resolution;
      const err = new Error(message);
      (err as any).status = res.status;
      (err as any).resolution = resolution;
      (err as any).errorBody = errorBody;
      throw err;
    }
    if (res.status === 204) {
      return null as unknown as T;
    }
    return await res.json();
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Could not connect to Open List backend. Check if the server is running.');
    }
    throw error;
  }
}

export const api = {
  // Health & Readiness
  getHealthReady: () => request<ReadinessResponse>('/api/health/ready'),

  // Product Listings
  generateListing: (product_input: ProductInput, apply_brand_profile = true) =>
    request<GenerateResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ product_input, apply_brand_profile }),
    }),

  regenerateSection: (
    section: string,
    product_input: ProductInput,
    current_content?: string,
    custom_instruction?: string
  ) =>
    request<{ section: string; content: string | string[]; model_used: string }>(
      '/api/regenerate-section',
      {
        method: 'POST',
        body: JSON.stringify({
          section,
          product_input,
          current_content,
          custom_instruction,
        }),
      }
    ),

  getListings: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    return request<ListingListResponse>(`/api/listings?${params.toString()}`);
  },

  getListing: (id: string) => request<ListingDocument>(`/api/listings/${id}`),

  updateListing: (id: string, generated_listing: GeneratedListing, product_input?: ProductInput) =>
    request<ListingDocument>(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ generated_listing, product_input }),
    }),

  deleteListing: (id: string) =>
    request<void>(`/api/listings/${id}`, {
      method: 'DELETE',
    }),

  getSamplePresets: () => request<{ samples: SamplePreset[] }>('/api/demo/samples'),

  // Brand Profile
  getBrandProfile: () => request<BrandProfile>('/api/brand-profile'),

  updateBrandProfile: (profile: BrandProfile) =>
    request<BrandProfile>('/api/brand-profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  // Search (Semantic & Vector Search)
  searchListings: (query: string, limit = 10) =>
    request<SearchResponse>('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    }),
};
