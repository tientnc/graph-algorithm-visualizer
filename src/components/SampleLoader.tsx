import React from 'react';
import { PRESETS } from '../utils/presets';
import { MousePointer, PlusCircle, ArrowRight, Flag, HelpCircle, Trash, RefreshCw } from 'lucide-react';

interface SampleLoaderProps {
  onLoadPreset: (key: string) => void;
  activeMode: 'select' | 'addNode' | 'addEdge' | 'setStart' | 'setEnd';
  onChangeMode: (mode: 'select' | 'addNode' | 'addEdge' | 'setStart' | 'setEnd') => void;
  onClear: () => void;
  onRandomGraph: () => void;
}

export default function SampleLoader({
  onLoadPreset,
  activeMode,
  onChangeMode,
  onClear,
  onRandomGraph,
}: SampleLoaderProps) {
  return (
    <div id="sample-loader" className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Canvas Tool Belt Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-200">Interactive Canvas Tool Belt</h3>
        <p className="text-2xs text-slate-400">Select an action to design, modify, or extend your graph directly in the workspace.</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <button
            onClick={() => onChangeMode('select')}
            className={`p-2.5 rounded-lg flex flex-col items-center justify-center gap-1.5 border text-center transition-all cursor-pointer ${
              activeMode === 'select'
                ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <MousePointer size={14} />
            <span className="text-[10px] font-semibold">Pointer/Drag</span>
          </button>

          <button
            onClick={() => onChangeMode('addNode')}
            className={`p-2.5 rounded-lg flex flex-col items-center justify-center gap-1.5 border text-center transition-all cursor-pointer ${
              activeMode === 'addNode'
                ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <PlusCircle size={14} />
            <span className="text-[10px] font-semibold">Add Node</span>
          </button>

          <button
            onClick={() => onChangeMode('addEdge')}
            className={`p-2.5 rounded-lg flex flex-col items-center justify-center gap-1.5 border text-center transition-all cursor-pointer ${
              activeMode === 'addEdge'
                ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <ArrowRight size={14} />
            <span className="text-[10px] font-semibold">Link Nodes</span>
          </button>

          <button
            onClick={() => onChangeMode('setStart')}
            className={`p-2.5 rounded-lg flex flex-col items-center justify-center gap-1.5 border text-center transition-all cursor-pointer ${
              activeMode === 'setStart'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Flag size={14} className="text-emerald-400" />
            <span className="text-[10px] font-semibold">Set Start</span>
          </button>

          <button
            onClick={() => onChangeMode('setEnd')}
            className={`p-2.5 rounded-lg flex flex-col items-center justify-center gap-1.5 border text-center transition-all cursor-pointer ${
              activeMode === 'setEnd'
                ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Flag size={14} className="text-rose-400" />
            <span className="text-[10px] font-semibold">Set Goal</span>
          </button>
        </div>
      </div>

      {/* Preset graph designs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-200">Load Map Presets</h3>
          <div className="flex gap-1.5">
            <button
              onClick={onRandomGraph}
              className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 text-[10px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Generate randomly linked nodes"
            >
              <RefreshCw size={11} />
              <span>Random</span>
            </button>
            <button
              onClick={onClear}
              className="px-2.5 py-1 rounded bg-rose-950 border border-rose-800 hover:bg-rose-900 text-rose-300 text-[10px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Wipe canvas clean"
            >
              <Trash size={11} />
              <span>Clear Canvas</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PRESETS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => onLoadPreset(key)}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all hover:bg-slate-850/50 flex flex-col gap-1 cursor-pointer"
            >
              <span className="text-xs font-semibold text-slate-200 font-mono">{item.name}</span>
              <span className="text-[10px] text-slate-500 leading-normal line-clamp-1">{item.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
