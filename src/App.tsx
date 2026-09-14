import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, StudentSubmission } from './types';
import { fetchSubmissions } from './services/api';
import { Header } from './components/Header';
import { StudentForm } from './components/StudentForm';
import { SubmissionSuccess } from './components/SubmissionSuccess';
import { InstructorPortal } from './components/InstructorPortal';
import { ShareModal } from './components/ShareModal';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Check URL params if instructor mode is directly requested
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'instructor' || params.get('mode') === 'instructor') {
      return 'instructor-review';
    }
    return 'student-form';
  });

  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [lastSubmission, setLastSubmission] = useState<StudentSubmission | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load submissions from database
  const loadSubmissions = useCallback(async () => {
    try {
      const data = await fetchSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions in App:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Handle successful student submission
  const handleSubmissionSuccess = (submission: StudentSubmission) => {
    setLastSubmission(submission);
    // Reload submissions in background so instructor count updates
    loadSubmissions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to empty form
  const handleResetForm = () => {
    setLastSubmission(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick share link click
  const handleShareClick = () => {
    const studentUrl = window.location.origin;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(studentUrl).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      }).catch(() => {
        setIsShareModalOpen(true);
      });
    } else {
      setIsShareModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header with navigation tabs & quick export */}
      <Header
        viewMode={viewMode}
        setViewMode={(mode) => {
          setViewMode(mode);
          // If switching to student form while on success receipt, we can stay or reset
        }}
        submissionCount={submissions.length}
        onShareClick={handleShareClick}
        copiedShare={copiedShare}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {viewMode === 'student-form' ? (
          lastSubmission ? (
            <SubmissionSuccess
              submission={lastSubmission}
              onReset={handleResetForm}
              onGoToInstructor={() => {
                setViewMode('instructor-review');
              }}
            />
          ) : (
            <StudentForm onSubmissionSuccess={handleSubmissionSuccess} />
          )
        ) : (
          <InstructorPortal
            submissions={submissions}
            onRefresh={loadSubmissions}
            onShareClick={() => setIsShareModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Case Study Decision Making Portal • <strong>Moneyball: Roster & Strategy Analysis</strong>
          </p>
          <p className="text-slate-400">
            Simple web database storage & CSV export for student submissions.
          </p>
        </div>
      </footer>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
