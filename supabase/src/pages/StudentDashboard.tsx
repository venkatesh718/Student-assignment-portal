import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAssignments } from '@/contexts/AssignmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Upload, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isAfter, parseISO } from 'date-fns';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { assignments, getSubmissionsByStudent, isSubmissionAllowed, hasStudentSubmitted } = useAssignments();
  const userSubmissions = getSubmissionsByStudent(user?.id || '');

  const getSubmissionStatus = (assignmentId: string) => {
    const submission = userSubmissions.find(s => s.assignmentId === assignmentId);
    if (!submission) return 'not_submitted';
    return submission.status;
  };

  const getSubmissionGrade = (assignmentId: string) => {
    const submission = userSubmissions.find(s => s.assignmentId === assignmentId);
    return submission?.grade;
  };

  const checkIfOverdue = (deadline: string) => {
    return isAfter(new Date(), parseISO(deadline));
  };

  const formatDeadline = (deadline: string) => {
    return format(parseISO(deadline), 'dd-MM-yyyy');
  };

  const activeAssignments = assignments.filter(assignment => {
    const status = getSubmissionStatus(assignment.id);
    return status === 'not_submitted' || status === 'submitted';
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <CheckCircle className="h-4 w-4" />;
      case 'submitted':
        return <Clock className="h-4 w-4" />;
      case 'late':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'default';
      case 'submitted':
        return 'secondary';
      case 'late':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <Link to="/student/history">
          <Button variant="outline">View History</Button>
        </Link>
      </div>

      {/* Active Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Active Assignments</CardTitle>
          <CardDescription>Assignments that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          {activeAssignments.length === 0 ? (
            <p className="text-muted-foreground">No active assignments at the moment.</p>
          ) : (
            <div className="space-y-4">
              {activeAssignments.map((assignment) => {
                const status = getSubmissionStatus(assignment.id);
                
                const overdue = checkIfOverdue(assignment.deadline);
                const submissionAllowed = isSubmissionAllowed(assignment.id);
                const alreadySubmitted = hasStudentSubmitted(assignment.id, user?.id || '');
                
                return (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover-scale">
                    <div className="flex-1">
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1 text-sm">
                          <Clock className="h-4 w-4" />
                          <span className={overdue ? 'overdue-text' : ''}>
                            Due: {formatDeadline(assignment.deadline)}
                          </span>
                        </div>
                        {overdue && status === 'not_submitted' && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                        {!submissionAllowed && !alreadySubmitted && (
                          <Badge variant="destructive">Submission Closed</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(status)}>
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
                      </Badge>
                      
                      {status === 'not_submitted' && submissionAllowed && (
                        <Link to={`/student/upload/${assignment.id}`}>
                          <Button size="sm" className="hover-scale">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        </Link>
                      )}
                      
                      {alreadySubmitted && submissionAllowed && (
                        <Link to={`/student/upload/${assignment.id}`}>
                          <Button size="sm" variant="outline" className="hover-scale">
                            <Upload className="h-4 w-4 mr-2" />
                            Resubmit
                          </Button>
                        </Link>
                      )}
                      
                      <Link to={`/assignment/${assignment.id}`}>
                        <Button variant="outline" size="sm" className="hover-scale">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Your latest assignment submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {userSubmissions.length === 0 ? (
            <p className="text-muted-foreground">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {userSubmissions.slice(-5).reverse().map((submission) => {
                const assignment = assignments.find(a => a.id === submission.assignmentId);
                return (
                  <div key={submission.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{assignment?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {formatDeadline(submission.submittedAt)}
                      </p>
                      {submission.feedback && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <strong>Feedback:</strong> {submission.feedback}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {submission.grade && (
                        <Badge variant="default" className="success-indicator">
                          Grade: {submission.grade}/100
                        </Badge>
                      )}
                      <Badge variant={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1 capitalize">{submission.status}</span>
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;