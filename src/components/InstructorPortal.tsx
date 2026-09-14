import React, { useState, useMemo } from 'react';
import { StudentSubmission, MONEYBALL_QUESTIONS } from '../types';
import { updateSubmissionReview, deleteSubmission, seedSampleSubmissions, clearAllSubmissions } from '../services/api';
import { 
  Download, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  User, 
  FileSpreadsheet, 
  Database, 
  Plus, 
  Printer, 
  Sparkles, 
  Layers, 
  ListFilter,
  Save,
  MessageSquare,
  Award,
  RefreshCw,
  Eye,
  Calendar,
  Share2
} from 'lucide-react';

interface InstructorPortalProps {
  submissions: StudentSubmission[];
  onRefresh: () => Promise<void>;
  onShareClick: () => void;
}

export const InstructorPortal: React.FC<InstructorPortalProps> = ({
  submissions,
  onRefresh,
  onShareClick,
}) => {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    submissions.length > 0 ? submissions[0].id : null
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'reviewed'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [activeTab, setActiveTab] = useState<'dossier' | 'matrix'>('dossier');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('q1');

  // Instructor grading form state for currently selected submission
  const [reviewGrade, setReviewGrade] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isSavingReview, setIsSavingReview] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Sync grading form when selection changes
  const selectedSubmission = useMemo(() => {
    return submissions.find((s) => s.id === selectedSubmissionId) || (submissions.length > 0 ? submissions[0] : null);
  }, [submissions, selectedSubmissionId]);

  React.useEffect(() => {
    if (selectedSubmission) {
      setReviewGrade(selectedSubmission.grade || '');
      setReviewNotes(selectedSubmission.reviewNotes || '');
      setSaveSuccessMsg(null);
    }
  }, [selectedSubmission]);

  // Compute metrics
  const totalSubmissions = submissions.length;
  const reviewedCount = submissions.filter((s) => s.status === 'reviewed').length;
  const pendingCount = totalSubmissions - reviewedCount;

  const totalWords = useMemo(() => {
    let sum = 0;
    submissions.forEach((sub) => {
      Object.values(sub.answers).forEach((val) => {
        const str = String(val || '');
        if (str.trim()) {
          sum += str.trim().split(/\s+/).filter(Boolean).length;
        }
      });
    });
    return sum;
  }, [submissions]);

  const avgWordsPerSubmission = totalSubmissions > 0 ? Math.round(totalWords / totalSubmissions) : 0;

  // Filter & Sort submissions
  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((sub) => {
        // Status filter
        if (statusFilter === 'reviewed' && sub.status !== 'reviewed') return false;
        if (statusFilter === 'submitted' && sub.status === 'reviewed') return false;

        // Search filter
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        const matchesName = sub.studentName.toLowerCase().includes(term);
        const matchesAnswers = Object.values(sub.answers).some((val) =>
          String(val || '').toLowerCase().includes(term)
        );
        const matchesNotes = sub.reviewNotes?.toLowerCase().includes(term);
        return matchesName || matchesAnswers || matchesNotes;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        }
        if (sortOrder === 'oldest') {
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        }
        if (sortOrder === 'name') {
          return a.studentName.localeCompare(b.studentName);
        }
        return 0;
      });
  }, [submissions, statusFilter, searchTerm, sortOrder]);

  const handleSaveReview = async () => {
    if (!selectedSubmission) return;
    setIsSavingReview(true);
    setSaveSuccessMsg(null);
    try {
      await updateSubmissionReview(selectedSubmission.id, {
        grade: reviewGrade.trim(),
        reviewNotes: reviewNotes.trim(),
        status: reviewGrade || reviewNotes ? 'reviewed' : selectedSubmission.status,
      });
      await onRefresh();
      setSaveSuccessMsg('Review & grade saved successfully!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(`Error saving review: ${err.message}`);
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleDeleteSubmission = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the submission from ${name}?`)) {
      try {
        await deleteSubmission(id);
        await onRefresh();
        if (selectedSubmissionId === id) {
          const remaining = submissions.filter((s) => s.id !== id);
          setSelectedSubmissionId(remaining.length > 0 ? remaining[0].id : null);
        }
      } catch (err: any) {
        alert(`Error deleting submission: ${err.message}`);
      }
    }
  };

  const handleSeedSamples = async () => {
    try {
      await seedSampleSubmissions();
      await onRefresh();
    } catch (err: any) {
      alert(`Error seeding sample data: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('WARNING: Are you sure you want to delete ALL student submissions from the database? This cannot be undone.')) {
      try {
        await clearAllSubmissions();
        await onRefresh();
        setSelectedSubmissionId(null);
      } catch (err: any) {
        alert(`Error clearing database: ${err.message}`);
      }
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getSubmissionWordCount = (sub: StudentSubmission): number => {
    return Object.values(sub.answers).reduce((sum, ans) => {
      return sum + (ans ? ans.trim().split(/\s+/).filter(Boolean).length : 0);
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                Instructor Database & Review
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500 font-medium">
                Moneyball: Decision Making Case Study
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Submissions Management
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Review individual student responses, evaluate case study questions, grade submissions, and export data.
            </p>
          </div>

          {/* Database Control Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition"
              title="Refresh database entries"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={onShareClick}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Share Student Link</span>
            </button>

            <a
              href="/api/export/csv"
              download
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV (Excel)</span>
            </a>

            <a
              href="/api/export/json"
              download
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export JSON</span>
            </a>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Total Submissions
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalSubmissions}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              Reviewed
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {reviewedCount}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
              Needs Review
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              {pendingCount}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Avg. Words / Student
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {avgWordsPerSubmission}
            </div>
          </div>
        </div>

        {/* Database Utility Action Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Sample Data:</span>
            <button
              onClick={handleSeedSamples}
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Load Sample Student Responses
            </button>
          </div>

          {totalSubmissions > 0 && (
            <button
              onClick={handleClearAll}
              className="text-slate-400 hover:text-rose-600 transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Database
            </button>
          )}
        </div>
      </div>

      {/* Main View Mode Selector (Individual Dossier vs Question Matrix) */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex p-1 bg-slate-200/80 rounded-2xl">
          <button
            onClick={() => setActiveTab('dossier')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeTab === 'dossier'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>Individual Student Dossier</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeTab === 'matrix'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Question-by-Question Matrix</span>
          </button>
        </div>

        {/* Search & Status Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder-slate-400 shadow-sm w-56 sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="all">All Statuses ({totalSubmissions})</option>
            <option value="submitted">Needs Review ({pendingCount})</option>
            <option value="reviewed">Reviewed ({reviewedCount})</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {submissions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Submissions Recorded Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Share the submission link with your students to collect their Moneyball case study answers. Or load sample responses to test the review dashboard.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSeedSamples}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition"
            >
              Load Sample Submissions
            </button>
            <button
              onClick={onShareClick}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition"
            >
              Copy Student Link
            </button>
          </div>
        </div>
      ) : activeTab === 'dossier' ? (
        /* MODE A: Individual Student Dossier Split-View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Student List */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
            <div className="px-2 py-2 flex items-center justify-between border-b border-slate-100 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Students ({filteredSubmissions.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Click to inspect answers
              </span>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {filteredSubmissions.map((sub) => {
                const isSelected = selectedSubmission?.id === sub.id;
                const wordCount = getSubmissionWordCount(sub);
                const isReviewed = sub.status === 'reviewed';

                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubmissionId(sub.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition border flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/30'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {sub.studentName}
                      </span>
                      {isReviewed ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          {sub.grade ? `Graded: ${sub.grade}` : 'Reviewed'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                          Needs Review
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>{wordCount} words</span>
                    </div>
                  </button>
                );
              })}

              {filteredSubmissions.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No students match your filter or search criteria.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Student's Answers Dossier & Grading Card */}
          <div className="lg:col-span-8 space-y-6">
            {selectedSubmission ? (
              <>
                {/* Dossier Header Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400">{selectedSubmission.id}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">
                          Submitted on {new Date(selectedSubmission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {selectedSubmission.studentName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition"
                        title="Print student submission"
                      >
                        <Printer className="w-4 h-4 text-slate-500" />
                        <span>Print</span>
                      </button>

                      <button
                        onClick={() => handleDeleteSubmission(selectedSubmission.id, selectedSubmission.studentName)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition"
                        title="Delete submission"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Instructor Grading & Feedback Section */}
                  <div className="mt-5 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Instructor Evaluation & Notes
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-3">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Grade / Score
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., A, 95/100"
                          value={reviewGrade}
                          onChange={(e) => setReviewGrade(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Feedback / Grading Notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Strong understanding of programmed vs nonprogrammed decision making."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2">
                      <div className="text-xs text-emerald-700 font-semibold">
                        {saveSuccessMsg && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {saveSuccessMsg}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveReview}
                        disabled={isSavingReview}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingReview ? 'Saving...' : 'Save Evaluation'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Answers Cards */}
                <div className="space-y-4">
                  {MONEYBALL_QUESTIONS.map((q) => {
                    const ans = selectedSubmission.answers[q.id];
                    const wordCount = ans ? ans.trim().split(/\s+/).filter(Boolean).length : 0;

                    return (
                      <div
                        key={q.id}
                        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200">
                              Q{q.number}
                            </span>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900">
                              {q.title}
                            </h4>
                          </div>
                          <span className="text-xs text-slate-400 shrink-0 font-medium">
                            {wordCount} words
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mb-3 italic">
                          Target concept: {q.hint}
                        </p>

                        <div className="bg-slate-50/90 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed border border-slate-100">
                          {ans && ans.trim() ? (
                            ans
                          ) : (
                            <span className="text-slate-400 italic">No response submitted for this question.</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 text-sm">
                Select a student on the left to view their answers.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* MODE B: Question-by-Question Matrix View */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          {/* Question Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Question to Compare All Students:
              </span>
              <span className="text-xs text-slate-400">
                Comparing {filteredSubmissions.length} student answers
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {MONEYBALL_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition ${
                    selectedQuestionId === q.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Q{q.number}
                </button>
              ))}
            </div>
          </div>

          {/* Active Question Info Banner */}
          {(() => {
            const activeQ = MONEYBALL_QUESTIONS.find((q) => q.id === selectedQuestionId)!;
            return (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Question {activeQ.number} of {MONEYBALL_QUESTIONS.length}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {activeQ.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  {activeQ.hint}
                </p>
              </div>
            );
          })()}

          {/* Student Answers List for this Question */}
          <div className="space-y-4">
            {filteredSubmissions.map((sub) => {
              const answerText = sub.answers[selectedQuestionId];
              const wordCount = answerText ? answerText.trim().split(/\s+/).filter(Boolean).length : 0;

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {sub.studentName}
                      </span>
                      {sub.grade && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {sub.grade}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{wordCount} words</span>
                      <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {answerText && answerText.trim() ? (
                      answerText
                    ) : (
                      <span className="text-slate-400 italic">No response provided.</span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No student responses match your current filter.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
