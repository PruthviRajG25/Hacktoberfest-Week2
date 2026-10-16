export interface ProductInput {
  product_name: string;
  category: string;
  features_and_specs: string;
  price?: number | null;
  currency: string;
  target_audience?: string;
  brand_name?: string;
  brand_voice: 'Friendly' | 'Premium' | 'Minimalist' | 'Playful' | 'Professional';
  marketplace: 'General ecommerce' | 'Etsy' | 'eBay' | 'Instagram' | 'WhatsApp';
  output_language: string;
}

export interface GeneratedListing {
  title: string;
  description: string;
  highlights: string[];
  keywords: string[];
  social_caption: string;
  call_to_action: string;
  alternative_titles: string[];
}

export interface ListingDocument {
  _id: string;
  product_input: ProductInput;
  generated_listing: GeneratedListing;
  created_at: string;
  updated_at: string;
  is_sample: boolean;
  ai_model_used?: string;
  embedding?: number[];
}

export interface ListingListResponse {
  items: ListingDocument[];
  total: number;
  page: number;
  limit: number;
}

export interface GenerateResponse {
  listing_id: string;
  product_input: ProductInput;
  generated_listing: GeneratedListing;
  model_used: string;
  provider: string;
  created_at: string;
  is_sample: boolean;
}

export interface BrandProfile {
  brand_name: string;
  description?: string;
  preferred_tone: string;
  target_audience?: string;
  preferred_terminology: string[];
  words_to_avoid: string[];
  default_language: string;
  updated_at?: string | null;
}

export interface SearchResultItem {
  id: string;
  product_name: string;
  category: string;
  title: string;
  snippet: string;
  created_at: string;
  score?: number | null;
  is_sample: boolean;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
  search_method: 'vector_search' | 'text_fallback';
  vector_search_available: boolean;
  message: string;
}

export interface ReadinessResponse {
  status: 'ready' | 'degraded' | 'offline';
  ai_provider: string;
  ai_provider_ready: boolean;
  ai_model: string;
  database_connected: boolean;
  database_type: 'mongodb_atlas' | 'in_memory_fallback';
  vector_search_configured: boolean;
  details: {
    ai_message?: string;
    database_message?: string;
    is_atlas?: boolean;
    vector_search_index?: string;
  };
}

export interface SamplePreset extends ProductInput {
  id: string;
  label: string;
}
