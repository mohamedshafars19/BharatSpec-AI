import React, { useState } from 'react';
import { RelatedStandardItem } from '../types';
import { Network, BookOpen, FlaskConical, Shield, Wrench, ChevronRight, Layers } from 'lucide-react';

interface RelatedStandardsProps {
  relatedList: RelatedStandardItem[];
}

export const RelatedStandards: React.FC<RelatedStandardsProps> = ({ relatedList }) => {
  const [filterType, setFilterType] = useState<string>('All');

  if (!relatedList || relatedList.length === 0) {
    return null;
  }

  const types = ['All', 'Normative', 'Testing', 'Related'];
  const filtered = filterType === 'All' 
    ? relatedList 
    : relatedList.filter(item => item.relation_type.toLowerCase() === filterType.toLowerCase());

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'normative': return BookOpen;
      case 'testing': return FlaskConical;
      case 'safety': return Shield;
      case 'installation': return Wrench;
      default: return Layers;
    }
  };

  return (
    <div className="card-enterprise bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E2E8F0]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16745A]">
            Normative Cross-References
          </span>
          <h2 className="text-lg font-bold text-[#0B1220] font-heading mt-0.5 flex items-center gap-2">
            <Network className="w-5 h-5 text-[#E87524]" />
            <span>Associated Standards & Dependencies</span>
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                filterType === t
                  ? 'bg-[#0B1220] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((item, idx) => {
          const Icon = getIconForType(item.relation_type);
          return (
            <div
              key={idx}
              className="p-3.5 rounded-md border border-slate-200/80 bg-[#FDFDFD] hover:bg-slate-50 transition-colors flex items-start gap-3"
            >
              <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-[#0B1220]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs font-bold text-[#0B1220]">
                    {item.standard_id}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700">
                    {item.relation_type}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
