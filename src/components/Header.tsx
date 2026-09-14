import React from 'react';
import { ViewMode } from '../types';
import { BookOpen, Database, Share2, Download, Check, GraduationCap } from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  submissionCount: number;
  onShareClick: () => void;
  copiedShare: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  submissionCount,
  onShareClick,
  copiedShare,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-4 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                  Management Decision Making
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Case Study
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
                Moneyball: Decision Making Analysis
              </h1>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* View Mode Toggle */}
            <div className="flex p-1 bg-slate-800/90 rounded-xl border border-slate-700/80 shadow-inner">
              <button
                id="tab-student-form"
                onClick={() => setViewMode('student-form')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  viewMode === 'student-form'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Student Form</span>
              </button>

              <button
                id="tab-instructor-review"
                onClick={() => setViewMode('instructor-review')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  viewMode === 'instructor-review'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Instructor Database</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                    viewMode === 'instructor-review'
                      ? 'bg-emerald-800 text-emerald-100'
                      : 'bg-slate-700 text-emerald-300'
                  }`}
                >
                  {submissionCount}
                </span>
              </button>
            </div>

            {/* Share Link for Students */}
            <button
              id="btn-share-link"
              onClick={onShareClick}
              title="Copy student submission form link"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-300" />
                  <span>Share Form</span>
                </>
              )}
            </button>

            {/* Quick Export CSV Button */}
            <a
              id="btn-quick-export"
              href="/api/export/csv"
              download
              title="Download all responses as CSV spreadsheet"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
