import React, { useState } from 'react';
import { useAssignments } from '@/contexts/AssignmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Users, Clock, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO, isAfter } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const InstructorDashboard: React.FC = () => {
  const { assignments, submissions, createAssignment, updateAssignment, deleteAssignment, getSubmissionsByAssignment } = useAssignments();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    deadline: '',
    instructorId: 'instructor1', // Mock instructor ID
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    createAssignment(newAssignment);
    setNewAssignment({ title: '', description: '', deadline: '', instructorId: 'instructor1' });
    setIsCreating(false);
    toast({
      title: "Assignment Created",
      description: "The assignment has been successfully created and is now available to students.",
      className: "success-indicator",
    });
  };

  const handleEditAssignment = (assignmentId: string, updates: Partial<typeof newAssignment>) => {
    updateAssignment(assignmentId, updates);
    setEditingAssignment(null);
    toast({
      title: "Assignment Updated",
      description: "The assignment has been successfully updated.",
      className: "success-indicator",
    });
  };

  const handleDeleteAssignment = (assignmentId: string, assignmentTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${assignmentTitle}"? This action cannot be undone.`)) {
      deleteAssignment(assignmentId);
      toast({
        title: "Assignment Deleted",
        description: "The assignment and all its submissions have been deleted.",
        variant: "destructive",
      });
    }
  };

  const isOverdue = (deadline: string) => {
    return isAfter(new Date(), parseISO(deadline));
  };

  const formatDeadline = (deadline: string) => {
    return format(parseISO(deadline), 'dd-MM-yyyy');
  };

  const getSubmissionStats = (assignmentId: string) => {
    const assignmentSubmissions = getSubmissionsByAssignment(assignmentId);
    const total = assignmentSubmissions.length;
    const graded = assignmentSubmissions.filter(s => s.status === 'graded').length;
    const pending = assignmentSubmissions.filter(s => s.status === 'submitted' || s.status === 'late').length;
    
    return { total, graded, pending };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
        <div className="space-x-2">
          <Link to="/instructor/assignments">
            <Button variant="outline">View All Assignments</Button>
          </Link>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Create Assignment Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
            <CardDescription>Add a new assignment for your students</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" className="hover-scale">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)} className="hover-scale">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Submissions Requiring Review */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions Pending Review</CardTitle>
          <CardDescription>Student submissions waiting for your feedback</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.filter(s => s.status === 'submitted' || s.status === 'late').length === 0 ? (
            <p className="text-muted-foreground">No submissions pending review.</p>
          ) : (
            <div className="space-y-3">
              {submissions
                .filter(s => s.status === 'submitted' || s.status === 'late')
                .map((submission) => {
                  const assignment = assignments.find(a => a.id === submission.assignmentId);
                  return (
                    <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{assignment?.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Student: {submission.studentName} • Submitted: {formatDeadline(submission.submittedAt)}
                        </p>
                        <p className="text-sm text-muted-foreground">File: {submission.fileName}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={submission.status === 'late' ? 'destructive' : 'secondary'}>
                          {submission.status}
                        </Badge>
                        <Link to={`/instructor/review/${submission.id}`}>
                          <Button size="sm" className="hover-scale">Review & Grade</Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assignments</CardTitle>
          <CardDescription>Overview of all assignments and their submission status</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-muted-foreground">No assignments created yet.</p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const stats = getSubmissionStats(assignment.id);
                const overdue = isOverdue(assignment.deadline);
                
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
                        <div className="flex items-center space-x-1 text-sm">
                          <Users className="h-4 w-4" />
                          <span>{stats.total} submissions</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm success-indicator">
                          <FileText className="h-4 w-4" />
                          <span>{stats.graded} graded</span>
                        </div>
                        {overdue && <Badge variant="destructive">Overdue</Badge>}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {stats.pending > 0 && (
                        <Badge variant="secondary">{stats.pending} pending</Badge>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover-scale"
                        onClick={() => {
                          const updatedTitle = prompt('Enter new title:', assignment.title);
                          const updatedDescription = prompt('Enter new description:', assignment.description);
                          const updatedDeadline = prompt('Enter new deadline (YYYY-MM-DD):', assignment.deadline);
                          
                          if (updatedTitle && updatedDescription && updatedDeadline) {
                            handleEditAssignment(assignment.id, {
                              title: updatedTitle,
                              description: updatedDescription,
                              deadline: updatedDeadline
                            });
                          }
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover-scale"
                        onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
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

export default InstructorDashboard;