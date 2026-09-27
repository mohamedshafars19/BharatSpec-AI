import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, FileSpreadsheet, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { ReportItem } from '../types';
import { getReports } from '../services/api';
import { useUI } from '../context/UIContext';

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getReports();
      setReports(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load procurement reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (rep: ReportItem) => {
    const content = rep.content_json?.markdown || `# ${rep.title}\nProcurement review report.`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rep.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${rep.format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded "${rep.title}"`, 'success');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE2D6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#557A5B]">
              Tender Documentation Schedule
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#20241F]">
            Procurement Reports Repository
          </h1>
          <p className="text-xs sm:text-sm text-[#20241F]/70 mt-1">
            Audit summaries, technical tender schedules, and compliance verification reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/analyze')}
          className="px-4 py-2 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start md:self-auto"
        >
          + Generate New Report
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-500 space-y-2">
          <div className="w-8 h-8 border-2 border-[#8B9A6E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading generated reports...</p>
        </div>
      ) : error ? (
        <div className="bg-[#FAF7F2] p-8 text-center rounded-xl border border-[#B94A48]/30 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FCE8E8] text-[#B94A48] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#20241F]">
              Unable to load procurement reports
            </h3>
            <p className="text-xs text-[#575E54] max-w-sm mx-auto mt-1">
              {error}
            </p>
          </div>
          <button
            onClick={loadReports}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B9A6E] text-white rounded text-xs font-semibold hover:bg-[#78875E] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[#EAE2D6] p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#8B9A6E] flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-[#20241F]">
            No Reports Generated Yet
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Run a requirement audit and click "Generate Tender Report" to download and archive specifications here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/analyze')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B9A6E] hover:bg-[#78875E] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Start an Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#EAE2D6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-[#EAE2D6]">
              <thead className="bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Report Title</th>
                  <th className="py-3.5 px-4">Generated Date</th>
                  <th className="py-3.5 px-4">Output Format</th>
                  <th className="py-3.5 px-4">Project Association</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D6]">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-[#F7F8F5] transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#20241F]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#8B9A6E]" />
                        <span>{rep.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(rep.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-4 font-mono uppercase text-gray-600">
                      <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#EAE2D6] text-[11px]">
                        {rep.format}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {rep.project_id ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/projects/${rep.project_id}`)}
                          className="text-[#8B9A6E] font-medium hover:underline"
                        >
                          View Project →
                        </button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDownload(rep)}
                        className="px-3 py-1.5 rounded-lg border border-[#EAE2D6] bg-white hover:bg-gray-50 text-xs font-medium text-[#20241F] shadow-xs"
                      >
                        Download Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
