import React from 'react';
import { useAssignments } from '@/contexts/AssignmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Users, FileText, Calendar, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstructorAssignments: React.FC = () => {
  const { assignments, getSubmissionsByAssignment } = useAssignments();

  const getSubmissionStats = (assignmentId: string) => {
    const assignmentSubmissions = getSubmissionsByAssignment(assignmentId);
    const total = assignmentSubmissions.length;
    const graded = assignmentSubmissions.filter(s => s.status === 'graded').length;
    const pending = assignmentSubmissions.filter(s => s.status === 'submitted' || s.status === 'late').length;
    
    return { total, graded, pending };
  };

  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/instructor/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">All Assignments</h1>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Assignment
        </Button>
      </div>

      <div className="grid gap-6">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
              <p className="text-muted-foreground mb-4">Create your first assignment to get started.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedAssignments.map((assignment) => {
            const stats = getSubmissionStats(assignment.id);
            const isOverdue = new Date() > new Date(assignment.deadline);
            const submissions = getSubmissionsByAssignment(assignment.id);

            return (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{assignment.title}</CardTitle>
                      <CardDescription className="mt-2">{assignment.description}</CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                      {stats.pending > 0 && (
                        <Badge variant="secondary">{stats.pending} pending review</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Assignment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">Created:</span>
                        <p>{assignment.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">Deadline:</span>
                        <p className={isOverdue ? 'text-destructive font-semibold' : ''}>
                          {assignment.deadline}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">Submissions:</span>
                        <p>{stats.total} total, {stats.graded} graded</p>
                      </div>
                    </div>
                  </div>

                  {/* Submissions Table */}
                  {submissions.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-secondary/50 px-4 py-2 border-b">
                        <h4 className="font-medium">Recent Submissions</h4>
                      </div>
                      <div className="divide-y">
                        {submissions.slice(-3).map((submission) => (
                          <div key={submission.id} className="flex items-center justify-between p-3">
                            <div className="flex-1">
                              <p className="font-medium">{submission.studentName}</p>
                              <p className="text-sm text-muted-foreground">
                                {submission.fileName} • {submission.submittedAt}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {submission.grade !== undefined && (
                                <Badge variant="default">
                                  Grade: {submission.grade}/100
                                </Badge>
                              )}
                              <Badge 
                                variant={
                                  submission.status === 'graded' ? 'default' :
                                  submission.status === 'late' ? 'destructive' : 'secondary'
                                }
                              >
                                {submission.status}
                              </Badge>
                              {submission.status !== 'graded' && (
                                <Link to={`/instructor/review/${submission.id}`}>
                                  <Button size="sm" variant="outline">
                                    Review
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {submissions.length > 3 && (
                          <div className="p-3 text-center">
                            <Button variant="outline" size="sm">
                              View All {submissions.length} Submissions
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {submissions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p>No submissions yet</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Assignment
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                    
                    {stats.pending > 0 && (
                      <Button size="sm">
                        Review {stats.pending} Pending Submission{stats.pending > 1 ? 's' : ''}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InstructorAssignments;