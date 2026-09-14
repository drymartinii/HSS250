import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface SubmissionData {
  id: string;
  studentName: string;
  submittedAt: string;
  answers: Record<string, string>;
  reviewNotes?: string;
  grade?: string;
  status?: 'submitted' | 'reviewed';
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'submissions.json');

// Ensure data directory and file exist
function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function getSubmissions(): SubmissionData[] {
  try {
    initStorage();
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return [];
  }
}

function saveSubmissions(submissions: SubmissionData[]) {
  try {
    initStorage();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(submissions, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving database file:', err);
    throw err;
  }
}

// Sample mock data for quick demonstration and testing
const SAMPLE_SUBMISSIONS: SubmissionData[] = [
  {
    id: 'sub_sample_1',
    studentName: 'Marcus Vance',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    answers: {
      q1: 'Oakland Athletics GM Billy Beane and the front office need to decide how to build a competitive baseball team for the upcoming 2002 MLB season despite losing three of their key star players (Jason Giambi, Johnny Damon, and Jason Isringhausen) and operating with a payroll budget of around $40 million—less than a third of high-revenue teams like the New York Yankees.',
      q2: 'The traditional scouts and coaches identify the problem as replacing three irreplaceable star individuals with conventional players who possess similar physical traits ("looks like a baseball player," "five-tool player," clean swing). In contrast, Billy Beane identifies the fundamental problem as an unfair economic playing field where traditional baseball thinking misdiagnoses the goal: the problem is not replacing individual players, but acquiring runs and wins under severe financial constraints.',
      q3: 'Initially, employee participation appears high in the scouting room because veteran scouts discuss and debate candidates, but their input relies entirely on subjective intuition. When Billy Beane brings in Peter Brand and his objective data model, the decision-making shifts to a consultative/autocratic hybrid where Billy makes the executive decisions based on data, overriding the scouts\' unanimous traditional recommendations.',
      q4: 'The discussion highlights several root causes: extreme disparity in revenue and payroll between big-market and small-market teams, an outdated scouting dogma that relies on gut feel and cosmetic biases (e.g. good face, girlfriend appearance), and an inefficient market where high-value skills (like on-base percentage and walks) are undervalued by the industry.',
      q5: 'GM Objective: Win at least 99-100 games to make the playoffs on a $40 million budget. Must criteria: Stay strictly under the $40M budget ceiling; accumulate at least ~840 runs while allowing no more than ~650 runs (the Pythagorean formula for wins). Want criteria: High on-base percentage (OBP), disciplined batters who draw walks, cheap and undervalued contracts, regardless of defensive flaws or unconventional mechanics.',
      q6: 'Alternative 1: Traditional scouting solution — sign cheaper, aging veterans or speculative prospects who look the part to fill vacant defensive positions. Alternative 2: Billy Beane & Peter Brand\'s sabermetric solution — break the team down into aggregate runs and on-base percentages, signing overlooked players with high OBP like Scott Hatteberg, David Justice, and Chad Bradford.',
      q7: 'Billy Beane\'s decision is nonprogrammed. Programmed decisions apply to routine, well-structured, recurring problems with established rules and procedures (which is what traditional scouting had done for 100 years). Rebuilding a competitive team with an unprecedented sabermetric statistical model to bypass market inefficiency is highly novel, complex, unstructured, and entails substantial career and organizational risk.',
      q8: 'The scouting room displays classic groupthink symptoms: collective rationalization of past scouting habits, shared illusion of invulnerability ("we have 150 years of experience in this room"), social pressure to conform against divergent opinions, stereotyping outsiders (mocking Peter Brand because he never played professional ball), and mindguarding to protect long-standing baseball traditions.',
      q9: 'They use computer database systems, historical player performance data, and sabermetric formulas pioneered by Bill James. Specifically, Peter Brand uses statistical software and spreadsheets to analyze On-Base Percentage (OBP), Slugging Percentage, and run-differential modeling to identify undervalued players based on quantitative productivity rather than subjective visual scouting.'
    },
    reviewNotes: 'Excellent grasp of programmed vs nonprogrammed distinction and clear breakdown of must vs want criteria.',
    grade: 'A',
    status: 'reviewed'
  },
  {
    id: 'sub_sample_2',
    studentName: 'Elena Rostova',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    answers: {
      q1: 'Deciding how to replace lost free agents and construct a roster capable of winning the American League West on an extremely restricted payroll of $39-40 million.',
      q2: 'Scouts think the problem is finding another first baseman like Giambi and an outfielder like Damon. Billy Beane says the problem is thinking we can play like the Yankees with 1/3 of the money. He famously says: "If we play like them in here, we will lose to them out there."',
      q3: 'Low genuine participation in the final strategy. While scouts talk a lot in meetings, Billy realizes their advice is circular. Once Peter Brand arrives, Billy acts as the decisive leader implementing an analytical approach despite strong resistance from head scout Grady Fuson and manager Art Howe.',
      q4: 'Financial inequality among MLB franchises, historical inertia in scouting culture, and failure to quantify what actually generates victories (plate discipline, walks, on-base percentage).',
      q5: 'Objective: Reach the postseason. Must criteria: Cost per run must fit the $40M cap; players must get on base without costing marquee salaries. Want criteria: Veteran experience, defensive flexibility, and coachability.',
      q6: 'Alternative A: Spend what little they have on mid-tier free agents who mimic Giambi\'s power. Alternative B: Identify undervalued skill sets and acquire players with high walks/OBP across multiple roster spots (reconstituting Giambi in the aggregate).',
      q7: 'Nonprogrammed. It tackles an unstructured, high-uncertainty problem with no pre-existing playbook. It forced the organization to pioneer new evaluation rules from scratch rather than following standard operating procedures.',
      q8: 'Groupthink is evident in how the scouts reinforce each other\'s subjective prejudices (e.g. dismissing players for non-baseball reasons like body language or throwing motion) and gang up on anyone questioning tradition.',
      q9: 'Computer-based statistical software, spreadsheets containing sabermetric formulas, Bill James baseball abstracts, and deep historical batting/pitching metrics.'
    },
    reviewNotes: 'Good use of movie quotes and strong explanation of groupthink.',
    grade: 'A-',
    status: 'reviewed'
  }
];

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // GET all submissions
  app.get('/api/submissions', (req, res) => {
    try {
      const submissions = getSubmissions();
      // Sort newest first by default
      submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      res.json(submissions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve submissions' });
    }
  });

  // GET single submission
  app.get('/api/submissions/:id', (req, res) => {
    try {
      const submissions = getSubmissions();
      const found = submissions.find(s => s.id === req.params.id);
      if (!found) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      res.json(found);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve submission' });
    }
  });

  // POST create submission
  app.post('/api/submissions', (req, res) => {
    try {
      const { studentName, answers } = req.body;

      if (!studentName || typeof studentName !== 'string' || !studentName.trim()) {
        return res.status(400).json({ error: 'Student name is required' });
      }

      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ error: 'Submission answers must be provided' });
      }

      const submissions = getSubmissions();
      const newSubmission: SubmissionData = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        studentName: studentName.trim(),
        submittedAt: new Date().toISOString(),
        answers: {
          q1: String(answers.q1 || '').trim(),
          q2: String(answers.q2 || '').trim(),
          q3: String(answers.q3 || '').trim(),
          q4: String(answers.q4 || '').trim(),
          q5: String(answers.q5 || '').trim(),
          q6: String(answers.q6 || '').trim(),
          q7: String(answers.q7 || '').trim(),
          q8: String(answers.q8 || '').trim(),
          q9: String(answers.q9 || '').trim(),
        },
        status: 'submitted'
      };

      submissions.unshift(newSubmission);
      saveSubmissions(submissions);

      res.status(201).json(newSubmission);
    } catch (err) {
      console.error('Error creating submission:', err);
      res.status(500).json({ error: 'Failed to save submission' });
    }
  });

  // PUT update submission (instructor review notes, grade, status)
  app.put('/api/submissions/:id', (req, res) => {
    try {
      const submissions = getSubmissions();
      const index = submissions.findIndex(s => s.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      const existing = submissions[index];
      const { reviewNotes, grade, status, answers, studentName } = req.body;

      submissions[index] = {
        ...existing,
        studentName: studentName ? String(studentName).trim() : existing.studentName,
        answers: answers ? { ...existing.answers, ...answers } : existing.answers,
        reviewNotes: reviewNotes !== undefined ? String(reviewNotes) : existing.reviewNotes,
        grade: grade !== undefined ? String(grade) : existing.grade,
        status: status || (reviewNotes || grade ? 'reviewed' : existing.status)
      };

      saveSubmissions(submissions);
      res.json(submissions[index]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update submission' });
    }
  });

  // DELETE single submission
  app.delete('/api/submissions/:id', (req, res) => {
    try {
      const submissions = getSubmissions();
      const filtered = submissions.filter(s => s.id !== req.params.id);
      if (filtered.length === submissions.length) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      saveSubmissions(filtered);
      res.json({ success: true, message: 'Submission deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete submission' });
    }
  });

  // POST seed sample data
  app.post('/api/submissions/seed', (req, res) => {
    try {
      const existing = getSubmissions();
      // Add samples if not already present
      const sampleIds = new Set(SAMPLE_SUBMISSIONS.map(s => s.id));
      const filtered = existing.filter(s => !sampleIds.has(s.id));
      const combined = [...SAMPLE_SUBMISSIONS, ...filtered];
      saveSubmissions(combined);
      res.json({ success: true, count: combined.length, message: 'Sample submissions added' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to seed sample data' });
    }
  });

  // POST clear submissions
  app.post('/api/submissions/clear', (req, res) => {
    try {
      saveSubmissions([]);
      res.json({ success: true, message: 'All submissions cleared' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to clear submissions' });
    }
  });

  // GET export as CSV
  app.get('/api/export/csv', (req, res) => {
    try {
      const submissions = getSubmissions();
      submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      const headers = [
        'Submission ID',
        'Submission Date & Time (UTC)',
        'Student Name',
        'Status',
        'Grade',
        'Instructor Notes',
        'Q1: What decision(s) are they trying to make?',
        'Q2: What is the problem identified by coaches/scouts? by Billy Beane?',
        'Q3: What is the level of employee participation?',
        'Q4: What are the causes of the problem do they identify from the discussion?',
        'Q5: What are the objectives set by GM/coaches/scouts & criteria (must & want)?',
        'Q6: What are the alternative solutions generated from the discussion?',
        'Q7: Is Billy Beane’s decision programmed or nonprogrammed? Why?',
        'Q8: What methods are they using for groupthink?',
        'Q9: What technology and information are they using to help make the decision?'
      ];

      const csvRows = [headers.map(escapeCsvField).join(',')];

      for (const sub of submissions) {
        const row = [
          sub.id,
          sub.submittedAt,
          sub.studentName,
          sub.status || 'submitted',
          sub.grade || '',
          sub.reviewNotes || '',
          sub.answers?.q1 || '',
          sub.answers?.q2 || '',
          sub.answers?.q3 || '',
          sub.answers?.q4 || '',
          sub.answers?.q5 || '',
          sub.answers?.q6 || '',
          sub.answers?.q7 || '',
          sub.answers?.q8 || '',
          sub.answers?.q9 || '',
        ];
        csvRows.push(row.map(escapeCsvField).join(','));
      }

      // Add UTF-8 BOM for Microsoft Excel compatibility
      const csvContent = '\uFEFF' + csvRows.join('\r\n');
      const filename = `moneyball_case_study_submissions_${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvContent);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      res.status(500).json({ error: 'Failed to export CSV' });
    }
  });

  // GET export as JSON
  app.get('/api/export/json', (req, res) => {
    try {
      const submissions = getSubmissions();
      const filename = `moneyball_case_study_submissions_${new Date().toISOString().slice(0, 10)}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(JSON.stringify(submissions, null, 2));
    } catch (err) {
      res.status(500).json({ error: 'Failed to export JSON' });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Moneyball Case Study Portal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
