import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Scale,
  Gavel,
  Lightbulb,
  FileText,
  Quote,
  Link2,
  Tags,
  Loader2,
  BookOpen,
  Calendar,
  MapPin,
  Layers,
} from 'lucide-react';
import { supabase, type Document, type DocType, DOC_TYPE_LABELS } from '../lib/supabase';

interface Props {
  docId: string;
  onBack: () => void;
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

export default function DocumentDetailPage({ docId, onBack, onOpenDoc }: Props) {
  const [doc, setDoc] = useState<Document | null>(null);
  const [relatedDocs, setRelatedDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'summary' | 'citations' | 'references'>('content');

  useEffect(() => {
    setLoading(true);
    supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .single()
      .then(async ({ data, error }) => {
        if (error) {
          console.error(error);
          setLoading(false);
          return;
        }
        setDoc(data);

        // Fetch related documents
        if (data?.related_docs && data.related_docs.length > 0) {
          const indices = data.related_docs.map((r: { doc_index: number; relation: string }) => r.doc_index);
          // Fetch all docs and filter by index (since we stored index, not ID)
          const { data: allDocs } = await supabase
            .from('documents')
            .select('id, title, doc_type, category, year, summary')
            .order('created_at', { ascending: true });

          if (allDocs) {
            const related = indices
              .map((idx: number) => allDocs[idx])
              .filter(Boolean) as Document[];
            setRelatedDocs(related);
          }
        }
        setLoading(false);
      });
  }, [docId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-500">Document not found</p>
        <button
          onClick={onBack}
          className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Back to Source Data
        </button>
      </div>
    );
  }

  const Icon = TYPE_ICONS[doc.doc_type];

  const tabs = [
    { key: 'content' as const, label: 'Full Text', icon: FileText },
    { key: 'summary' as const, label: 'Summary', icon: BookOpen },
    { key: 'citations' as const, label: `Citations (${doc.citations?.length || 0})`, icon: Quote },
    { key: 'references' as const, label: `References (${relatedDocs.length})`, icon: Link2 },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Source Data
      </button>

      {/* Document header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${TYPE_COLORS[doc.doc_type]}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {DOC_TYPE_LABELS[doc.doc_type]}
          </span>
        </div>
        <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {doc.title}
        </h1>

        {/* Metadata */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{doc.year}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>{doc.jurisdiction}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span>{doc.category}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>{doc.page_count} pages</span>
          </div>
        </div>

        {/* Keywords */}
        {doc.keywords && doc.keywords.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <Tags className="h-3.5 w-3.5 text-slate-400" />
            {doc.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {activeTab === 'content' && (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {doc.content}
            </p>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <BookOpen className="h-4 w-4 text-slate-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">AI-Generated Summary</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{doc.summary}</p>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Type
                  </div>
                  <div className="mt-0.5 text-sm font-medium text-slate-700">
                    {DOC_TYPE_LABELS[doc.doc_type]}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Year
                  </div>
                  <div className="mt-0.5 text-sm font-medium text-slate-700">{doc.year}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Category
                  </div>
                  <div className="mt-0.5 text-sm font-medium text-slate-700">{doc.category}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Pages
                  </div>
                  <div className="mt-0.5 text-sm font-medium text-slate-700">{doc.page_count}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'citations' && (
          <div className="space-y-3">
            {doc.citations && doc.citations.length > 0 ? (
              doc.citations.map((citation, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Quote className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {citation.type}
                    </div>
                    <div className="mt-0.5 font-mono text-sm text-slate-700">{citation.ref}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No citations available</p>
            )}
          </div>
        )}

        {activeTab === 'references' && (
          <div className="space-y-3">
            {relatedDocs.length > 0 ? (
              relatedDocs.map((relDoc, idx) => {
                const RelIcon = TYPE_ICONS[relDoc.doc_type];
                const relation = doc.related_docs?.[idx]?.relation || 'related';
                return (
                  <button
                    key={relDoc.id}
                    onClick={() => onOpenDoc(relDoc.id)}
                    className="group flex w-full items-start gap-3 rounded-lg border border-slate-200 p-4 text-left transition-all hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <RelIcon className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          {relation}
                        </span>
                        <span
                          className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${TYPE_COLORS[relDoc.doc_type]}`}
                        >
                          {DOC_TYPE_LABELS[relDoc.doc_type]}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-slate-700">
                        {relDoc.title}
                      </h4>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {relDoc.summary}
                      </p>
                    </div>
                    <Link2 className="h-4 w-4 flex-shrink-0 text-slate-300 group-hover:text-slate-500" />
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">No related documents available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
