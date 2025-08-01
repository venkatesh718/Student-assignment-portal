import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  instructorId: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  fileName: string;
  fileUrl: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late';
  grade?: number;
  feedback?: string;
}

interface AssignmentContextType {
  assignments: Assignment[];
  submissions: Submission[];
  createAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  submitAssignment: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => void;
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => void;
  getAssignmentById: (id: string) => Assignment | undefined;
  getSubmissionsByAssignment: (assignmentId: string) => Submission[];
  getSubmissionsByStudent: (studentId: string) => Submission[];
  isSubmissionAllowed: (assignmentId: string) => boolean;
  hasStudentSubmitted: (assignmentId: string, studentId: string) => boolean;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export const useAssignments = () => {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error('useAssignments must be used within an AssignmentProvider');
  }
  return context;
};

interface AssignmentProviderProps {
  children: ReactNode;
}

export const AssignmentProvider: React.FC<AssignmentProviderProps> = ({ children }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      title: 'Math Assignment 1',
      description: 'Complete exercises 1-10 from chapter 3',
      deadline: '2024-08-15',
      instructorId: 'instructor1',
      createdAt: '2024-07-20',
    },
    {
      id: '2',
      title: 'Science Lab Report',
      description: 'Write a lab report on the chemical reactions experiment',
      deadline: '2024-08-20',
      instructorId: 'instructor1',
      createdAt: '2024-07-22',
    },
  ]);

  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: '1',
      assignmentId: '1',
      studentId: 'student1',
      studentName: 'John Doe',
      fileName: 'math-assignment-1.pdf',
      fileUrl: '#',
      submittedAt: '2024-08-14',
      status: 'graded',
      grade: 85,
      feedback: 'Good work! Pay attention to question 7.',
    },
  ]);

  const createAssignment = (assignmentData: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAssignments(prev => [...prev, newAssignment]);
  };

  const submitAssignment = (submissionData: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => {
    const assignment = assignments.find(a => a.id === submissionData.assignmentId);
    const isLate = assignment && new Date() > new Date(assignment.deadline);
    
    const newSubmission: Submission = {
      ...submissionData,
      id: Math.random().toString(36).substr(2, 9),
      submittedAt: new Date().toISOString().split('T')[0],
      status: isLate ? 'late' : 'submitted',
    };
    setSubmissions(prev => [...prev, newSubmission]);
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === id ? { ...assignment, ...updates } : assignment
      )
    );
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== id));
    setSubmissions(prev => prev.filter(submission => submission.assignmentId !== id));
  };

  const gradeSubmission = (submissionId: string, grade: number, feedback: string) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === submissionId
          ? { ...sub, grade, feedback, status: 'graded' as const }
          : sub
      )
    );
  };

  const getAssignmentById = (id: string) => assignments.find(a => a.id === id);
  
  const getSubmissionsByAssignment = (assignmentId: string) =>
    submissions.filter(s => s.assignmentId === assignmentId);
  
  const getSubmissionsByStudent = (studentId: string) =>
    submissions.filter(s => s.studentId === studentId);

  const isSubmissionAllowed = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return false;
    return new Date() <= new Date(assignment.deadline);
  };

  const hasStudentSubmitted = (assignmentId: string, studentId: string) => {
    return submissions.some(s => s.assignmentId === assignmentId && s.studentId === studentId);
  };

  const value: AssignmentContextType = {
    assignments,
    submissions,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    gradeSubmission,
    getAssignmentById,
    getSubmissionsByAssignment,
    getSubmissionsByStudent,
    isSubmissionAllowed,
    hasStudentSubmitted,
  };

  return <AssignmentContext.Provider value={value}>{children}</AssignmentContext.Provider>;
};