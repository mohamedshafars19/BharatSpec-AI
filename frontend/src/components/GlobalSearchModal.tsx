import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FolderKanban, BookOpen, FileSpreadsheet, Sparkles, ArrowRight, History, FileText } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { api } from '../services/api';
import { StandardRecord, Project, HistoryItem, ReportItem } from '../types';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch } = useUI();
  const [query, setQuery] = useState('');
  const [standards, setStandards] = useState<StandardRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      api.getStandards().then(setStandards).catch(() => {});
      api.getProjects().then(setProjects).catch(() => {});
      api.getHistory().then(setHistory).catch(() => {});
      api.getReports().then(setReports).catch(() => {});
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredStandards = q
    ? standards.filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.keywords.some(k => k.toLowerCase().includes(q))
      ).slice(0, 4)
    : standards.slice(0, 3);

  const filteredProjects = q
    ? projects.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))).slice(0, 3)
    : projects.slice(0, 3);

  const filteredAnalyses = q
    ? history.filter(h => h.user_requirement.toLowerCase().includes(q) || (h.category && h.category.toLowerCase().includes(q))).slice(0, 3)
    : history.slice(0, 2);

  const filteredReports = q
    ? reports.filter(r => r.title.toLowerCase().includes(q) || r.format.toLowerCase().includes(q)).slice(0, 3)
    : reports.slice(0, 2);

  const handleSelect = (url: string) => {
    closeSearch();
    navigate(url);
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={closeSearch}>
      <div
        className="bg-white rounded-lg shadow-2xl border border-[#E2DBD0] w-full max-w-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input Header */}
        <div className="p-3 border-b border-[#E2DBD0] flex items-center gap-2.5">
          <Search className="w-4 h-4 text-[#7E867B] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search standards, projects, specifications..."
            autoFocus
            className="w-full text-sm text-[#20241F] placeholder-[#7E867B] focus:outline-none bg-transparent"
          />
          <button
            onClick={closeSearch}
            className="p-1 rounded text-[#7E867B] hover:text-[#20241F] hover:bg-[#FAF7F2]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Actions */}
          {!q && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E867B] px-2 mb-1">
                Quick Actions
              </div>
              <button
                onClick={() => handleSelect('/analyze')}
                className="w-full text-left p-2 rounded hover:bg-[#FAF7F2] flex items-center justify-between text-[#20241F] font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B9A6E]" />
                  <span>Start New Specification Analysis</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#7E867B]" />
              </button>
            </div>
          )}

          {/* Standards Results */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E867B] px-2 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-[#8B9A6E]" />
              <span>Indian Standards Knowledge Base</span>
            </div>
            {filteredStandards.map(std => (
              <div
                key={std.id}
                onClick={() => handleSelect(`/standards/${std.id}`)}
                className="p-2 rounded hover:bg-[#FAF7F2] cursor-pointer flex items-center justify-between text-[#20241F] transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] bg-[#20241F] text-white px-1.5 py-0.2 rounded">
                      {std.id}
                    </span>
                    <span className="font-semibold text-xs truncate">{std.title}</span>
                  </div>
                  <div className="text-[10px] text-[#7E867B] truncate mt-0.5">{std.scope}</div>
                </div>
                <span className="badge-source text-[10px] shrink-0">{std.category}</span>
              </div>
            ))}
          </div>

          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E867B] px-2 mb-1 flex items-center gap-1.5">
                <FolderKanban className="w-3 h-3 text-[#8B9A6E]" />
                <span>Projects Workspace</span>
              </div>
              {filteredProjects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => handleSelect(`/projects/${proj.id}`)}
                  className="p-2 rounded hover:bg-[#FAF7F2] cursor-pointer flex items-center justify-between text-[#20241F] transition-colors"
                >
                  <div>
                    <div className="font-semibold text-xs">{proj.name}</div>
                    <div className="text-[10px] text-[#7E867B] truncate max-w-sm">{proj.description}</div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#8B9A6E]">{proj.readiness_score}/100</span>
                </div>
              ))}
            </div>
          )}

          {/* Analyses Results */}
          {filteredAnalyses.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E867B] px-2 mb-1 flex items-center gap-1.5">
                <History className="w-3 h-3 text-[#8B9A6E]" />
                <span>Specification Audits</span>
              </div>
              {filteredAnalyses.map(ana => (
                <div
                  key={ana.id}
                  onClick={() => handleSelect(`/analyze?id=${ana.id}`)}
                  className="p-2 rounded hover:bg-[#FAF7F2] cursor-pointer flex items-center justify-between text-[#20241F] transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-xs truncate">"{ana.user_requirement}"</div>
                    <div className="text-[10px] text-[#7E867B]">{ana.category || 'Audit'} • {ana.recommendations_count} standards</div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#557A5B] shrink-0">{ana.readiness_score || 72}/100</span>
                </div>
              ))}
            </div>
          )}

          {/* Reports Results */}
          {filteredReports.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E867B] px-2 mb-1 flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-[#8B9A6E]" />
                <span>Tender Reports</span>
              </div>
              {filteredReports.map(rep => (
                <div
                  key={rep.id}
                  onClick={() => handleSelect('/reports')}
                  className="p-2 rounded hover:bg-[#FAF7F2] cursor-pointer flex items-center justify-between text-[#20241F] transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-xs truncate">{rep.title}</div>
                    <div className="text-[10px] text-[#7E867B]">{new Date(rep.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 shrink-0">{rep.format}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#FAF7F2] border-t border-[#E2DBD0] flex items-center justify-between text-[11px] text-[#7E867B]">
          <span>Navigate with mouse or keyboard</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
