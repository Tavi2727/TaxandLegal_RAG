import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Scale,
  Gavel,
  Lightbulb,
  Search,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { supabase, type Document, type DocType, DOC_TYPE_LABELS } from '../lib/supabase';

interface Props {
  onOpenDoc: (id: string) => void;
}

const TYPE_ICONS: Record<DocType, typeof Scale> = {
  act: Scale,
  court_judgement: Gavel,
  pov: Lightbulb,
};

const TYPE_COLORS: Record<DocType, string> = {
  act: 'bg-blue-50 text-blue-700 border-blue-200',
  court_judgement: 'bg-amber-50 text-amber-700 border-amber-200',
  pov: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function DocumentsPage({ onOpenDoc }: Props) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('documents').select('*');

    if (typeFilter) q = q.eq('doc_type', typeFilter);
    if (categoryFilter) q = q.eq('category', categoryFilter);
    if (search.trim()) {
      q = q.or(`title.ilike.%${search}%,category.ilike.%${search}%`);
    }

    q = q.order('year', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, error } = await q;
    if (error) console.error(error);
    setDocs(data || []);
    setLoading(false);
  }, [typeFilter, categoryFilter, search, page]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  useEffect(() => {
    supabase
      .from('documents')
      .select('category')
      .order('category')
      .then(({ data }) => {
        if (data) setCategories([...new Set(data.map((d) => d.category))]);
      });
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [typeFilter, categoryFilter, search]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Source Data</h1>
        <p className="mt-1 text-sm text-slate-500">
          100 US tax and legal source documents across acts, court judgements, and professional viewpoints
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(['act', 'court_judgement', 'pov'] as DocType[]).map((type) => {
          const Icon = TYPE_ICONS[type];
          return (
            <div
              key={type}
              className={`rounded-xl border p-4 ${TYPE_COLORS[type]}`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-semibold">{DOC_TYPE_LABELS[type]}s</span>
              </div>
              <div className="mt-1 text-2xl font-bold">
                {type === 'act' ? 50 : type === 'court_judgement' ? 40 : 10}
              </div>
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
            placeholder="Filter by title or category..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 outline-none focus:border-slate-400"
        >
          <option value="">All Types</option>
          <option value="act">Acts</option>
          <option value="court_judgement">Court Judgements</option>
          <option value="pov">POVs</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 outline-none focus:border-slate-400"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Document grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <FileText className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">No documents found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => {
              const Icon = TYPE_ICONS[doc.doc_type];
              return (
                <button
                  key={doc.id}
                  onClick={() => onOpenDoc(doc.id)}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${TYPE_COLORS[doc.doc_type]}`}
                    >
                      <Icon className="h-3 w-3" />
                      {DOC_TYPE_LABELS[doc.doc_type]}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">{doc.year}</span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-slate-700">
                    {doc.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500">
                    {doc.summary}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {doc.category}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-slate-500" />
                  </div>
                </button>
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
              disabled={docs.length < PAGE_SIZE}
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
