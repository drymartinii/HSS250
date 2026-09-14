import React from 'react';
import { StudentSubmission, MONEYBALL_QUESTIONS } from '../types';
import { CheckCircle2, Printer, PlusCircle, ArrowLeft, Calendar, User, Hash, FileCheck2 } from 'lucide-react';

interface SubmissionSuccessProps {
  submission: StudentSubmission;
  onReset: () => void;
  onGoToInstructor: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({
  submission,
  onReset,
  onGoToInstructor,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(submission.submittedAt).toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      
      {/* Confirmation Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm mb-8 text-center relative overflow-hidden">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-inner">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2]" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
          Response Recorded
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Thank you, {submission.studentName}!
        </h2>

        <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto mb-6">
          Your answers for the <strong>Moneyball: Decision Making Case Study</strong> have been successfully submitted and stored in the database.
        </p>

        {/* Receipt Details Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-6">
          <div className="flex items-start gap-2.5">
            <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-400">Student</div>
              <div className="text-sm font-semibold text-slate-800">{submission.studentName}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-400">Submitted At</div>
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {new Date(submission.submittedAt).toLocaleDateString()}{' '}
                {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Hash className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-400">Submission ID</div>
              <div className="text-xs font-mono font-semibold text-slate-700 truncate max-w-[130px]" title={submission.id}>
                {submission.id}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            id="btn-print-receipt"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print / Save Receipt</span>
          </button>

          <button
            id="btn-submit-another"
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Submit Another Response</span>
          </button>

          <button
            id="btn-view-in-instructor"
            onClick={onGoToInstructor}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Review in Instructor Database</span>
          </button>
        </div>
      </div>

      {/* Submitted Answers Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm print:shadow-none print:border-none">
        <div className="border-b border-slate-200 pb-4 mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Submitted Answers Summary</h3>
            <p className="text-xs text-slate-500">Record for: {submission.studentName} ({formattedDate})</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            9 Questions
          </span>
        </div>

        <div className="space-y-6">
          {MONEYBALL_QUESTIONS.map((q) => {
            const answer = submission.answers[q.id];
            return (
              <div key={q.id} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Q{q.number}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800">
                    {q.title}
                  </h4>
                </div>
                
                <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-3.5 border border-slate-100 leading-relaxed">
                  {answer && answer.trim() ? (
                    answer
                  ) : (
                    <span className="italic text-slate-400">No response provided.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
