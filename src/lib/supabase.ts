import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DocType = 'act' | 'court_judgement' | 'pov';
export type SearchType = 'keyword' | 'vector' | 'hybrid' | 'graph_rag' | 'page_index';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Citation {
  type: string;
  ref: string;
}

export interface RelatedDoc {
  doc_index: number;
  relation: string;
}

export interface Document {
  id: string;
  title: string;
  doc_type: DocType;
  category: string;
  jurisdiction: string;
  year: number;
  content: string;
  summary: string;
  citations: Citation[];
  related_docs: RelatedDoc[];
  keywords: string[];
  page_count: number;
  created_at: string;
}

export interface GoldenSetEntry {
  id: string;
  query: string;
  answer: string;
  source_doc_ids: string[];
  search_type: SearchType;
  difficulty: Difficulty;
  category: string;
  created_at: string;
}

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  act: 'Act',
  court_judgement: 'Court Judgement',
  pov: 'POV',
};

export const SEARCH_TYPE_LABELS: Record<SearchType, string> = {
  keyword: 'Keyword',
  vector: 'Vector',
  hybrid: 'Hybrid',
  graph_rag: 'Graph RAG',
  page_index: 'Page Index',
};
