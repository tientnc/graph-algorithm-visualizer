import React from 'react';
import { AlgorithmType } from '../types';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Zap } from 'lucide-react';

interface AlgorithmControlsProps {
  selectedAlgorithm: AlgorithmType;
  onSelectAlgorithm: (alg: AlgorithmType) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentStepIndex: number;
  totalSteps: number;
}

const ALGORITHMS_LIST: { id: AlgorithmType; label: string }[] = [
  { id: 'bfs', label: 'BFS (Unweighted Path)' },
  { id: 'dfs', label: 'DFS (Backtracking)' },
  { id: 'dijkstra', label: "Dijkstra's (Shortest Path)" },
  { id: 'astar', label: 'A* Search (Heuristics)' },
  { id: 'bellmanFord', label: 'Bellman-Ford (Neg. Weights)' },
  { id: 'kruskal', label: "Kruskal's (Minimum MST)" },
  { id: 'prim', label: "Prim's (Growing MST)" },
];

export default function AlgorithmControls({
  selectedAlgorithm,
  onSelectAlgorithm,
  isPlaying,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
  speed,
  onSpeedChange,
  currentStepIndex,
  totalSteps,
}: AlgorithmControlsProps) {
  return (
    <div id="controls-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      {/* Algorithm Selector Row */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Graph Algorithm</label>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {ALGORITHMS_LIST.map((alg) => (
            <button
              key={alg.id}
              onClick={() => onSelectAlgorithm(alg.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-center border cursor-pointer ${
                selectedAlgorithm === alg.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/15'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {alg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Playback Controls & Speed slider */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-slate-800/80">
        {/* Step index progress badge */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-2xs font-mono text-slate-500 uppercase">Step</span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {totalSteps > 0 ? currentStepIndex + 1 : 0}
            </span>
            <span className="text-2xs text-slate-600">/</span>
            <span className="text-xs font-mono text-slate-500">{totalSteps}</span>
          </div>

          {/* Slider visual indicator */}
          <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden relative border border-slate-800 hidden sm:block">
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Player Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            title="Reset simulation"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={onStepBackward}
            disabled={currentStepIndex <= 0 || isPlaying}
            className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous step"
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={onPlayPause}
            disabled={totalSteps === 0}
            className={`p-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
            }`}
            title={isPlaying ? 'Pause' : 'Play simulation'}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>

          <button
            onClick={onStepForward}
            disabled={currentStepIndex >= totalSteps - 1 || isPlaying}
            className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next step"
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Zap size={14} className="text-amber-400 shrink-0" />
          <div className="flex flex-col w-full sm:w-44 gap-1">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>Fast</span>
              <span>Slow ({speed}ms)</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer border border-slate-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
