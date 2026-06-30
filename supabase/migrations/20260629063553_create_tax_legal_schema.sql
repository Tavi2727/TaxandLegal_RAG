/*
# Tax & Legal RAG Platform — Initial Schema

## Overview
Creates the core tables for a US Tax & Legal document research platform supporting
multiple search types (keyword, vector, hybrid, graph RAG, page index) and a golden
evaluation set for RAG quality assessment.

## New Tables

### 1. `documents`
The primary source document corpus (100 documents across Acts, Court Judgements, POVs).
- `id` uuid PK
- `title` text
- `doc_type` text — one of: 'act', 'court_judgement', 'pov'
- `category` text — legal/tax area
- `jurisdiction` text
- `year` int
- `content` text — full document text
- `summary` text
- `citations` jsonb — cited statutes/cases
- `related_docs` jsonb — related document references
- `keywords` text[] — keyword tags
- `page_count` int
- `created_at` timestamptz

### 2. `golden_set`
100 curated query→answer pairs for evaluating RAG retrieval quality.
- `id` uuid PK
- `query` text
- `answer` text
- `source_doc_ids` uuid[]
- `search_type` text
- `difficulty` text
- `category` text
- `created_at` timestamptz

## Security
- RLS enabled; public read via anon + authenticated (no sign-in required)
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  doc_type text NOT NULL CHECK (doc_type IN ('act', 'court_judgement', 'pov')),
  category text NOT NULL,
  jurisdiction text NOT NULL DEFAULT 'US Federal',
  year int NOT NULL,
  content text NOT NULL,
  summary text NOT NULL,
  citations jsonb NOT NULL DEFAULT '[]',
  related_docs jsonb NOT NULL DEFAULT '[]',
  keywords text[] NOT NULL DEFAULT '{}',
  page_count int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS golden_set (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  answer text NOT NULL,
  source_doc_ids uuid[] NOT NULL DEFAULT '{}',
  search_type text NOT NULL DEFAULT 'keyword' CHECK (search_type IN ('keyword', 'vector', 'hybrid', 'graph_rag', 'page_index')),
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE golden_set ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_documents" ON documents;
CREATE POLICY "anon_select_documents" ON documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_golden_set" ON golden_set;
CREATE POLICY "anon_select_golden_set" ON golden_set FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_year ON documents(year);
CREATE INDEX IF NOT EXISTS idx_golden_set_category ON golden_set(category);
CREATE INDEX IF NOT EXISTS idx_golden_set_difficulty ON golden_set(difficulty);
