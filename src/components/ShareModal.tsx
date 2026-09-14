import React, { useState } from 'react';
import { Copy, Check, X, Share2, ExternalLink, Globe } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Derive current student URL
  const studentUrl = window.location.origin;

  const handleCopy = () => {
    navigator.clipboard.writeText(studentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Share Submission Link</h3>
            <p className="text-xs text-slate-500">Distribute this link to your students</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-5">
          Students can open this link directly on any browser or device, write their answers for the 9 Moneyball case study questions, enter their full name, and submit. All responses will be saved directly into your database.
        </p>

        {/* Link Box */}
        <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-200 mb-6 flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            readOnly
            value={studentUrl}
            className="bg-transparent text-xs sm:text-sm font-mono text-slate-800 focus:outline-none flex-1 truncate select-all"
          />
          <button
            onClick={handleCopy}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              copied
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Guidance tip */}
        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-100 mb-6 text-xs text-emerald-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <span>💡 How this works:</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-emerald-800">
            <li>No student login or account registration required — only student names are collected.</li>
            <li>Student answers automatically autosave to their browser while typing so nothing is lost.</li>
            <li>You can review submissions in the <strong>Instructor Database</strong> tab and export all data to CSV (Excel) anytime.</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
