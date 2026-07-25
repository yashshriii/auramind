import React, { useState } from 'react';
import { KundaliHouse, NakshatraDetails, PanchangData, VimshottariDasha, PlanetaryPosition } from '../types';
import { ChevronDown, ChevronUp, Compass, Moon, Sun, Sparkles, Table, Grid, Layers } from 'lucide-react';

interface VedicKundaliChartProps {
  system?: string;
  ayanamsaDegree?: number;
  ascendantSign?: string;
  sunSign?: string;
  moonSign?: string;
  moonNakshatra?: NakshatraDetails;
  sunNakshatra?: NakshatraDetails;
  ascendantNakshatra?: NakshatraDetails;
  panchang?: PanchangData;
  vimsottariDasha?: VimshottariDasha;
  d1Chart?: KundaliHouse[];
  d9NavamshaChart?: KundaliHouse[];
  planets?: PlanetaryPosition[];
}

const PLANET_SHORT_CODES: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mercury: 'Me',
  Venus: 'Ve',
  Mars: 'Ma',
  Jupiter: 'Jp',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
  Ascendant: 'As',
};

// Jaimini Karaka calculation helper (AK, AmK, BK, MK, PK, GK, DK) based on degree in sign
function calculateJaiminiKarakas(planets: PlanetaryPosition[]): Record<string, string> {
  const main7 = planets
    .filter((p) => ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(p.name))
    .sort((a, b) => b.degreeInSign - a.degreeInSign);

  const karakaLabels = ['AK (Atmakaraka)', 'AmK (Amatyakaraka)', 'BK (Bhatrikaraka)', 'MK (Matrikaraka)', 'PK (Putrakaraka)', 'GK (Gnatikaraka)', 'DK (Darakaraka)'];
  const result: Record<string, string> = {};

  main7.forEach((p, idx) => {
    if (idx < karakaLabels.length) {
      result[p.name] = karakaLabels[idx];
    }
  });

  return result;
}

