import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAssignments } from '@/contexts/AssignmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, FileText, Upload, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const AssignmentDetails: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { user } = useAuth();
  const { getAssignmentById, getSubmissionsByStudent } = useAssignments();
  
  const assignment = assignmentId ? getAssignmentById(assignmentId) : null;
  const userSubmissions = getSubmissionsByStudent(user?.id || '');
  const submission = userSubmissions.find(s => s.assignmentId === assignmentId);

  if (!assignment) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Assignment Not Found</h2>
        <Link to={user?.role === 'student' ? '/student/dashboard' : '/instructor/dashboard'}>
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isOverdue = new Date() > new Date(assignment.deadline);
  const canSubmit = user?.role === 'student' && !submission;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to={user?.role === 'student' ? '/student/dashboard' : '/instructor/dashboard'}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Assignment Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {assignment.description}
              </CardDescription>
            </div>
            
            <div className="flex flex-col space-y-2">
              {isOverdue && <Badge variant="destructive">Overdue</Badge>}
              {submission && (
                <Badge 
                  variant={
                    submission.status === 'graded' ? 'default' :
                    submission.status === 'late' ? 'destructive' : 'secondary'
                  }
                >
                  {submission.status}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Assignment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{assignment.createdAt}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Deadline</p>
                  <p className={`text-sm ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                    {assignment.deadline}
                    {isOverdue && ' (Overdue)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Student's submission status */}
            {user?.role === 'student' && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-secondary/20">
                  <h4 className="font-medium mb-2">Your Submission</h4>
                  {submission ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{submission.fileName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {submission.submittedAt}
                      </p>
                      {submission.grade !== undefined && (
                        <div className="mt-3 p-3 bg-background border rounded">
                          <p className="font-medium">Grade: {submission.grade}/100</p>
                          {submission.feedback && (
                            <div className="mt-2">
                              <p className="font-medium">Feedback:</p>
                              <p className="text-sm mt-1">{submission.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="mt-2">
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-3">Not submitted yet</p>
                      {canSubmit && (
                        <Link to={`/student/upload/${assignment.id}`}>
                          <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Submit Assignment
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-4 pt-4 border-t">
            {user?.role === 'student' && canSubmit && (
              <Link to={`/student/upload/${assignment.id}`}>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Assignment
                </Button>
              </Link>
            )}
            
            {user?.role === 'student' && (
              <Link to="/student/history">
                <Button variant="outline">
                  View All Submissions
                </Button>
              </Link>
            )}
            
            {user?.role === 'instructor' && (
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View All Submissions
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructor view: Assignment statistics */}
      {user?.role === 'instructor' && (
        <Card>
          <CardHeader>
            <CardTitle>Submission Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-sm text-muted-foreground">Graded</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">0</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">0</p>
                <p className="text-sm text-muted-foreground">Late Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignmentDetails;