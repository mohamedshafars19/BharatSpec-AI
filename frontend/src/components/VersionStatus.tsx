import React from 'react';
import { VersionStatusItem } from '../types';
import { History, CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';

interface VersionStatusProps {
  versionList: VersionStatusItem[];
}

export const VersionStatus: React.FC<VersionStatusProps> = ({ versionList }) => {
  if (!versionList || versionList.length === 0) return null;

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('current')) {
      return (
        <span className="badge-status-current text-xs">
          <CheckCircle className="w-3 h-3" />
          <span>{status}</span>
        </span>
      );
    }
    if (s.includes('amendment')) {
      return (
        <span className="badge-status-review text-xs">
          <Clock className="w-3 h-3" />
          <span>{status}</span>
        </span>
      );
    }
    if (s.includes('outdated')) {
      return (
        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-semibold border border-red-200">
          <AlertCircle className="w-3 h-3" />
          <span>{status}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-semibold border border-slate-200">
        <Info className="w-3 h-3" />
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="card-enterprise bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm mb-6">
      <div className="pb-4 mb-4 border-b border-[#E2E8F0]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#16745A]">
          Version & Amendment Audit
        </span>
        <h2 className="text-lg font-bold text-[#0B1220] font-heading mt-0.5 flex items-center gap-2">
          <History className="w-5 h-5 text-[#E87524]" />
          <span>Standard Life-Cycle & Revision Integrity</span>
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Verification of referenced edition against active knowledge base records to prevent reliance on superseded specifications.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#0B1220] border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Standard ID</th>
              <th className="py-2.5 px-3">Document Title</th>
              <th className="py-2.5 px-3">Catalogued Edition</th>
              <th className="py-2.5 px-3">Active Amendments</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {versionList.map((ver, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-[#0B1220] whitespace-nowrap">
                  {ver.standard_id}
                </td>
                <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate">
                  {ver.standard_title}
                </td>
                <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                  {ver.available_version}
                </td>
                <td className="py-3 px-3">
                  {ver.amendments.length > 0 ? (
                    <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      {ver.amendments.length} Amendment(s) Active
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono text-[11px]">Nil</span>
                  )}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  {getStatusBadge(ver.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
