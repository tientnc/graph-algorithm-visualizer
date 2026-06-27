import React, { useEffect, useRef } from 'react';
import { AlgorithmType, VisualizationStep } from '../types';
import { PSEUDOCODES, ALGORITHM_INFO } from '../utils/pseudocodes';
import { Terminal, ListTodo, Info } from 'lucide-react';

interface ExplanationPanelProps {
  algorithm: AlgorithmType;
  currentStep: VisualizationStep | null;
  history: { index: number; description: string }[];
  currentStepIndex: number;
}

export default function ExplanationPanel({
  algorithm,
  currentStep,
  history,
  currentStepIndex,
}: ExplanationPanelProps) {
  const logsContainerRef = useRef<HTMLDivElement | null>(null);
  const info = ALGORITHM_INFO[algorithm];
  const pseudocode = PSEUDOCODES[algorithm] || [];

  // Auto scroll logs container to keep the current active index in view without shifting the entire page view
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [currentStepIndex]);

  return (
    <div id="explanation-container" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Pseudocode Panel with active line highlights */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-3 lg:col-span-1.5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ListTodo size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">Algorithm Logic (Pseudocode)</h3>
        </div>

        <div className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[11px] leading-relaxed overflow-y-auto max-h-[220px]">
          {pseudocode.map((line) => {
            const isHighlighted = currentStep?.highlightLines.includes(line.line);
            return (
              <div
                key={line.line}
                style={{ paddingLeft: `${line.indent * 1.25}rem` }}
                className={`py-0.5 rounded transition-colors ${
                  isHighlighted
                    ? 'bg-indigo-900/40 text-indigo-200 font-semibold border-l-2 border-indigo-500 pl-2'
                    : 'text-slate-400'
                }`}
              >
                <span className="inline-block w-4 text-slate-600 mr-2 text-right select-none">{line.line}</span>
                {line.code}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Runtime status statistics: Complexity and Active Queue/Array Variables */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Info size={16} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">Execution Analysis</h3>
        </div>

        <div className="flex flex-col gap-3">
          {/* Algorithm Meta Data */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Time Complexity</span>
              <span className="font-mono text-amber-300 font-bold">{info.complexity}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Algorithm Group</span>
              <span className="font-semibold text-slate-300">
                {['bfs', 'dfs'].includes(algorithm) ? 'Traversal' : ['kruskal', 'prim'].includes(algorithm) ? 'Spanning Tree' : 'Shortest Path'}
              </span>
            </div>
          </div>

          {/* Active queue/stack visualization */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex-1 flex flex-col gap-1.5 min-h-[90px]">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              {['bfs', 'dfs'].includes(algorithm) ? 'Frontier Queue/Stack' : ['kruskal', 'prim'].includes(algorithm) ? 'Disjoint-set/Candidate Cuts' : 'Min Priority Values'}
            </span>
            <div className="flex flex-wrap gap-1">
              {currentStep?.state.queueState && currentStep.state.queueState.length > 0 ? (
                currentStep.state.queueState.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 shadow-sm"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-600 italic">Empty queue / completed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Steps log/trace history */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-3 lg:col-span-1.5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Terminal size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">Narration & Trace Logs</h3>
        </div>

        <div ref={logsContainerRef} className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-y-auto max-h-[220px] font-mono text-3xs space-y-2">
          {history.map((log, idx) => {
            const isActive = idx === currentStepIndex;
            return (
              <div
                key={idx}
                className={`py-1 px-2.5 rounded transition-all flex gap-2 ${
                  isActive
                    ? 'bg-emerald-950/40 text-emerald-300 font-bold border-l-2 border-emerald-500 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <span className="text-slate-600 font-bold shrink-0">[{idx + 1}]</span>
                <span className="leading-normal">{log.description}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
