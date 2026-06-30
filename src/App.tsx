import { useState, useEffect, useCallback } from 'react';
import { Scale, Search, FileText, ListChecks, BookOpen, Menu, X } from 'lucide-react';
import { supabase } from './lib/supabase';
import SearchPage from './pages/SearchPage';
import DocumentsPage from './pages/DocumentsPage';
import GoldenSetPage from './pages/GoldenSetPage';
import DocumentDetailPage from './pages/DocumentDetailPage';

type Page =
  | { name: 'search' }
  | { name: 'documents' }
  | { name: 'golden' }
  | { name: 'document'; id: string };

export default function App() {
  const [page, setPage] = useState<Page>({ name: 'search' });
  const [docCount, setDocCount] = useState<number | null>(null);
  const [goldenCount, setGoldenCount] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const fetchCounts = useCallback(async () => {
    const [d, g] = await Promise.all([
      supabase.from('documents').select('*', { count: 'exact', head: true }),
      supabase.from('golden_set').select('*', { count: 'exact', head: true }),
    ]);
    if (d.count !== null) setDocCount(d.count);
    if (g.count !== null) setGoldenCount(g.count);
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const navItems: { key: string; label: string; icon: typeof Search; badge?: number | null }[] = [
    { key: 'search', label: 'Search', icon: Search },
    { key: 'documents', label: 'Source Data', icon: FileText, badge: docCount },
    { key: 'golden', label: 'Golden Set', icon: ListChecks, badge: goldenCount },
  ];

  const isActive = (key: string) => {
    if (key === 'documents') return page.name === 'documents' || page.name === 'document';
    return page.name === key;
  };

  const handleNavigate = (key: string) => {
    setPage({ name: key as Page['name'] } as Page);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => handleNavigate('search')}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Scale className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold leading-tight tracking-tight">TaxLegal RAG</div>
              <div className="text-[11px] leading-tight text-slate-500">Research Platform</div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.key)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive(item.key)
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive(item.key)
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.key)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.key)
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive(item.key)
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {page.name === 'search' && <SearchPage onOpenDoc={(id) => setPage({ name: 'document', id })} />}
        {page.name === 'documents' && (
          <DocumentsPage onOpenDoc={(id) => setPage({ name: 'document', id })} />
        )}
        {page.name === 'golden' && (
          <GoldenSetPage onOpenDoc={(id) => setPage({ name: 'document', id })} />
        )}
        {page.name === 'document' && (
          <DocumentDetailPage
            docId={page.id}
            onBack={() => setPage({ name: 'documents' })}
            onOpenDoc={(id) => setPage({ name: 'document', id })}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>US Tax & Legal RAG Research Platform</span>
            </div>
            <div>{docCount ?? '--'} source documents · {goldenCount ?? '--'} golden set entries</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
