export interface ProjectConfig {
  universityName: string;
  universityShortName: string;
  schoolName: string;
  projectCategory: string;
  projectTitle: string;
  projectTitleLines: readonly [string, string];
  courseName: string;
  courseCode: string;
  studentName: string;
  rollNumber: string;
  submissionType: string;
  academicTerm: string;
}

export const INTRO_SESSION_STORAGE_KEY = 'hack_computer_lab_intro_seen';

export const PROJECT_CONFIG: ProjectConfig = {
  universityName: 'K.R. Mangalam University',
  universityShortName: 'KRMU',
  schoolName: 'School of Engineering & Technology',
  projectCategory: 'Capstone Project',
  projectTitle: 'Make the Computer Draw a Box',
  projectTitleLines: ['MAKE THE COMPUTER', 'DRAW A BOX'],
  courseName: 'Nand to Tetris – I',
  courseCode: 'ETCNTC301',
  studentName: 'Prithvi Saini',
  // Set your official University Roll Number here; if left empty, an editable placeholder is displayed.
  rollNumber: '2501730041',
  submissionType: 'Academic Project | Individual Submission',
  academicTerm: '2026–2027',
};

export function getConfiguredRollNumber(): { value: string; isPlaceholder: boolean } {
  const trimmed = PROJECT_CONFIG.rollNumber?.trim();
  if (!trimmed) {
    return {
      value: '[ROLL NUMBER — SET IN src/config/project.ts]',
      isPlaceholder: true,
    };
  }
  return {
    value: trimmed,
    isPlaceholder: false,
  };
}
