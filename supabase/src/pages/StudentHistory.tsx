import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAssignments } from '@/contexts/AssignmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentHistory: React.FC = () => {
  const { user } = useAuth();
  const { assignments, getSubmissionsByStudent } = useAssignments();
  const userSubmissions = getSubmissionsByStudent(user?.id || '');

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

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/student/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Assignment History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>Complete history of your assignment submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {userSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No submissions yet.</p>
              <Link to="/student/dashboard" className="mt-4 inline-block">
                <Button>View Active Assignments</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userSubmissions
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .map((submission) => {
                  const assignment = assignments.find(a => a.id === submission.assignmentId);
                  if (!assignment) return null;

                  return (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{assignment.title}</h3>
                          <p className="text-muted-foreground mb-3">{assignment.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Deadline:</span>
                              <p>{assignment.deadline}</p>
                            </div>
                            <div>
                              <span className="font-medium">Submitted:</span>
                              <p>{submission.submittedAt}</p>
                            </div>
                            <div>
                              <span className="font-medium">File:</span>
                              <p className="truncate">{submission.fileName}</p>
                            </div>
                            <div>
                              <span className="font-medium">Status:</span>
                              <div className="flex items-center space-x-1 mt-1">
                                <Badge variant={getStatusColor(submission.status)}>
                                  {getStatusIcon(submission.status)}
                                  <span className="ml-1 capitalize">{submission.status}</span>
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {submission.grade !== undefined && (
                            <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Grade:</span>
                                <span className={`text-lg font-bold ${getGradeColor(submission.grade)}`}>
                                  {submission.grade}/100
                                </span>
                              </div>
                              {submission.feedback && (
                                <div>
                                  <span className="font-medium">Feedback:</span>
                                  <p className="text-sm mt-1">{submission.feedback}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex flex-col space-y-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Link to={`/assignment/${assignment.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {userSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{userSubmissions.length}</p>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {userSubmissions.filter(s => s.status === 'graded').length}
                </p>
                <p className="text-sm text-muted-foreground">Graded</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {userSubmissions.filter(s => s.status === 'submitted').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {userSubmissions.filter(s => s.status === 'late').length}
                </p>
                <p className="text-sm text-muted-foreground">Late</p>
              </div>
            </div>
            
            {userSubmissions.filter(s => s.grade !== undefined).length > 0 && (
              <div className="mt-4 pt-4 border-t text-center">
                <p className="text-2xl font-bold">
                  {(
                    userSubmissions
                      .filter(s => s.grade !== undefined)
                      .reduce((sum, s) => sum + (s.grade || 0), 0) /
                    userSubmissions.filter(s => s.grade !== undefined).length
                  ).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Average Grade</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentHistory;