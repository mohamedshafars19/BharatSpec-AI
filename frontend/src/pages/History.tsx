import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { HistoryItem } from '../types';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await api.getHistory();
      setHistoryItems(items);
    } catch (err: any) {
      console.error('Error fetching audit history:', err);
      setError(err?.message || 'Failed to load audit history from server.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let result = [...historyItems];

    if (filterStatus === 'Ready') {
      result = result.filter((i) => (i.readiness_score || 0) >= 80);
    } else if (filterStatus === 'Needs Review') {
      result = result.filter((i) => (i.readiness_score || 0) < 80);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.user_requirement.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.top_standard && i.top_standard.toLowerCase().includes(q))
      );
    }

    return result;
  }, [historyItems, filterStatus, search]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE2D6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#557A5B]">
              Procurement Audit Trail
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#20241F]">
            Audit History & Specification Log
          </h1>
          <p className="text-xs sm:text-sm text-[#20241F]/70 mt-1">
            Reopen previous specification reviews, inspect readiness scores, and track changes across procurement cycles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/analyze')}
          className="px-4 py-2 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start md:self-auto flex items-center gap-1.5"
        >
          <span>+</span>
          <span>New Analysis</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-xl border border-[#EAE2D6] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by requirement text, product, or standard ID..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#EAE2D6] bg-[#FAF7F2] focus:bg-white text-[#20241F] focus:outline-none focus:ring-1 focus:ring-[#8B9A6E]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-lg border border-[#EAE2D6] text-xs font-medium self-start sm:self-auto">
          {['All', 'Needs Review', 'Ready'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterStatus === status
                  ? 'bg-white text-[#20241F] shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-[#20241F]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      {error ? (
        <div className="bg-[#FAF7F2] p-8 text-center rounded-xl border border-[#B94A48]/30 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FCE8E8] text-[#B94A48] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#20241F]">
              Unable to load audit history
            </h3>
            <p className="text-xs text-[#575E54] max-w-sm mx-auto mt-1">
              {error}
            </p>
          </div>
          <button
            onClick={loadHistory}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B9A6E] text-white rounded text-xs font-semibold hover:bg-[#78875E] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : isLoading ? (
        <div className="py-20 text-center text-xs text-gray-500 space-y-2">
          <div className="w-8 h-8 border-2 border-[#8B9A6E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading audit log records...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-[#EAE2D6] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#8B9A6E] flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            No Audit Records Match
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search query or filter to view past procurement requirement audits.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#EAE2D6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-[#EAE2D6]">
              <thead className="bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Requirement Scope</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Audit Date</th>
                  <th className="py-3.5 px-4">Readiness Score</th>
                  <th className="py-3.5 px-4">Standards Matched</th>
                  <th className="py-3.5 px-4">Audit Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D6]">
                {filteredItems.map((item) => {
                  const isReady = (item.readiness_score || 0) >= 80;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/analyze?id=${item.id}`)}
                      className="hover:bg-[#F7F8F5] transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6 font-medium text-[#20241F] max-w-xs truncate">
                        "{item.user_requirement}"
                      </td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#EAE2D6] text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                        {new Date(item.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-[#20241F]">
                        {item.readiness_score || 72}/100
                      </td>
                      <td className="py-4 px-4 font-mono text-[#557A5B] font-semibold">
                        {item.recommendations_count} Standards
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${
                            isReady
                              ? 'bg-[#F0FFF4] text-[#22543D]'
                              : 'bg-[#FFFBEB] text-[#92400E]'
                          }`}
                        >
                          {isReady ? 'Ready' : 'Needs Review'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <span className="text-[#8B9A6E] font-semibold text-[11px] group-hover:underline">
                          Re-open Audit →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
