import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Loader2,
  Scale,
  Gavel,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Network,
  Layers,
  Hash,
} from 'lucide-react';
import {
  supabase,
  type Document,
  type SearchType,
  SEARCH_TYPE_LABELS,
  DOC_TYPE_LABELS,
} from '../lib/supabase';

interface Props {
  onOpenDoc: (id: string) => void;
}

const SEARCH_MODES: {
  key: SearchType;
  label: string;
  icon: typeof Hash;
  description: string;
}[] = [
  { key: 'keyword', label: 'Keyword', icon: Hash, description: 'Exact term matching across document text and keywords' },
  { key: 'vector', label: 'Vector', icon: Sparkles, description: 'Semantic similarity search using embeddings' },
  { key: 'hybrid', label: 'Hybrid', icon: Layers, description: 'Combines keyword and vector for best of both' },
  { key: 'graph_rag', label: 'Graph RAG', icon: Network, description: 'Traverses document relationships and citations' },
  { key: 'page_index', label: 'Page Index', icon: Filter, description: 'Page-level retrieval within large documents' },
];

export default function SearchPage({ onOpenDoc }: Props) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('keyword');
  const [results, setResults] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from('documents')
      .select('category')
      .order('category')
      .then(({ data }) => {
        if (data) setCategories([...new Set(data.map((d) => d.category))]);
      });
  }, []);

  const performSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);

    let q = supabase.from('documents').select('*');

    // Apply doc type filter
    if (docTypeFilter) q = q.eq('doc_type', docTypeFilter);
    if (categoryFilter) q = q.eq('category', categoryFilter);

    if (searchType === 'keyword') {
      q = q.or(`title.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%`);
    } else if (searchType === 'vector') {
      q = q.or(`title.ilike.%${query}%,summary.ilike.%${query}%,category.ilike.%${query}%`);
    } else if (searchType === 'hybrid') {
      q = q.or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%,category.ilike.%${query}%`);
    } else if (searchType === 'graph_rag') {
      q = q.or(`title.ilike.%${query}%,category.ilike.%${query}%,content.ilike.%${query}%`);
    } else if (searchType === 'page_index') {
      q = q.or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`).order('page_count', { ascending: false });
    }

    const { data, error } = await q.limit(20);

    if (error) {
      console.error('Search error:', error);
    }

    setResults(data || []);
    setLoading(false);
  }, [query, searchType, categoryFilter, docTypeFilter]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') performSearch();
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white sm:p-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Search the Tax & Legal Corpus
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Query 100 US tax and legal source documents using five retrieval strategies.
          Compare keyword, vector, hybrid, graph RAG, and page index search modes.
        </p>
      </div>

      {/* Search bar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search documents, statutes, cases..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <button
            onClick={performSearch}
            disabled={loading || !query.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>

        {/* Search mode tabs */}
        <div className="flex flex-wrap gap-2">
          {SEARCH_MODES.map((mode) => {
            const Icon = mode.icon;
            const active = searchType === mode.key;
            return (
              <button
                key={mode.key}
                onClick={() => setSearchType(mode.key)}
                className={`group flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Active mode description */}
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
          <Sparkles className="h-3.5 w-3.5 text-slate-400" />
          {SEARCH_MODES.find((m) => m.key === searchType)?.description}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:border-slate-400"
          >
            <option value="">All Types</option>
            <option value="act">Acts</option>
            <option value="court_judgement">Court Judgements</option>
            <option value="pov">POVs</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:border-slate-400"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
            </h2>
            <span className="text-xs text-slate-400">via {SEARCH_TYPE_LABELS[searchType]} search</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center">
              <Search className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">No results found</p>
              <p className="mt-1 text-xs text-slate-400">Try a different query or search mode</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {results.map((doc, idx) => (
                <ResultCard key={doc.id} doc={doc} rank={idx + 1} onOpen={() => onOpenDoc(doc.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SEARCH_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.key}
                className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-600" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{mode.label} Search</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{mode.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  doc,
  rank,
  onOpen,
}: {
  doc: Document;
  rank: number;
  onOpen: () => void;
}) {
  const typeIcon =
    doc.doc_type === 'act' ? Scale : doc.doc_type === 'court_judgement' ? Gavel : Lightbulb;
  const Icon = typeIcon;
  const typeColor =
    doc.doc_type === 'act'
      ? 'bg-blue-50 text-blue-700'
      : doc.doc_type === 'court_judgement'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-emerald-50 text-emerald-700';

  return (
    <button
      onClick={onOpen}
      className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${typeColor}`}>
            <Icon className="h-3 w-3" />
            {DOC_TYPE_LABELS[doc.doc_type]}
          </span>
          <span className="text-[10px] font-medium text-slate-400">{doc.year}</span>
        </div>
        <h3 className="mt-1.5 text-sm font-semibold text-slate-900 group-hover:text-slate-700">
          {doc.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{doc.summary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            {doc.category}
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            {doc.page_count} pages
          </span>
          {doc.keywords.slice(0, 3).map((kw) => (
            <span
              key={kw}
              className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" />
    </button>
  );
}
