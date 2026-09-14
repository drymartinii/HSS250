import { StudentSubmission } from '../types';

export async function fetchSubmissions(): Promise<StudentSubmission[]> {
  try {
    const res = await fetch('/api/submissions');
    if (!res.ok) {
      throw new Error(`Failed to fetch submissions (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error('API fetchSubmissions error:', err);
    // Fallback to local storage if API is temporarily unavailable
    const cached = localStorage.getItem('moneyball_submissions_backup');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return [];
  }
}

export async function submitStudentResponse(data: {
  studentName: string;
  answers: Record<string, string>;
}): Promise<StudentSubmission> {
  const res = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'Submission failed' }));
    throw new Error(errData.error || `Server responded with ${res.status}`);
  }

  const result: StudentSubmission = await res.json();

  // Save to client backup cache as extra safety
  try {
    const cached = localStorage.getItem('moneyball_submissions_backup');
    const list: StudentSubmission[] = cached ? JSON.parse(cached) : [];
    list.unshift(result);
    localStorage.setItem('moneyball_submissions_backup', JSON.stringify(list));
  } catch {
    // ignore
  }

  return result;
}

export async function updateSubmissionReview(
  id: string,
  update: { reviewNotes?: string; grade?: string; status?: 'submitted' | 'reviewed' }
): Promise<StudentSubmission> {
  const res = await fetch(`/api/submissions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });

  if (!res.ok) {
    throw new Error(`Failed to update review (${res.status})`);
  }

  return await res.json();
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const res = await fetch(`/api/submissions/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error(`Failed to delete submission (${res.status})`);
  }

  return true;
}

export async function seedSampleSubmissions(): Promise<{ success: boolean; count: number }> {
  const res = await fetch('/api/submissions/seed', {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Failed to seed sample data');
  }

  return await res.json();
}

export async function clearAllSubmissions(): Promise<boolean> {
  const res = await fetch('/api/submissions/clear', {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Failed to clear database');
  }

  return true;
}
