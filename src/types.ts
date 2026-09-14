export interface QuestionDef {
  id: string;
  number: number;
  title: string;
  hint: string;
  placeholder?: string;
}

export const MONEYBALL_QUESTIONS: QuestionDef[] = [
  {
    id: 'q1',
    number: 1,
    title: 'What decision(s) are they trying to make?',
    hint: 'Identify the fundamental decision confronting the Oakland Athletics management, Billy Beane, and the scouting staff regarding team composition, budget limits, and competing in the upcoming season.',
    placeholder: 'Explain the core decision(s) Oakland A\'s leadership must make...'
  },
  {
    id: 'q2',
    number: 2,
    title: 'What is the problem identified by the coaches/scouts? by Billy Beane?',
    hint: 'Contrast the scouts\' view (e.g., replacing lost star players like Jason Giambi, Johnny Damon, and Jason Isringhausen like-for-like) versus Billy Beane\'s view of the systemic problem.',
    placeholder: 'Detail the problem from the scouts\' perspective, and how Billy Beane frames the problem differently...'
  },
  {
    id: 'q3',
    number: 3,
    title: 'What is the level of employee participation?',
    hint: 'Evaluate how much real influence employees (scouts, front office staff, manager Art Howe, assistant Peter Brand) have in the decision-making process (autocratic, consultative, joint, delegative).',
    placeholder: 'Analyze the participation levels of scouts, coaches, and Peter Brand in the discussion and final call...'
  },
  {
    id: 'q4',
    number: 4,
    title: 'What are the causes of the problem do they identify from the discussion?',
    hint: 'Identify root causes brought up: extreme payroll and revenue disparities, small-market financial constraints, flawed traditional evaluation metrics, and institutional bias in baseball.',
    placeholder: 'Discuss the underlying causes identified during the meetings and debates...'
  },
  {
    id: 'q5',
    number: 5,
    title: 'What are the objectives set by the GM/coaches/scouts and what are the criteria they are using to accomplish the objectives? (must & want)',
    hint: 'Distinguish between the essential "must" criteria (e.g., stay within $40M payroll cap, win ~99 games to make playoffs) and "want" criteria (e.g., subjective player traits, traditional aesthetics, clubhouse fit).',
    placeholder: 'Break down the objectives and categorize the criteria into "must" criteria and "want" criteria...'
  },
  {
    id: 'q6',
    number: 6,
    title: 'What are the alternative solutions generated from the discussion?',
    hint: 'Outline the various options considered: conventional scouting of aging veterans, trying to find cheaper lookalikes, or rebuilding the team formula around buying on-base percentage and runs.',
    placeholder: 'Describe the alternatives proposed by the traditional scouts vs. the sabermetric alternative...'
  },
  {
    id: 'q7',
    number: 7,
    title: 'Is Billy Beane’s decision programmed or nonprogrammed? Why?',
    hint: 'Define whether this decision fits a programmed decision (routine, rule-based, repetitive) or a nonprogrammed decision (novel, ill-structured, high risk and ambiguity), providing conceptual justification.',
    placeholder: 'State whether it is programmed or nonprogrammed, defining the concept and explaining why with examples from the case...'
  },
  {
    id: 'q8',
    number: 8,
    title: 'What methods are they using for groupthink?',
    hint: 'Point out manifestations and mechanisms of groupthink among the veteran scouting staff: conformity, reliance on traditional lore, stereotyping outsiders, peer pressure against dissenters, and shared illusions.',
    placeholder: 'Examine the signs and symptoms of groupthink evident in the scouting room meetings...'
  },
  {
    id: 'q9',
    number: 9,
    title: 'What technology and information are they using to help make the decision?',
    hint: 'Examine the specific data sources, computer databases, statistical models (sabermetrics / Bill James formulas, on-base percentage), and digital tools introduced by Peter Brand.',
    placeholder: 'Detail the information systems, computer analysis, and statistical data used to evaluate players...'
  }
];

export interface StudentSubmission {
  id: string;
  studentName: string;
  submittedAt: string; // ISO date string
  answers: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
    q6: string;
    q7: string;
    q8: string;
    q9: string;
    [key: string]: string;
  };
  reviewNotes?: string;
  grade?: string;
  status?: 'submitted' | 'reviewed';
}

export type ViewMode = 'student-form' | 'instructor-review';
