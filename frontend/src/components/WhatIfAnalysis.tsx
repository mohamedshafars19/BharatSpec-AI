import React, { useState } from 'react';
import { Building2, Sun, Waves, Factory, ArrowRight } from 'lucide-react';

interface WhatIfAnalysisProps {
  currentEnvironment?: string;
  currentApplication?: string;
  onApplyContext: (newEnv: string, newApp: string) => void;
}

export const WhatIfAnalysis: React.FC<WhatIfAnalysisProps> = ({
  currentEnvironment = 'Outdoor',
  currentApplication = 'Municipal roads',
  onApplyContext,
}) => {
  const [selectedEnv, setSelectedEnv] = useState<string>(currentEnvironment);
  const [selectedApp, setSelectedApp] = useState<string>(currentApplication);
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  const environments = [
    { id: 'Normal', label: 'Normal Indoor', icon: Building2 },
    { id: 'Outdoor', label: 'General Outdoor', icon: Sun },
    { id: 'Coastal', label: 'Coastal / High Salinity', icon: Waves },
    { id: 'Industrial', label: 'Industrial / Corrosive', icon: Factory },
  ];

  const applications = [
    { id: 'Municipal roads', label: 'Municipal Street / Urban' },
    { id: 'Highway', label: 'National Highway / Expressway' },
    { id: 'Campus', label: 'Institutional Campus' },
    { id: 'Industrial Area', label: 'Heavy Industrial Complex' },
  ];

  const handleEnvChange = (env: string) => {
    setSelectedEnv(env);
    setHasChanged(env !== currentEnvironment || selectedApp !== currentApplication);
  };

  const handleAppChange = (app: string) => {
    setSelectedApp(app);
    setHasChanged(selectedEnv !== currentEnvironment || app !== currentApplication);
  };

  // Determine dynamic consequences
  const getConsequences = () => {
    const impacts = [];
    const standards = [];

    if (selectedEnv === 'Coastal') {
      impacts.push({
        title: 'Corrosion & Salt Spray Rigor',
        detail: 'Requires minimum 1,000 hrs salt spray test per IS 9000 (Part 11) and marine-grade C5-M powder coating.',
        badge: 'High Impact',
        badgeColor: '#B94A48',
      });
      impacts.push({
        title: 'Ingress Protection Upgrade',
        detail: 'Enclosure rating must be upgraded to IP66/IP67 hermetically sealed optical chamber per IS/IEC 60529.',
        badge: 'Critical',
        badgeColor: '#B7791F',
      });
      standards.push('IS 9000 (Part 11)', 'IS/IEC 60529 (IP66)', 'IS 16107 (Part 2/Sec 1)');
    } else if (selectedEnv === 'Industrial') {
      impacts.push({
        title: 'Chemical & Thermal Endurance',
        detail: 'Must sustain ambient temperatures up to 55°C and withstand sulfur/acidic ambient vapors.',
        badge: 'High Impact',
        badgeColor: '#B94A48',
      });
      impacts.push({
        title: 'Vibration & Mechanical Stress',
        detail: 'Heavy mechanical impact protection IK09 / IK10 required under IS 10322.',
        badge: 'Mechanical',
        badgeColor: '#B7791F',
      });
      standards.push('IS 10322 (Part 5/Sec 2)', 'IS/IEC 62262 (IK10)');
    } else if (selectedEnv === 'Outdoor') {
      impacts.push({
        title: 'Weatherproof Enclosure & Surge Protection',
        detail: 'Minimum IP65 ingress protection and 10 kV internal surge protection device (SPD) mandatory.',
        badge: 'Standard Outdoor',
        badgeColor: '#557A5B',
      });
      standards.push('IS 10322 (Part 5/Sec 3)', 'IS 16103 (Part 1)');
    } else {
      impacts.push({
        title: 'Indoor Comfort & Photobiological Safety',
        detail: 'Focus shifts to Unified Glare Rating (UGR < 19) and photobiological safety under IS 16108.',
        badge: 'Indoor Ergonomics',
        badgeColor: '#707E55',
      });
      standards.push('IS 16108 (Photobiological)', 'IS 10322 (Part 5/Sec 1)');
    }

    if (selectedApp === 'Highway') {
      impacts.push({
        title: 'Luminance Uniformity for High Speed (M1/M2 Class)',
        detail: 'Requires stricter overall luminance uniformity (Uo ≥ 0.40) and longitudinal uniformity (Ul ≥ 0.70) per IS 1944.',
        badge: 'Tender Clause',
        badgeColor: '#557A5B',
      });
      standards.push('IS 1944 (Code of Practice for Lighting)');
    }

    return { impacts, standards };
  };

  const { impacts, standards } = getConsequences();

  return (
    <div className="bg-white border border-[#EAE2D6] rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[#EAE2D6] bg-[#F7F2EB] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B7791F]" />
            <h3 className="font-serif text-lg font-semibold text-[#20241F]">
              What-If Specification Analysis
            </h3>
            {hasChanged && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFFBEB] border border-[#B7791F]/30 text-[#92400E] font-medium animate-pulse">
                Context Changed
              </span>
            )}
          </div>
          <p className="text-xs text-[#20241F]/70 mt-1">
            Simulate how changes in operating environment or procurement application trigger new mandatory Indian Standards.
          </p>
        </div>

        {hasChanged && (
          <button
            type="button"
            onClick={() => {
              onApplyContext(selectedEnv, selectedApp);
              setHasChanged(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#557A5B] hover:bg-[#436248] text-white text-xs font-medium transition-colors shadow-sm"
          >
            Apply Context to Analysis →
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Toggle selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Operating Environment */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#20241F]/80 mb-2">
              Operating Environment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {environments.map((env) => {
                const isSelected = selectedEnv === env.id;
                const Icon = env.icon;
                return (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => handleEnvChange(env.id)}
                    className={`p-3 rounded-lg border text-left transition-all text-xs ${
                      isSelected
                        ? 'border-[#8B9A6E] bg-[#F7F8F5] ring-1 ring-[#8B9A6E] text-[#20241F] font-semibold'
                        : 'border-[#EAE2D6] bg-white hover:border-[#8B9A6E]/50 text-[#20241F]/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-[#8B9A6E]" />
                      <span>{env.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Application Context */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#20241F]/80 mb-2">
              Procurement Application
            </label>
            <div className="grid grid-cols-2 gap-2">
              {applications.map((app) => {
                const isSelected = selectedApp === app.id;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleAppChange(app.id)}
                    className={`p-3 rounded-lg border text-left transition-all text-xs ${
                      isSelected
                        ? 'border-[#8B9A6E] bg-[#F7F8F5] ring-1 ring-[#8B9A6E] text-[#20241F] font-semibold'
                        : 'border-[#EAE2D6] bg-white hover:border-[#8B9A6E]/50 text-[#20241F]/80'
                    }`}
                  >
                    {app.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Consequences Panel */}
        <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EAE2D6]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#20241F] uppercase tracking-wider">
              Projected Specification Impacts for "{selectedEnv}" + "{selectedApp}"
            </span>
            <span className="text-[11px] text-[#20241F]/60">
              Deterministic standards rules
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {impacts.map((imp, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-lg border border-[#EAE2D6] text-xs shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#20241F]">{imp.title}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium text-white"
                    style={{ backgroundColor: imp.badgeColor }}
                  >
                    {imp.badge}
                  </span>
                </div>
                <p className="text-[#20241F]/70 text-[11px] leading-relaxed">
                  {imp.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs pt-2 border-t border-[#EAE2D6]">
            <span className="font-semibold text-[#20241F]">
              Mandatory Referenced Standards Triggered:
            </span>
            {standards.map((std, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-white border border-[#8B9A6E]/40 font-mono text-[11px] font-medium text-[#20241F]"
              >
                {std}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
