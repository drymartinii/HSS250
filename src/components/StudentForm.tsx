import React, { useState, useEffect, useRef } from 'react';
import { MONEYBALL_QUESTIONS, StudentSubmission } from '../types';
import { submitStudentResponse } from '../services/api';
import { 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Trash2, 
  Send, 
  Clock, 
  FileText, 
  Info,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface StudentFormProps {
  onSubmissionSuccess: (submission: StudentSubmission) => void;
}

const DRAFT_STORAGE_KEY = 'moneyball_case_study_draft_v1';

export const StudentForm: React.FC<StudentFormProps> = ({ onSubmissionSuccess }) => {
  const [studentName, setStudentName] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: '',
    q8: '',
    q9: '',
  });

  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showIncompleteModal, setShowIncompleteModal] = useState<boolean>(false);
  const [unansweredList, setUnansweredList] = useState<number[]>([]);

  // Load saved draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.studentName) setStudentName(parsed.studentName);
        if (parsed.answers) {
          setAnswers((prev) => ({ ...prev, ...parsed.answers }));
        }
        if (parsed.savedAt) {
          setLastSaved(new Date(parsed.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (e) {
      console.error('Error loading draft from localStorage:', e);
    }
  }, []);

  // Autosave draft debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleAnswerChange = (questionId: string, value: string) => {
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            studentName,
            answers: updatedAnswers,
            savedAt: new Date().toISOString(),
          })
        );
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (e) {
        console.error('Failed to autosave draft:', e);
      }
    }, 600);
  };

  const handleNameChange = (name: string) => {
    setStudentName(name);
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          studentName: name,
          answers,
          savedAt: new Date().toISOString(),
        })
      );
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      // ignore
    }
  };

  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear your current answers and start over?')) {
      const resetAnswers: Record<string, string> = {
        q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: ''
      };
      setStudentName('');
      setAnswers(resetAnswers);
      setLastSaved(null);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  };

  // Completion calculation
  const completedQuestionsCount = MONEYBALL_QUESTIONS.filter(
    (q) => answers[q.id] && answers[q.id].trim().length > 0
  ).length;
  const progressPercent = Math.round((completedQuestionsCount / MONEYBALL_QUESTIONS.length) * 100);

  const getWordCount = (text: string): number => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  };

  const totalWordCount = Object.values(answers).reduce((sum: number, text: unknown) => sum + getWordCount(String(text || '')), 0);

  // Jump to question smoothly
  const scrollToQuestion = (questionId: string) => {
    const element = document.getElementById(`question-card-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Brief highlight effect
      element.classList.add('ring-2', 'ring-emerald-500');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-emerald-500');
      }, 1500);
    }
  };

  const validateAndSubmit = async (force: boolean = false) => {
    setErrorMessage(null);

    // 1. Check Student Name
    if (!studentName.trim()) {
      setErrorMessage('Please enter your full name before submitting.');
      const nameInput = document.getElementById('input-student-name');
      if (nameInput) {
        nameInput.focus();
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 2. Check for unanswered questions
    const missing: number[] = [];
    MONEYBALL_QUESTIONS.forEach((q) => {
      if (!answers[q.id] || answers[q.id].trim().length === 0) {
        missing.push(q.number);
      }
    });

    if (missing.length > 0 && !force) {
      setUnansweredList(missing);
      setShowIncompleteModal(true);
      return;
    }

    setShowIncompleteModal(false);
    setIsSubmitting(true);

    try {
      const created = await submitStudentResponse({
        studentName: studentName.trim(),
        answers,
      });

      // Clear local draft upon confirmed save
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      onSubmissionSuccess(created);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'An error occurred while saving your submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      
      {/* Case Study Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Case Study Analysis Form
          </div>

          {lastSaved && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Draft autosaved at {lastSaved}</span>
            </div>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Case Study — Decision Making — Moneyball
        </h2>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
          Analyze the decision-making dynamics of the Oakland Athletics front office in <em>Moneyball</em>.
          Answer each of the 9 specific questions below using relevant management and organizational decision-making principles.
          Only your <strong>full name</strong> is required for submission identification.
        </p>

        {/* Student Name Input Field */}
        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
          <label 
            htmlFor="input-student-name"
            className="block text-sm font-bold text-slate-800 mb-1"
          >
            Your Full Name <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Please enter your first and last name so your submission can be recorded and reviewed.
          </p>
          <input
            id="input-student-name"
            type="text"
            required
            placeholder="e.g., Sarah Mitchell"
            value={studentName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder-slate-400 font-medium shadow-sm transition"
          />
        </div>
      </div>

      {/* Sticky Progress & Quick Navigator Bar */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-sm border border-slate-200 mb-8 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Submission Progress:
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {completedQuestionsCount} of {MONEYBALL_QUESTIONS.length} Answered ({progressPercent}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Total Words: <strong>{totalWordCount}</strong></span>
            {completedQuestionsCount > 0 && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-slate-400 hover:text-rose-600 transition flex items-center gap-1"
                title="Clear all responses and restart"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Question Jump Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap mr-1">
            Jump to:
          </span>
          {MONEYBALL_QUESTIONS.map((q) => {
            const isAnswered = answers[q.id] && answers[q.id].trim().length > 0;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => scrollToQuestion(q.id)}
                className={`min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg flex items-center justify-center transition-all ${
                  isAnswered
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
                title={`Question ${q.number}: ${q.title}`}
              >
                Q{q.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions Form */}
      <div className="space-y-6">
        {MONEYBALL_QUESTIONS.map((q) => {
          const currentAnswer = answers[q.id] || '';
          const wordCount = getWordCount(currentAnswer);
          const isAnswered = currentAnswer.trim().length > 0;

          return (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              className={`bg-white rounded-2xl p-6 sm:p-7 border transition-all duration-200 shadow-sm ${
                isAnswered
                  ? 'border-slate-200 shadow-slate-100'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                    isAnswered 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    Question {q.number} of {MONEYBALL_QUESTIONS.length}
                  </span>
                  {isAnswered && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      Answered
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
              </div>

              {/* Exact Question Title */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-2">
                {q.title}
              </h3>

              {/* Helpful Hint/Prompt */}
              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-500 bg-slate-50/80 rounded-xl p-3 mb-4 border border-slate-100">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{q.hint}</p>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  id={`textarea-${q.id}`}
                  rows={4}
                  value={currentAnswer}
                  placeholder={q.placeholder || 'Type your analysis here...'}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder-slate-400 text-sm sm:text-base leading-relaxed resize-y transition shadow-inner"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Submission Actions Footer */}
      <div className="mt-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-slate-900">Ready to Submit?</h4>
          <p className="text-xs sm:text-sm text-slate-500">
            {completedQuestionsCount === MONEYBALL_QUESTIONS.length
              ? 'All 9 questions have been answered. You are ready to turn in your case study.'
              : `${MONEYBALL_QUESTIONS.length - completedQuestionsCount} questions remain uncompleted. You can submit when ready.`}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            id="btn-submit-assignment"
            type="button"
            disabled={isSubmitting}
            onClick={() => validateAndSubmit(false)}
            className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Recording Submission...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Case Study Answers</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal: Confirmation for Incomplete Questions */}
      {showIncompleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
              Unanswered Questions Detected
            </h3>
            <p className="text-sm text-slate-600 text-center mb-4">
              You still have {unansweredList.length} unanswered question{unansweredList.length > 1 ? 's' : ''}:
              <span className="font-semibold text-slate-800">
                {' '}{unansweredList.map((num) => `Q${num}`).join(', ')}
              </span>.
            </p>
            <p className="text-xs text-slate-500 text-center mb-6">
              Would you like to go back and complete them, or submit your current responses as-is?
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowIncompleteModal(false);
                  if (unansweredList.length > 0) {
                    scrollToQuestion(`q${unansweredList[0]}`);
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Go Back & Complete
              </button>
              <button
                type="button"
                onClick={() => validateAndSubmit(true)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