export const VedicKundaliChart: React.FC<VedicKundaliChartProps> = ({
  system = 'Vedic Sidereal (Lahiri Ayanamsa)',
  ayanamsaDegree = 23.98,
  ascendantSign,
  sunSign,
  moonSign,
  moonNakshatra,
  sunNakshatra,
  ascendantNakshatra,
  panchang,
  vimsottariDasha,
  d1Chart = [],
  d9NavamshaChart = [],
  planets = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'D1' | 'D9' | 'DUAL' | 'GRAHAS'>('D1');

  const karakas = calculateJaiminiKarakas(planets);

  // House coordinates for 400x400 North Indian Diamond Chart
  const houseCoords: Record<number, { cx: number; cy: number; rashiX: number; rashiY: number }> = {
    1:  { cx: 200, cy: 115, rashiX: 200, rashiY: 60 },
    2:  { cx: 110, cy: 60,  rashiX: 145, rashiY: 45 },
    3:  { cx: 60,  cy: 110, rashiX: 45,  rashiY: 145 },
    4:  { cx: 115, cy: 200, rashiX: 60,  rashiY: 200 },
    5:  { cx: 60,  cy: 290, rashiX: 45,  rashiY: 255 },
    6:  { cx: 110, cy: 340, rashiX: 145, rashiY: 355 },
    7:  { cx: 200, cy: 285, rashiX: 200, rashiY: 340 },
    8:  { cx: 290, cy: 340, rashiX: 255, rashiY: 355 },
    9:  { cx: 340, cy: 290, rashiX: 355, rashiY: 255 },
    10: { cx: 285, cy: 200, rashiX: 340, rashiY: 200 },
    11: { cx: 340, cy: 110, rashiX: 355, rashiY: 145 },
    12: { cx: 290, cy: 60,  rashiX: 255, rashiY: 45 },
  };

  // Helper to render North Indian Kundali Chart SVG
  const renderNorthIndianSVG = (chartData: KundaliHouse[], chartTitle: string) => {
    return (
      <div className="bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
        <div className="text-center mb-3">
          <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            {chartTitle}
          </h4>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
            Vedic Sidereal (North Indian Diamond Layout)
          </p>
        </div>

        <div className="relative w-full aspect-square max-w-[340px] mx-auto bg-[#fafafa] dark:bg-[#111113] border border-neutral-300 dark:border-neutral-700 rounded-lg p-1">
          <svg viewBox="0 0 400 400" className="w-full h-full text-neutral-900 dark:text-neutral-100 font-sans">
            {/* Outer Border */}
            <rect x="8" y="8" width="384" height="384" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-90" />
            
            {/* Diagonals */}
            <line x1="8" y1="8" x2="392" y2="392" stroke="currentColor" strokeWidth="1.2" className="opacity-40" />
            <line x1="392" y1="8" x2="8" y2="392" stroke="currentColor" strokeWidth="1.2" className="opacity-40" />
            
            {/* Inner Diamond */}
            <polygon points="200,8 392,200 200,392 8,200" fill="none" stroke="currentColor" strokeWidth="1.8" className="opacity-90" />

            {/* 12 Houses Rendering */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((houseNum) => {
              const houseObj = chartData.find((h) => h.houseNumber === houseNum);
              const coords = houseCoords[houseNum];
              if (!coords) return null;

              const rashiNum = houseObj?.rashiNumber || houseNum;
              const rawPlanetNames = houseObj?.planets || [];

              // Build list of formatted planet strings with degrees
              const planetDisplayItems: { text: string; isRetro: boolean; isLagna: boolean }[] = [];

              if (houseNum === 1 && chartTitle.includes('D1')) {
                const ascDeg = ascendantNakshatra ? Math.floor(ascendantNakshatra.degreeInNakshatra) : 15;
                planetDisplayItems.push({ text: `As ${ascDeg}°`, isRetro: false, isLagna: true });
              }

              rawPlanetNames.forEach((pName) => {
                const pShort = PLANET_SHORT_CODES[pName] || pName.substring(0, 2);
                const pData = planets.find((p) => p.name === pName);
                const deg = pData ? Math.floor(pData.degreeInSign) : 0;
                const retro = pData?.isRetrograde ? ' (R)' : '';
                planetDisplayItems.push({
                  text: `${pShort} ${deg}°${retro}`,
                  isRetro: pData?.isRetrograde || false,
                  isLagna: false,
                });
              });

              return (
                <g key={houseNum}>
                  {/* Rashi Number */}
                  <text
                    x={coords.rashiX}
                    y={coords.rashiY}
                    fill="currentColor"
                    opacity="0.5"
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {rashiNum}
                  </text>

                  {/* Planets inside House */}
                  {planetDisplayItems.length > 0 ? (
                    <g transform={`translate(${coords.cx}, ${coords.cy})`}>
                      {planetDisplayItems.map((item, idx) => {
                        const yOffset = (idx - (planetDisplayItems.length - 1) / 2) * 13;
                        return (
                          <text
                            key={idx}
                            x="0"
                            y={yOffset}
                            fill={item.isLagna ? 'currentColor' : item.isRetro ? '#ea580c' : 'currentColor'}
                            fontSize="10.5"
                            fontWeight={item.isLagna ? '800' : '600'}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {item.text}
                          </text>
                        );
                      })}
                    </g>
                  ) : (
                    <text
                      x={coords.cx}
                      y={coords.cy}
                      fill="currentColor"
                      opacity="0.15"
                      fontSize="9"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      —
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs transition-all">
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Vedic Birth Chart (Kundali)
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                Lahiri Sidereal Engine
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              D1 Rashi, D9 Navamsha, Graha Longitudes, Panchang & Vimshottari Dasha
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
          <span className="text-xs font-medium hidden sm:inline">
            {isOpen ? 'Minimize Chart' : 'View Full Kundali Chart'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-black/20 space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('D1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'D1'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-white dark:bg-[#27272a] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <Grid className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                D1 Rashi Chart
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('D9')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'D9'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-white dark:bg-[#27272a] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                D9 Navamsha
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('DUAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'DUAL'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-white dark:bg-[#27272a] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                Dual Chart View
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('GRAHAS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'GRAHAS'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-white dark:bg-[#27272a] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <Table className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                Graha Details Table
              </button>
            </div>

            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              Lahiri Ayanamsa: {ayanamsaDegree.toFixed(2)}°
            </span>
          </div>

          {/* Chart Display Area */}
          {activeTab === 'D1' && renderNorthIndianSVG(d1Chart, 'D1 Main Rashi Chart')}
          {activeTab === 'D9' && renderNorthIndianSVG(d9NavamshaChart, 'D9 Navamsha Divisional Chart')}
          {activeTab === 'DUAL' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderNorthIndianSVG(d1Chart, 'D1 Rashi Chart')}
              {renderNorthIndianSVG(d9NavamshaChart, 'D9 Navamsha Chart')}
            </div>
          )}

          {/* Graha Positions Table */}
          {activeTab === 'GRAHAS' && (
            <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Graha</th>
                    <th className="p-3">Rashi (Sign)</th>
                    <th className="p-3">Degree</th>
                    <th className="p-3">Nakshatra</th>
                    <th className="p-3">Pada</th>
                    <th className="p-3">House (D1)</th>
                    <th className="p-3">Jaimini Karaka</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium">
                  {planets.map((p) => (
                    <tr key={p.name} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40">
                      <td className="p-3 font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                        <span className="text-neutral-500 dark:text-neutral-400">{p.symbol}</span> {p.name}{' '}
                        {p.isRetrograde && (
                          <span className="text-orange-600 dark:text-orange-400 font-mono text-[10px] font-bold px-1 rounded bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900">
                            (R)
                          </span>
                        )}
                      </td>
                      <td className="p-3">{p.sign}</td>
                      <td className="p-3 font-mono text-neutral-600 dark:text-neutral-400">{p.degreeInSign.toFixed(2)}°</td>
                      <td className="p-3">{p.nakshatra || '—'}</td>
                      <td className="p-3 font-mono font-bold text-neutral-800 dark:text-neutral-200">{p.pada || '—'}</td>
                      <td className="p-3 font-mono font-bold">House {p.house || 1}</td>
                      <td className="p-3 font-mono text-xs text-neutral-700 dark:text-neutral-300 font-semibold">{karakas[p.name] || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detailed Panchang & Vimshottari Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Lunar Nakshatra */}
            <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <Moon className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>Janma Nakshatra</span>
              </div>
              <p className="text-neutral-800 dark:text-neutral-200 font-semibold">
                {moonNakshatra ? `${moonNakshatra.name} (Pada ${moonNakshatra.pada})` : '—'}
              </p>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                Nakshatra Ruler:{' '}
                <span className="font-bold text-neutral-800 dark:text-neutral-200">{moonNakshatra?.lord || '—'}</span>
              </p>
            </div>

            {/* Vimshottari Dasha */}
            <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <Sparkles className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>Vimshottari Dasha</span>
              </div>
              <p className="text-neutral-800 dark:text-neutral-200">
                Active Mahadasha:{' '}
                <span className="font-bold text-neutral-900 dark:text-neutral-100">{vimsottariDasha?.currentMahadasha || '—'}</span>
              </p>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                Antardasha: <span className="font-bold text-neutral-800 dark:text-neutral-200">{vimsottariDasha?.currentAntardasha || '—'}</span>
              </p>
              {vimsottariDasha?.balanceAtBirth && (
                <p className="text-[10px] text-neutral-400 font-mono">{vimsottariDasha.balanceAtBirth}</p>
              )}
            </div>

            {/* Panchang */}
            <div className="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <Sun className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <span>Birth Panchang</span>
              </div>
              <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                Tithi: <span className="font-bold">{panchang?.tithi || '—'}</span>
              </p>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                Yoga: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{panchang?.yoga || '—'}</span> | Vara:{' '}
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">{panchang?.vara || '—'}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
