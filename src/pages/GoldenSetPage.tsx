import { useState, useEffect, useCallback } from 'react';
import {
  ListChecks,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Hash,
  Sparkles,
  Layers,
  Network,
  Filter,
} from 'lucide-react';
import {
  supabase,
  type GoldenSetEntry,
  type SearchType,
  type Difficulty,
  SEARCH_TYPE_LABELS,
} from '../lib/supabase';

interface Props {
  onOpenDoc: (id: string) => void;
}

const SEARCH_ICONS: Record<SearchType, typeof Hash> = {
  keyword: Hash,
  vector: Sparkles,
  hybrid: Layers,
  graph_rag: Network,
  page_index: Filter,
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  hard: 'bg-red-50 text-red-700 border-red-200',
};

const SEARCH_COLORS: Record<SearchType, string> = {
  keyword: 'bg-slate-100 text-slate-700',
  vector: 'bg-violet-50 text-violet-700',
  hybrid: 'bg-blue-50 text-blue-700',
  graph_rag: 'bg-cyan-50 text-cyan-700',
  page_index: 'bg-orange-50 text-orange-700',
};

export default function GoldenSetPage({ onOpenDoc }: Props) {
  const [entries, setEntries] = useState<GoldenSetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchTypeFilter, setSearchTypeFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('search_golden_set', {
      search_query: search.trim(),
      search_type_filter: searchTypeFilter || null,
      difficulty_filter: difficultyFilter || null,
      page_offset: page * PAGE_SIZE,
      page_limit: PAGE_SIZE,
    });
    if (error) console.error(error);
    setEntries((data as GoldenSetEntry[]) || []);
    setLoading(false);
  }, [searchTypeFilter, difficultyFilter, search, page]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    setPage(0);
  }, [searchTypeFilter, difficultyFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Golden Set</h1>
        <p className="mt-1 text-sm text-slate-500">
          100 curated question-answer pairs for evaluating RAG retrieval quality across all search modes
        </p>
      </div>

      {/* Stats by search type */}
      <div className="grid grid-cols-5 gap-2">
        {(['keyword', 'vector', 'hybrid', 'graph_rag', 'page_index'] as SearchType[]).map((st) => {
          const Icon = SEARCH_ICONS[st];
          return (
            <div
              key={st}
              onClick={() => setSearchTypeFilter(searchTypeFilter === st ? '' : st)}
              className={`cursor-pointer rounded-lg border p-3 text-center transition-all ${
                searchTypeFilter === st
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <Icon className="mx-auto h-4 w-4" />
              <div className="mt-1 text-[10px] font-semibold">{SEARCH_TYPE_LABELS[st]}</div>
              <div className="text-lg font-bold">20</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or answers..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 outline-none focus:border-slate-400"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Entries */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <ListChecks className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">No entries found</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {entries.map((entry, idx) => {
              const expanded = expandedId === entry.id;
              const SearchIcon = SEARCH_ICONS[entry.search_type];
              return (
                <div
                  key={entry.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <button
                    onClick={() => setExpandedId(expanded ? null : entry.id)}
                    className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                      {page * PAGE_SIZE + idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${SEARCH_COLORS[entry.search_type]}`}
                        >
                          <SearchIcon className="h-3 w-3" />
                          {SEARCH_TYPE_LABELS[entry.search_type]}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${DIFFICULTY_COLORS[entry.difficulty]}`}
                        >
                          {entry.difficulty}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {entry.category}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-slate-900">{entry.query}</p>
                      {expanded && (
                        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Ground Truth Answer
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600">
                              {entry.answer}
                            </p>
                          </div>
                          {entry.source_doc_ids && entry.source_doc_ids.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                Source Documents
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {entry.source_doc_ids.map((docId) => (
                                  <button
                                    key={docId}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenDoc(docId);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                                  >
                                    <FileText className="h-3 w-3" />
                                    View Document
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {expanded ? (
                      <ChevronUp className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400">Page {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={entries.length < PAGE_SIZE}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
