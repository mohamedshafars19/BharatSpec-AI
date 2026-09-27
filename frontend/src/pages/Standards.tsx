import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Check, Plus, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';
import { StandardRecord } from '../types';
import { CompareStandardsModal } from '../components/CompareStandardsModal';
import { SaveToProjectModal } from '../components/SaveToProjectModal';

export const Standards: React.FC = () => {
  const navigate = useNavigate();
  const [standards, setStandards] = useState<StandardRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'id' | 'title' | 'status'>('id');

  // Multi-select for Compare
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  // Quick Save Modal
  const [saveTarget, setSaveTarget] = useState<StandardRecord | null>(null);

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getStandards();
      setStandards(data);
    } catch (err: any) {
      console.error('Error fetching standards:', err);
      setError(err?.message || 'Failed to connect to standards service. Please verify the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    standards.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ['All', ...Array.from(set)];
  }, [standards]);

  const filtered = useMemo(() => {
    let result = [...standards];

    if (category !== 'All') {
      result = result.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter((s) => s.data_status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.scope.toLowerCase().includes(q) ||
          s.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'status') return a.data_status.localeCompare(b.data_status);
      return a.id.localeCompare(b.id);
    });

    return result;
  }, [standards, category, statusFilter, search, sortBy]);

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE2D6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#557A5B]">
              Standards Repository
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#20241F]">
            Indian Standards Explorer
          </h1>
          <p className="text-xs sm:text-sm text-[#20241F]/70 mt-1">
            Search, filter, and inspect structured Indian Standard specifications, testing schedules, and normative codes.
          </p>
        </div>

        {selectedForCompare.length > 0 && (
          <button
            type="button"
            onClick={() => setIsCompareOpen(true)}
            className="px-4 py-2 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start md:self-auto flex items-center gap-1.5"
          >
            <span>Compare Selected ({selectedForCompare.length} / 3) →</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#EAE2D6] shadow-xs flex flex-col lg:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Standard ID (e.g. IS 10322), product, application, or test method..."
            className="w-full pl-3 pr-4 py-2 text-xs rounded-lg border border-[#EAE2D6] bg-[#FAF7F2] focus:bg-white text-[#20241F] focus:outline-none focus:ring-1 focus:ring-[#8B9A6E] transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Category:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-[#EAE2D6] bg-white text-[#20241F] focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-[#EAE2D6] bg-white text-[#20241F] focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
          >
            <option value="All">All Statuses</option>
            <option value="verified">Verified Records</option>
            <option value="demo">Demo / Synthetic</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs px-3 py-2 rounded-lg border border-[#EAE2D6] bg-white text-[#20241F] focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
          >
            <option value="id">Standard ID</option>
            <option value="title">Title (A-Z)</option>
            <option value="status">Data Status</option>
          </select>
        </div>
      </div>

      {/* Grid of Standard Cards */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-gray-400 space-y-2">
          <div className="w-8 h-8 border-2 border-[#8B9A6E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading standards catalogue...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadStandards}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : standards.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-[#EAE2D6] space-y-3">
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            No Standards in Repository
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            The standards knowledge base is currently empty.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-[#EAE2D6] space-y-3">
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            No Standards Match Your Query
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search keywords or clearing active category and status filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('All');
              setStatusFilter('All');
            }}
            className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F7F2EB] border border-[#EAE2D6] rounded text-xs font-semibold text-[#20241F]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((std) => {
            const isSelected = selectedForCompare.includes(std.id);

            return (
              <div
                key={std.id}
                onClick={() => navigate(`/standards/${std.id}`)}
                className="bg-white p-5 rounded-xl border border-[#EAE2D6] hover:border-[#8B9A6E] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-[#20241F] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#EAE2D6]">
                      {std.id}
                    </span>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                        std.data_status === 'verified'
                          ? 'border-[#557A5B]/30 bg-[#F0FFF4] text-[#22543D]'
                          : 'border-[#B7791F]/30 bg-[#FFFBEB] text-[#92400E]'
                      }`}
                    >
                      {std.data_status}
                    </span>
                  </div>

                  <h3 className="font-serif text-sm font-bold text-[#20241F] group-hover:text-[#557A5B] transition-colors mb-1.5 line-clamp-2">
                    {std.title}
                  </h3>

                  <p className="text-xs text-[#20241F]/70 line-clamp-3 mb-3 leading-relaxed">
                    {std.scope}
                  </p>

                  {/* Keywords tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {std.keywords?.slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#20241F]/80 font-mono"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EAE2D6] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => toggleCompare(std.id, e)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors inline-flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#8B9A6E] text-white border-[#8B9A6E]'
                          : 'bg-white text-gray-600 border-[#EAE2D6] hover:bg-gray-50'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3 text-white" />
                          <span>Compare</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Compare</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSaveTarget(std);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded border border-[#EAE2D6] bg-white text-gray-600 hover:bg-gray-50"
                    >
                      Save
                    </button>
                  </div>

                  <span className="text-[#8B9A6E] font-semibold text-[11px] group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compare Modal */}
      <CompareStandardsModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        initialStandardIds={selectedForCompare}
        allStandards={standards}
      />

      {/* Save Modal */}
      {saveTarget && (
        <SaveToProjectModal
          isOpen={Boolean(saveTarget)}
          onClose={() => setSaveTarget(null)}
          itemType="standard"
          itemId={saveTarget.id}
          itemTitle={saveTarget.title}
          itemMeta={{ category: saveTarget.category, version: saveTarget.version }}
        />
      )}
    </div>
  );
};
